'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  getMockDefaults,
  fetchQuestionsForSession,
  fetchFreePoolQuestions,
  createExamSession,
  getSessionById,
  getSessionQuestionsWithStatus,
  isSessionExpired,
  getFirstMockQuestions,
} from '@/lib/practice'
import { hasExamAccess, getUsageCounters, getFreeMockAttempts } from '@/lib/entitlements'

interface CreateSessionParams {
  examId: string
  examSlug: string
  subjectIds: string[]
  questionCount: number
  difficulty: string | null
  mode: 'practice' | 'mock'
}

interface SessionQuestion {
  id: string
  subjectId: string
  questionText: string
  options: { key: string; text: string }[]
}

async function fetchWeightedQuestions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  examId: string,
  subjectIds: string[],
  totalCount: number,
  seed: string,
): Promise<SessionQuestion[]> {
  const { data: weighting } = await supabase
    .from('app_config')
    .select('value')
    .eq('key', 'subject_weighting')
    .single()

  const rawWeighting = weighting?.value as Record<string, number> | undefined

  if (!rawWeighting) {
    return fetchQuestionsForSession({ examId, subjectIds, questionCount: totalCount, difficulty: null, mode: 'mock' }, seed)
  }

  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, slug')
    .in('id', subjectIds)

  const slugMap: Record<string, string> = {}
  for (const s of subjects ?? []) {
    slugMap[s.id] = s.slug
  }

  const allQuestions: SessionQuestion[] = []
  let remainingCount = totalCount

  for (let i = 0; i < subjectIds.length; i++) {
    const subjectId = subjectIds[i]!
    const slug = slugMap[subjectId]
    const weight = slug ? (rawWeighting[slug] ?? Math.floor(totalCount / subjectIds.length)) : Math.floor(totalCount / subjectIds.length)
    const count = i < subjectIds.length - 1 ? weight : remainingCount

    if (count <= 0) continue

    const { data: questions } = await supabase.rpc('get_session_questions', {
      p_exam_id: examId,
      p_subject_ids: [subjectId],
      p_difficulty: null,
      p_limit: count,
      p_seed: seed,
    })

    if (questions) {
      allQuestions.push(...(questions as SessionQuestion[]))
      remainingCount -= questions.length
    }
  }

  if (allQuestions.length === 0) {
    throw new Error('No questions match the selected filters')
  }

  return allQuestions
}

export async function createSession(params: CreateSessionParams) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const hasAccess = await hasExamAccess(user.id, params.examId)

  if (!hasAccess && params.mode === 'mock') {
    const freeMockAttempts = await getFreeMockAttempts(params.examSlug)
    const { data: allowed, error: freeMockError } = await supabase.rpc('try_start_free_mock', {
      p_user_id: user.id,
      p_exam_id: params.examId,
      p_max_mocks: freeMockAttempts,
    })

    if (freeMockError) throw new Error(freeMockError.message)

    if (!allowed) {
      throw new Error(`Free tier limited to ${freeMockAttempts} mock${freeMockAttempts === 1 ? '' : 's'} per exam. Upgrade to Pro for unlimited mocks.`)
    }
  }

  const isFreeMock = !hasAccess && params.mode === 'mock'

  let timeLimitSeconds: number | null = null
  let effectiveCount = params.questionCount

  if (params.mode === 'mock') {
    const mockDefaults = await getMockDefaults(params.examSlug)
    if (mockDefaults) {
      if (mockDefaults.time_limit_seconds !== null) {
        timeLimitSeconds = mockDefaults.time_limit_seconds
      }
      if (mockDefaults.question_count !== null) {
        effectiveCount = mockDefaults.question_count
      }
    }
  }

  let subjectIds = params.subjectIds

  if (subjectIds.length === 0 && params.mode === 'mock') {
    const { data: examSubjects } = await supabase
      .from('exam_subjects')
      .select('subject_id')
      .eq('exam_id', params.examId)

    subjectIds = (examSubjects ?? []).map((es: { subject_id: string }) => es.subject_id)
  }

  const session = await createExamSession(user.id, params.examId, params.mode, timeLimitSeconds)

  let questions: SessionQuestion[]

  if (isFreeMock) {
    const counter = await getUsageCounters(user.id, params.examId)
    if (counter.free_mocks_started > 1) {
      questions = await getFirstMockQuestions(user.id, params.examId)
    } else {
      questions = subjectIds.length > 1
        ? await fetchWeightedQuestions(supabase, params.examId, subjectIds, effectiveCount, session.id)
        : await fetchQuestionsForSession(
            { ...params, subjectIds, questionCount: effectiveCount },
            session.id
          )
    }
  } else if (!hasAccess && params.mode === 'practice') {
    questions = await fetchFreePoolQuestions(user.id, params.examId, subjectIds, effectiveCount, session.id)
  } else if (params.mode === 'mock' && params.examSlug === 'jamb') {
    const mockDefaults = await getMockDefaults('jamb')
    const roles = mockDefaults?.subject_roles
    if (!roles) {
      questions = await fetchWeightedQuestions(supabase, params.examId, subjectIds, effectiveCount, session.id)
    } else {
      const { data: englishSubject } = await supabase
        .from('subjects')
        .select('id')
        .eq('slug', 'english')
        .single()

      if (!englishSubject) throw new Error('English subject not found')

      const englishId = englishSubject.id
      const englishCount = roles.english ?? 60
      const electiveCount = roles.elective ?? 40
      const electiveIds = subjectIds.filter((id: string) => id !== englishId)

      const allQuestions: SessionQuestion[] = []

      const { data: englishQs } = await supabase.rpc('get_session_questions', {
        p_exam_id: params.examId,
        p_subject_ids: [englishId],
        p_difficulty: null,
        p_limit: englishCount,
        p_seed: session.id,
      })

      if (englishQs) allQuestions.push(...(englishQs as SessionQuestion[]))

      for (const electiveId of electiveIds) {
        const { data: electiveQs } = await supabase.rpc('get_session_questions', {
          p_exam_id: params.examId,
          p_subject_ids: [electiveId],
          p_difficulty: null,
          p_limit: electiveCount,
          p_seed: session.id,
        })
        if (electiveQs) allQuestions.push(...(electiveQs as SessionQuestion[]))
      }

      if (allQuestions.length === 0) throw new Error('No questions match the selected filters')
      questions = allQuestions
    }
  } else {
    questions = subjectIds.length > 1 && params.mode === 'mock'
      ? await fetchWeightedQuestions(supabase, params.examId, subjectIds, effectiveCount, session.id)
      : await fetchQuestionsForSession(
          { ...params, subjectIds, questionCount: effectiveCount },
          session.id
        )
  }

  const rows = questions.map((q) => ({
    session_id: session.id,
    question_id: q.id,
  }))
  const { error: answersError } = await supabase.from('session_answers').insert(rows)
  if (answersError) {
    await supabase.from('exam_sessions').delete().eq('id', session.id)
    throw new Error('Failed to initialize session answers')
  }

  revalidatePath('/practice')

  return {
    sessionId: session.id,
    questions: questions.map((q) => ({
      id: q.id,
      subjectId: q.subjectId,
      questionText: q.questionText,
      options: q.options,
    })),
    mode: params.mode,
    timeLimitSeconds,
    startedAt: session.started_at,
  }
}

