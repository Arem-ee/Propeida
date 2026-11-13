'use server'

import { revalidatePath } from 'next/cache'
import { createClient, getAuthUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  getMockDefaults,
  fetchQuestionsForSession,
  fetchFreePoolQuestions,
  fetchLockedPoolQuestions,
  fetchWarmupQuestions,
  isLockedPoolExam,
  createExamSession,
  getSessionById,
  getSessionQuestionsWithStatus,
  isSessionExpired,
  findPrerequisiteRepair,
  countCodeRepeats,
} from '@/lib/practice'
import { hasExamAccess, getFreeMockAttempts, getProStatus } from '@/lib/entitlements'
import { getExamScope } from '@/lib/exam-scope'
import { getNotesBySubject, isValidSubject, getNoteById } from '@/lib/notes'
import { recordSessionEvidence, getNextReviews } from '@/lib/mastery'

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

/**
 * Shared struggle: what share of all recorded picks for this question chose
 * the same wrong option. Aggregate counts only (never who) via the
 * service-role client, since row RLS restricts learners to their own rows.
 * Returns null below the minimum sample — small cohorts show nothing
 * rather than noise.
 */
async function sharedStrugglePct(
  questionId: string,
  optionKey: string,
): Promise<number | null> {
  const MIN_SAMPLE = 20
  const admin = createAdminClient()
  const [{ count: total }, { count: same }] = await Promise.all([
    admin.from('session_answers').select('id', { count: 'exact', head: true }).eq('question_id', questionId),
    admin.from('session_answers').select('id', { count: 'exact', head: true }).eq('question_id', questionId).eq('selected_answer', optionKey),
  ])
  if (!total || total < MIN_SAMPLE || !same) return null
  return Math.round((same / total) * 100)
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
    throw new Error('No questions fit those choices yet.')
  }

  return allQuestions
}

