'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  getMockDefaults,
  fetchQuestionsForSession,
  insertSessionAnswers,
  createExamSession,
  getSessionById,
  getSessionQuestionsWithStatus,
  isSessionExpired,
  getUserActiveSessions,
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

  const [hasAccess, usage] = await Promise.all([
    hasExamAccess(user.id, params.examId),
    getUsageCounters(user.id, params.examId),
  ])

  const isFreeMock = !hasAccess && params.mode === 'mock'

  if (isFreeMock) {
    const freeMockAttempts = await getFreeMockAttempts(params.examSlug)
    if (usage.free_mocks_started >= freeMockAttempts) {
      throw new Error(`Free tier limited to ${freeMockAttempts} mock${freeMockAttempts === 1 ? '' : 's'} per exam. Upgrade to Pro for unlimited mocks.`)
    }
  }

  if (!hasAccess && params.mode === 'practice') {
    if (usage.free_questions_answered >= 30) {
      throw new Error('Free tier limited to 30 practice questions per exam. Upgrade to Pro for unlimited practice.')
    }
  }

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

  if (isFreeMock && usage.free_mocks_started > 0) {
    questions = await getFirstMockQuestions(user.id, params.examId)
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

  await insertSessionAnswers(session.id, questions)

  if (isFreeMock) {
    await supabase.rpc('increment_usage_counter', {
      p_user_id: user.id,
      p_exam_id: params.examId,
      p_field: 'free_mocks_started',
    })
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

  const { data: question } = await supabase
    .from('questions')
    .select('correct_answer')
    .eq('id', questionId)
    .single()

  if (!question) throw new Error('Question not found')

  const isCorrect = selectedAnswer === question.correct_answer

  const { data: existingAnswer } = await supabase
    .from('session_answers')
    .select('id, selected_answer')
    .eq('session_id', sessionId)
    .eq('question_id', questionId)
    .single()

  if (existingAnswer) {
    await supabase
      .from('session_answers')
      .update({ selected_answer: selectedAnswer, is_correct: isCorrect })
      .eq('id', existingAnswer.id)
  } else {
    await supabase
      .from('session_answers')
      .insert({
        session_id: sessionId,
        question_id: questionId,
        selected_answer: selectedAnswer,
        is_correct: isCorrect,
      })
  }

  if (session.mode === 'practice') {
    if (!existingAnswer?.selected_answer) {
      const hasAccess = await hasExamAccess(user.id, session.exam_id)
      if (!hasAccess) {
        await supabase.rpc('increment_usage_counter', {
          p_user_id: user.id,
          p_exam_id: session.exam_id,
          p_field: 'free_questions_answered',
        })
      }
    }

    await supabase.rpc('update_streak', { p_user_id: user.id })

    const { data: qData } = await supabase
      .from('questions')
      .select('explanation')
      .eq('id', questionId)
      .single()

    return {
      isCorrect,
      correctAnswer: question.correct_answer,
      explanation: qData?.explanation ?? '',
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
  const completedAt = expired
    ? new Date(session.started_at).getTime() + (session.time_limit_seconds ?? 0) * 1000
    : Date.now()

  const { data: answers } = await supabase
    .from('session_answers')
    .select('question_id, selected_answer, is_correct')
    .eq('session_id', sessionId)

  const totalQuestions = answers?.length ?? 0
  const correctCount = answers?.filter((a) => a.is_correct === true).length ?? 0
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) / 100 : 0

  const { data: subjectData } = await supabase
    .from('session_answers')
    .select('is_correct, question:question_id(subject_id)')
    .eq('session_id', sessionId)

  const perfBySubject: Record<string, { correct: number; total: number }> = {}
  for (const sa of subjectData ?? []) {
    const q = Array.isArray(sa.question) ? sa.question[0] : sa.question
    const subjectId = q?.subject_id
    if (!subjectId) continue
    if (!perfBySubject[subjectId]) {
      perfBySubject[subjectId] = { correct: 0, total: 0 }
    }
    perfBySubject[subjectId].total++
    if (sa.is_correct) perfBySubject[subjectId].correct++
  }

  const { error: sessionUpdateError } = await supabase
    .from('exam_sessions')
    .update({ status: 'completed', completed_at: new Date(completedAt).toISOString() })
    .eq('id', sessionId)

  if (sessionUpdateError) throw new Error('Failed to complete session')

  const { error: resultError } = await supabase
    .from('results')
    .insert({
      session_id: sessionId,
      score: correctCount,
      accuracy,
      performance_by_subject: perfBySubject,
    })

  if (resultError) throw new Error('Failed to save results')

  await supabase.rpc('update_streak', { p_user_id: user.id })

  revalidatePath('/practice')
  revalidatePath(`/practice/session/${sessionId}`)

  return { score: correctCount, accuracy, totalQuestions, timedOut: expired }
}

export async function getActiveSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const sessions = await getUserActiveSessions(user.id)
  return sessions.length > 0 ? sessions[0] : null
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

export async function resumeSession(sessionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const session = await getSessionById(sessionId)
  if (session.user_id !== user.id) throw new Error('Session does not belong to user')
  if (session.status !== 'in_progress') throw new Error('Session is not active')

  return session
}

export async function abandonSession(sessionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const session = await getSessionById(sessionId)
  if (session.user_id !== user.id) throw new Error('Session does not belong to user')
  if (session.status !== 'in_progress') throw new Error('Session is not active')

  const { error } = await supabase
    .from('exam_sessions')
    .update({ status: 'abandoned' })
    .eq('id', sessionId)

  if (error) throw new Error('Failed to abandon session')

  revalidatePath('/practice')
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

  const answersResponse = await supabase
    .from('session_answers')
    .select(`
      id,
      question_id,
      selected_answer,
      is_correct,
      time_taken_seconds,
      question:question_id (
        id,
        subject_id,
        question_text,
        options,
        correct_answer,
        explanation
      )
    `)
    .eq('session_id', sessionId)
    .order('id')

  const subjectIds = new Set<string>()
  const questions = (answersResponse.data ?? []).flatMap((sa) => {
    const q = Array.isArray(sa.question) ? sa.question[0] : sa.question
    if (!q) return []
    subjectIds.add(q.subject_id)
    return [{
      questionId: q.id,
      questionText: q.question_text,
      options: q.options as { key: string; text: string }[],
      subjectId: q.subject_id,
      selectedAnswer: sa.selected_answer,
      correctAnswer: q.correct_answer,
      isCorrect: sa.is_correct,
      explanation: q.explanation,
      timeTakenSeconds: sa.time_taken_seconds,
    }]
  })

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