export async function submitAnswer(
  sessionId: string,
  questionId: string,
  selectedAnswer: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const session = await getSessionById(sessionId)
  if (session.user_id !== user.id) throw new Error('Session does not belong to user')
  if (session.status !== 'in_progress') throw new Error('Session is not active')

  if (session.mode === 'mock' && isSessionExpired(session.started_at, session.time_limit_seconds)) {
    throw new Error('Time has expired for this session')
  }

  const { data: isCorrect, error: answerError } = await supabase.rpc('record_session_answer', {
    p_session_id: sessionId,
    p_question_id: questionId,
    p_selected_answer: selectedAnswer,
  })
  if (answerError || typeof isCorrect !== 'boolean') throw new Error('Failed to record answer')

  if (session.mode === 'practice') {
    await supabase.rpc('update_streak', { p_user_id: user.id })

    const { data: reveal, error: revealError } = await supabase.rpc('get_session_answer_reveal', {
      p_session_id: sessionId,
      p_question_id: questionId,
    })
    const revealRow = Array.isArray(reveal) ? reveal[0] : null
    if (revealError || !revealRow) throw new Error('Failed to load answer feedback')

    return {
      isCorrect,
      correctAnswer: revealRow.correct_answer,
      explanation: revealRow.explanation,
    }
  }

  return { isCorrect }
}

export async function completeMockSession(sessionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const session = await getSessionById(sessionId)
  if (session.user_id !== user.id) throw new Error('Session does not belong to user')
  if (session.status !== 'in_progress') throw new Error('Session is not active')
  if (session.mode !== 'mock') throw new Error('Session is not a mock exam')
  const expired = isSessionExpired(session.started_at, session.time_limit_seconds)

  const { data: completion, error: completionError } = await supabase.rpc('complete_mock_session', {
    p_session_id: sessionId,
  })
  const completionRow = Array.isArray(completion) ? completion[0] : null
  if (completionError || !completionRow) throw new Error('Failed to complete session')

  await supabase.rpc('update_streak', { p_user_id: user.id })

  revalidatePath('/practice')
  revalidatePath(`/practice/session/${sessionId}`)

  const totalQuestions = Object.values(completionRow.performance_by_subject as Record<string, { total: number }>)
    .reduce((total, subject) => total + subject.total, 0)
  return { score: completionRow.score, accuracy: completionRow.accuracy, totalQuestions, timedOut: expired }
}

export async function loadSessionData(sessionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const session = await getSessionById(sessionId)
  if (session.user_id !== user.id) throw new Error('Session does not belong to user')
  if (session.status !== 'in_progress') throw new Error('Session is not active')

  const questions = await getSessionQuestionsWithStatus(sessionId)
  const mapped = questions.map((q) => ({
    id: q.questionId,
    subjectId: q.subjectId,
    questionText: q.questionText,
    options: q.options,
    selectedAnswer: q.selectedAnswer,
  }))

  return {
    id: session.id,
    mode: session.mode,
    status: session.status,
    startedAt: session.started_at,
    timeLimitSeconds: session.time_limit_seconds,
    questions: mapped,
  }
}