export async function createSession(params: CreateSessionParams) {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Please sign in again.')

  // Path enforcement: a restricted learner (JAMB or Post-UTME) can only open
  // sessions in their own path. The pickers already filter, but the server is
  // the boundary — a stale deep-link must not be able to cross into the other
  // exam's bank.
  const scope = await getExamScope(supabase, user.id)
  if (scope.restricted && !scope.examIds?.includes(params.examId)) {
    throw new Error('This exam is not in your path')
  }

  // Canonical slug from the DB: the client-supplied slug must not decide mock
  // configuration or the JAMB branch — the exam row is the source of truth.
  const { data: examRow } = await supabase
    .from('exams')
    .select('slug')
    .eq('id', params.examId)
    .maybeSingle()
  const examSlug = examRow?.slug ?? params.examSlug

  const [examAccess, mockDefaults] = await Promise.all([
    hasExamAccess(user.id, params.examId),
    params.mode === 'mock' ? getMockDefaults(examSlug) : Promise.resolve(null),
  ])

  const hasAccess = examAccess
  const isFreeMock = !hasAccess && params.mode === 'mock'

  // Free mock attempts per exam (config: default 1; unilorin 2). Past the
  // allowance the mock is a Pro feature -- say so plainly, in one sentence.
  if (isFreeMock) {
    const [attempts, { count: usedMocks }] = await Promise.all([
      getFreeMockAttempts(examSlug),
      supabase
        .from('exam_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('exam_id', params.examId)
        .eq('mode', 'mock'),
    ])
    if ((usedMocks ?? 0) >= attempts) {
      throw new Error('You have used your free mock. Pro unlocks unlimited mocks.')
    }
  }

  let timeLimitSeconds: number | null = null
  let effectiveCount = params.questionCount

  if (mockDefaults) {
    if (mockDefaults.time_limit_seconds !== null) {
      timeLimitSeconds = mockDefaults.time_limit_seconds
    }
    if (mockDefaults.question_count !== null) {
      effectiveCount = mockDefaults.question_count
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

  const isFree = !hasAccess

  const [session, lockedPool] = await Promise.all([
    createExamSession(user.id, params.examId, params.mode, timeLimitSeconds),
    isFree ? isLockedPoolExam(supabase, params.examId) : Promise.resolve(false),
  ] as const)

  let questions: SessionQuestion[]

  if (isFreeMock || (isFree && params.mode === 'practice')) {
    questions = lockedPool
      ? await fetchLockedPoolQuestions(user.id, params.examId, subjectIds, effectiveCount, session.id, params.difficulty)
      : await fetchFreePoolQuestions(user.id, params.examId, subjectIds, effectiveCount, session.id, params.difficulty)
  } else if (params.mode === 'mock' && examSlug === 'jamb') {
    const roles = mockDefaults?.subject_roles
    if (!roles) {
      questions = await fetchWeightedQuestions(supabase, params.examId, subjectIds, effectiveCount, session.id)
    } else {
      const { data: englishSubject } = await supabase
        .from('subjects')
        .select('id')
        .eq('slug', 'english')
        .single()

      if (!englishSubject) throw new Error('English is not ready yet.')

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

      if (allQuestions.length === 0) throw new Error('No questions fit those choices yet.')
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

  // Interleaving (practice mode, multi-subject): round-robin the main set
  // by subject so retrieval mixes topics instead of blocking them
  // (Rohrer & Taylor). Single-subject sets pass through untouched.
  if (params.mode === 'practice') {
    const bySubject = new Map<string, SessionQuestion[]>()
    for (const q of questions) {
      const group = bySubject.get(q.subjectId) ?? []
      group.push(q)
      bySubject.set(q.subjectId, group)
    }
    if (bySubject.size > 1) {
      const groups = [...bySubject.values()]
      const mixed: SessionQuestion[] = []
      for (let i = 0; ; i++) {
        let took = false
        for (const g of groups) {
          const item = g[i]
          if (item) {
            mixed.push(item)
            took = true
          }
        }
        if (!took) break
      }
      questions = mixed
    }
  }

  // Warm-up retrieval (practice mode only — mocks stay pure exam simulation):
  // re-attempt the user's most recent mistakes first. Silent when no history.
  // Warm-up ids travel in the session URL: session_answers rows carry random
  // UUIDs, so DB order cannot preserve warm-up-first positioning.
  let warmupIds: string[] = []
  let finalQuestions = questions
  if (params.mode === 'practice') {
    const warmup = await fetchWarmupQuestions(
      supabase,
      user.id,
      params.examId,
      subjectIds,
      questions.map((q) => q.id),
      3,
    )
    if (warmup.length > 0) {
      warmupIds = warmup.map((q) => q.id)
      finalQuestions = [...warmup, ...questions]
      rows.unshift(...warmup.map((q) => ({ session_id: session.id, question_id: q.id })))
    }
  }

  // Micro-lesson binding (practice mode only): attach one authored note whose
  // subject matches the session's first note-covered subject. Silent when none.
  let lessonNoteId: string | null = null
  if (params.mode === 'practice' && subjectIds.length > 0) {
    const { data: sessionSubjects } = await supabase
      .from('subjects')
      .select('id, slug')
      .in('id', subjectIds)
    for (const s of sessionSubjects ?? []) {
      if (isValidSubject(s.slug)) {
        const firstNote = getNotesBySubject(s.slug)[0]
        if (firstNote) {
          lessonNoteId = firstNote.id
          break
        }
      }
    }
  }

  // Session rows are server-authored: the client role holds neither INSERT
  // nor UPDATE on exam_sessions/session_answers. The question set above was
  // selected here, so the service-role write is safe after the auth and
  // entitlement checks in this action.
  const admin = createAdminClient()
  const { error: answersError } = await admin.from('session_answers').insert(rows)
  if (answersError) {
    await admin.from('exam_sessions').delete().eq('id', session.id)
    throw new Error('Could not start this session.')
  }

  revalidatePath('/practice')

  return {
    sessionId: session.id,
    questions: finalQuestions.map((q) => ({
      id: q.id,
      subjectId: q.subjectId,
      questionText: q.questionText,
      options: q.options,
    })),
    mode: params.mode,
    timeLimitSeconds,
    startedAt: session.started_at,
    warmupIds,
    lessonNoteId,
  }
}

export async function submitAnswer(
  sessionId: string,
  questionId: string,
  selectedAnswer: string
) {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Please sign in again.')

  const session = await getSessionById(sessionId)
  if (session.user_id !== user.id) throw new Error('This session could not be opened.')
  if (session.status !== 'in_progress') throw new Error('This session is already finished.')


  if (session.mode === 'mock' && isSessionExpired(session.started_at, session.time_limit_seconds)) {
    throw new Error('Time has expired for this session')
  }

  if (session.mode === 'practice') {
    // record_session_answer is a pure write: it never returns the grade, so a
    // mock cannot be interrogated option by option. The practice grade comes
    // from the reveal RPC, which is gated to practice mode or a completed
    // session. Await the write first so selected_answer is set when the
    // reveal checks it.
    const recordRes = await supabase.rpc('record_session_answer', {
      p_session_id: sessionId,
      p_question_id: questionId,
      p_selected_answer: selectedAnswer,
    })

    if (recordRes.error) throw new Error('Could not save your answer.')

    const revealRes = await supabase.rpc('get_session_answer_reveal', {
      p_session_id: sessionId,
      p_question_id: questionId,
    })

    const revealRow = Array.isArray(revealRes.data) ? revealRes.data[0] : null
    if (revealRes.error || !revealRow) throw new Error('Could not load the explanation.')

    const isCorrect = revealRow.correct_answer === selectedAnswer

    // No streak update here by design (docs §3): streaks count completed
    // planned actions, and those are recorded at session completion below —
    // never per answer, never per login.

    // Misconception repair: when the picked wrong option is mapped, append
    // its named repair to the feedback. Silent when unmapped — the generic
    // explanation always stands alone.
    let misconception: {
      code: string
      name: string
      explanation: string
      sharedPct: number | null
      repairHref: string | null
      repeatCount: number
      prerequisite: { name: string; href: string } | null
    } | null = null
    if (!isCorrect) {
      // Misconception rows name the wrong options, so they are service-role
      // only. The server has just verified the answer above and returns only
      // the repair for the option this learner picked.
      const admin = createAdminClient()
      const { data: mc } = await admin
        .from('question_misconceptions')
        .select('misconception_code, misconception_name, explanation, repair_note_id')
        .eq('question_id', questionId)
        .eq('option_key', selectedAnswer)
        .maybeSingle()
      if (mc) {
        const repairNote = mc.repair_note_id ? getNoteById(mc.repair_note_id) : null
        // Repeat detection: the code was just recorded on this answer by
        // record_session_answer, so a repeat means it appeared before.
        const repeatCount = await countCodeRepeats(user.id, mc.misconception_code)
        misconception = {
          code: mc.misconception_code,
          name: mc.misconception_name,
          explanation: mc.explanation,
          sharedPct: await sharedStrugglePct(questionId, selectedAnswer),
          repairHref: repairNote ? `/learn/${repairNote.subject}/${repairNote.slug}` : null,
          repeatCount,
          prerequisite: repeatCount > 0 ? await findPrerequisiteRepair(supabase, questionId) : null,
        }
      }
    }

    return {
      isCorrect,
      correctAnswer: revealRow.correct_answer,
      explanation: revealRow.explanation,
      misconception,
    }
  }

  const record = await supabase.rpc('record_session_answer', {
    p_session_id: sessionId,
    p_question_id: questionId,
    p_selected_answer: selectedAnswer,
  })
  if (record.error) throw new Error('Could not save your answer.')

  // Mock feedback is deliberately withheld: isCorrect stays null until the
  // session is submitted and get_session_review can reveal the paper.
  return { isCorrect: null }
}

/**
 * Close-out for practice sessions. Practice previously ended client-side only
 * (no completion row, no results page); finishing now records the session and
 * routes to the results close-out. RLS grants users no INSERT on `results`,
 * so the privileged write goes through the service-role client after the
 * same ownership checks used everywhere else.
 */
export async function completePracticeSession(sessionId: string) {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Please sign in again.')

  const session = await getSessionById(sessionId)
  if (session.user_id !== user.id) throw new Error('This session could not be opened.')
  if (session.status !== 'in_progress') throw new Error('This session is already finished.')
  if (session.mode !== 'practice') throw new Error('This is not a practice session.')


  const answers = await getSessionQuestionsWithStatus(sessionId, false)
  const attempted = answers.filter((a) => a.selectedAnswer != null)
  const correct = attempted.filter((a) => a.isCorrect === true).length
  const accuracy = attempted.length > 0 ? correct / attempted.length : 0

  const perfBySubject: Record<string, { correct: number; total: number }> = {}
  for (const a of attempted) {
    const entry = perfBySubject[a.subjectId] ?? { correct: 0, total: 0 }
    entry.total += 1
    if (a.isCorrect === true) entry.correct += 1
    perfBySubject[a.subjectId] = entry
  }

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const admin = createAdminClient()
  const { error: sessionError } = await admin
    .from('exam_sessions')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', sessionId)
    .eq('user_id', user.id)
  if (sessionError) throw new Error('Could not finish this session.')

  const { error: resultsError } = await admin.from('results').insert({
    session_id: sessionId,
    score: correct,
    accuracy,
    performance_by_subject: perfBySubject,
  })
  if (resultsError) throw new Error('Could not save your results.')

  // Proof engine: fold this session into the learner model. Best-effort —
  // completion already succeeded, so a mastery write failure must not
  // unravel it.
  try {
    await recordSessionEvidence(supabase, user.id, sessionId)
  } catch (err) {
    console.error('[mastery] recordSessionEvidence failed:', err)
  }

  // Streak counts the completed session (a planned action done), never
  // the answers inside it. Best-effort like everything post-completion.
  try {
    await supabase.rpc('update_streak', { p_user_id: user.id })
  } catch (err) {
    console.error('[streak] update_streak failed:', err)
  }

  revalidatePath('/practice')
  revalidatePath(`/practice/session/${sessionId}`)
  revalidatePath('/history')

  return { sessionId }
}

export async function completeMockSession(sessionId: string) {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Please sign in again.')

  const session = await getSessionById(sessionId)
  if (session.user_id !== user.id) throw new Error('This session could not be opened.')
  if (session.status !== 'in_progress') throw new Error('This session is already finished.')
  if (session.mode !== 'mock') throw new Error('This is not a mock exam.')
  const expired = isSessionExpired(session.started_at, session.time_limit_seconds)


  const { data: completion, error: completionError } = await supabase.rpc('complete_mock_session', {
    p_session_id: sessionId,
  })
  const completionRow = Array.isArray(completion) ? completion[0] : null
  if (completionError || !completionRow) throw new Error('Could not finish this session.')

  await supabase.rpc('update_streak', { p_user_id: user.id })

  try {
    await recordSessionEvidence(supabase, user.id, sessionId)
  } catch (err) {
    console.error('[mastery] recordSessionEvidence failed:', err)
  }

  revalidatePath('/practice')
  revalidatePath(`/practice/session/${sessionId}`)

  const totalQuestions = Object.values(completionRow.performance_by_subject as Record<string, { total: number }>)
    .reduce((total, subject) => total + subject.total, 0)
  return { score: completionRow.score, accuracy: completionRow.accuracy, totalQuestions, timedOut: expired }
}

export async function loadSessionData(sessionId: string) {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Please sign in again.')

  const session = await getSessionById(sessionId)
  if (session.user_id !== user.id) throw new Error('This session could not be opened.')
  if (session.status !== 'in_progress') throw new Error('This session is already finished.')


  const questions = await getSessionQuestionsWithStatus(sessionId, session.mode === 'practice')
  const mapped = questions.map((q) => ({
    id: q.questionId,
    subjectId: q.subjectId,
    questionText: q.questionText,
    options: q.options,
    selectedAnswer: q.selectedAnswer,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
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
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Please sign in again.')

  const session = await getSessionById(sessionId)
  if (session.user_id !== user.id) throw new Error('This session could not be opened.')
  if (session.status !== 'completed') throw new Error('This session is not finished yet.')


  const [{ data: result }, { data: exam }, reviewRes] = await Promise.all([
    supabase
      .from('results')
      .select('*')
      .eq('session_id', sessionId)
      .single(),
    supabase
      .from('exams')
      .select('name, slug')
      .eq('id', session.exam_id)
      .single(),
    supabase.rpc('get_session_review', {
      p_session_id: sessionId,
    }),
  ])

  if (!result) throw new Error('Your results could not be found.')

  const startedAt = new Date(session.started_at).getTime()
  const completedAt = session.completed_at ? new Date(session.completed_at).getTime() : Date.now()

  const reviewError = reviewRes.error
  const review = reviewRes.data
  if (reviewError) throw new Error('Could not load your review.')
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
  const questionIds: string[] = []
  for (const row of reviewRows) {
    subjectIds.add(row.subject_id)
    questionIds.push(row.question_id)
  }

  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name')
    .in('id', Array.from(subjectIds))

  const subjectNames = new Map((subjects ?? []).map((s) => [s.id, s.name]))

  // Misconception repairs for review: keyed by question, matched to the
  // picked wrong option per item below. Empty when nothing is mapped.
  const repairs = new Map<string, { name: string; explanation: string; repairHref: string | null }>()
  if (questionIds.length > 0) {
    const admin = createAdminClient()
    const { data: mcRows } = await admin
      .from('question_misconceptions')
      .select('question_id, option_key, misconception_name, explanation, repair_note_id')
      .in('question_id', questionIds)
    for (const m of (mcRows ?? []) as { question_id: string; option_key: string; misconception_name: string; explanation: string; repair_note_id: string | null }[]) {
      const repairNote = m.repair_note_id ? getNoteById(m.repair_note_id) : null
      repairs.set(`${m.question_id}:${m.option_key}`, {
        name: m.misconception_name,
        explanation: m.explanation,
        repairHref: repairNote ? `/learn/${repairNote.subject}/${repairNote.slug}` : null,
      })
    }
  }

  const questions = reviewRows.map((row) => {
    const repair = row.selected_answer
      ? repairs.get(`${row.question_id}:${row.selected_answer}`) ?? null
      : null
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
      misconception: repair,
    }]
  }).flat()

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

  const nextReview = await getNextReviews(
    supabase,
    user.id,
    subjectBreakdown.map((sb) => sb.subjectId),
  )

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
    nextReview,
  }
}

export async function getSessionHistory() {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Please sign in again.')

  const { data, error } = await supabase
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
    .order('started_at', { ascending: false })

  if (error) throw new Error('Could not load your history.')

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

/** Plan status for client surfaces (results breakdown, mock launcher). */
export async function getMyPlan(): Promise<{ isPro: boolean; labels: string[] }> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) return { isPro: false, labels: [] }
  const pro = await getProStatus(user.id)
  return { isPro: pro.isPro, labels: pro.labels }
}

/** Free mock usage for the launcher's upgrade state. */
export async function getFreeMockStatus(
  examId: string,
): Promise<{ used: number; allowed: number; isPro: boolean }> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) return { used: 0, allowed: 1, isPro: false }
  const pro = await getProStatus(user.id)
  if (pro.isPro) return { used: 0, allowed: Number.MAX_SAFE_INTEGER, isPro: true }

  const { data: examRow } = await supabase
    .from('exams')
    .select('slug')
    .eq('id', examId)
    .maybeSingle()
  const allowed = await getFreeMockAttempts(examRow?.slug ?? '')

  const { count } = await supabase
    .from('exam_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('exam_id', examId)
    .eq('mode', 'mock')

  return { used: count ?? 0, allowed, isPro: false }
}