export async function getSessionResults(sessionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const session = await getSessionById(sessionId)
  if (session.user_id !== user.id) throw new Error('Session does not belong to user')
  if (session.status !== 'completed') throw new Error('Session is not completed')

  const { data: result } = await supabase
    .from('results')
    .select('*')
    .eq('session_id', sessionId)
    .single()

  if (!result) throw new Error('Results not found')

  const startedAt = new Date(session.started_at).getTime()
  const completedAt = session.completed_at ? new Date(session.completed_at).getTime() : Date.now()

  const { data: exam } = await supabase
    .from('exams')
    .select('name, slug')
    .eq('id', session.exam_id)
    .single()

  const { data: review, error: reviewError } = await supabase.rpc('get_session_review', {
    p_session_id: sessionId,
  })
  if (reviewError) throw new Error('Failed to load session review')
  const reviewRows = (review ?? []) as {
    question_id: string
    subject_id: string
    question_text: string
    options: unknown
    selected_answer: string | null
    is_correct: boolean | null
    correct_answer: string
    explanation: string
    time_taken_seconds: number | null
  }[]

  const subjectIds = new Set<string>()
  const questions = reviewRows.map((row) => {
    subjectIds.add(row.subject_id)
    return [{
      questionId: row.question_id,
      questionText: row.question_text,
      options: row.options as { key: string; text: string }[],
      subjectId: row.subject_id,
      selectedAnswer: row.selected_answer,
      correctAnswer: row.correct_answer,
      isCorrect: row.is_correct,
      explanation: row.explanation,
      timeTakenSeconds: row.time_taken_seconds,
    }]
  }).flat()

  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name')
    .in('id', Array.from(subjectIds))

  const subjectNames = new Map((subjects ?? []).map((s) => [s.id, s.name]))

  const perfBySubject = result.performance_by_subject as Record<string, { correct: number; total: number }> | undefined
  let weakestSubject: { subjectId: string; name: string; correct: number; total: number; accuracy: number } | null = null
  if (perfBySubject) {
    for (const [subjectId, data] of Object.entries(perfBySubject)) {
      if (data.total === 0) continue
      const acc = data.correct / data.total
      if (!weakestSubject || acc < weakestSubject.accuracy) {
        weakestSubject = {
          subjectId,
          name: subjectNames.get(subjectId) ?? 'Unknown',
          correct: data.correct,
          total: data.total,
          accuracy: acc,
        }
      }
    }
  }

  const subjectBreakdown = Object.entries(perfBySubject ?? {}).map(([id, data]) => ({
    subjectId: id,
    name: subjectNames.get(id) ?? 'Unknown',
    correct: data.correct,
    total: data.total,
    accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 10000) / 100 : 0,
  }))

  return {
    session: {
      id: session.id,
      mode: session.mode,
      completedAt: session.completed_at,
      timeLimitSeconds: session.time_limit_seconds,
    },
    exam: exam ? { name: exam.name, slug: exam.slug } : { name: 'Unknown', slug: '' },
    result: {
      score: result.score as number,
      accuracy: result.accuracy as number,
      createdAt: result.created_at as string,
    },
    timeTakenMs: completedAt - startedAt,
    questions,
    subjectBreakdown,
    weakestSubject,
  }
}

export async function getSessionHistory(hub?: 'jamb' | 'universities') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  let query = supabase
    .from('exam_sessions')
    .select(`
      id,
      exam_id,
      mode,
      status,
      started_at,
      completed_at,
      exams!inner(name, slug),
      results!inner(score, accuracy)
    `)
    .eq('user_id', user.id)
    .eq('status', 'completed')

  if (hub === 'universities') {
    const { data: schoolExams } = await supabase
      .from('exams')
      .select('id')
      .not('school_id', 'is', null)
    const schoolExamIds = (schoolExams ?? []).map((e) => e.id)
    if (schoolExamIds.length > 0) {
      query = query.in('exam_id', schoolExamIds)
    } else {
      query = query.is('exam_id', null)
    }
  }

  const { data, error } = await query.order('started_at', { ascending: false })

  if (error) throw new Error('Failed to fetch history')

  const history = (data ?? []).map((row: Record<string, unknown>) => {
    const exams = Array.isArray(row.exams) ? row.exams[0] : row.exams
    const res = Array.isArray(row.results) ? row.results[0] : row.results
    return {
      id: row.id as string,
      examName: (exams as { name?: string })?.name ?? 'Unknown',
      examSlug: (exams as { slug?: string })?.slug ?? '',
      mode: row.mode as string,
      score: (res as { score?: number })?.score ?? 0,
      accuracy: (res as { accuracy?: number })?.accuracy ?? 0,
      completedAt: row.completed_at as string,
    }
  })

  return history
}
