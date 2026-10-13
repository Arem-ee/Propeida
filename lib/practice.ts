import { createClient } from './supabase/server'

interface SessionConfig {
  examId: string
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

export interface MockDefaults {
  question_count: number | null
  time_limit_seconds: number | null
  subject_roles?: Record<string, number>
}

export async function getMockDefaults(examSlug: string): Promise<MockDefaults | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('app_config').select('value').eq('key', 'mock_defaults').single()
  if (!data) return null
  const defaults = data.value as Record<string, MockDefaults>
  return defaults[examSlug] ?? null
}

export async function fetchQuestionsForSession(config: SessionConfig, sessionId: string) {
  const supabase = await createClient()

  const effectiveCount = config.mode === 'mock'
    ? config.questionCount || 50
    : config.questionCount

  const { data: questions, error } = await supabase.rpc('get_session_questions', {
    p_exam_id: config.examId,
    p_subject_ids: config.subjectIds,
    p_difficulty: config.difficulty || null,
    p_limit: effectiveCount,
    p_seed: sessionId,
  })

  if (error) throw new Error(`Failed to fetch questions: ${error.message}`)
  if (!questions || questions.length === 0) throw new Error('No questions match the selected filters')

  return questions as SessionQuestion[]
}

export async function fetchFreePoolQuestions(
  userId: string,
  examId: string,
  subjectIds: string[],
  count: number,
  _seed: string,
  difficulty?: string | null,
): Promise<SessionQuestion[]> {
  const supabase = await createClient()

  const { data: poolIds } = await supabase.rpc('ensure_free_question_pool', { p_user_id: userId })
  if (!poolIds || poolIds.length === 0) throw new Error('No questions available')

  let query = supabase
    .from('questions')
    .select('id, subject_id, question_text, options')
    .in('id', poolIds)
    .in('subject_id', subjectIds)
    .eq('exam_id', examId)
    .eq('status', 'published')
    .limit(count)

  if (difficulty) {
    query = query.eq('difficulty', difficulty)
  }

  const { data: questions, error } = await query

  if (error) throw new Error(`Failed to fetch pool questions: ${error.message}`)
  if (!questions || questions.length === 0) throw new Error('No questions match the selected filters')

  return (questions as { id: string; subject_id: string; question_text: string; options: { key: string; text: string }[] }[])
    .map((q) => ({
      id: q.id,
      subjectId: q.subject_id,
      questionText: q.question_text,
      options: q.options,
    }))
}

export async function isLockedPoolExam(
  supabase: Awaited<ReturnType<typeof createClient>>,
  examId: string,
): Promise<boolean> {
  const [{ data: exam }, { data: config }] = await Promise.all([
    supabase.from('exams').select('slug').eq('id', examId).single(),
    supabase.from('app_config').select('value').eq('key', 'subject_weighting').single(),
  ])
  if (!exam?.slug || !config) return false
  const weighting = config.value as Record<string, unknown>
  return Object.prototype.hasOwnProperty.call(weighting, exam.slug)
}

export async function fetchLockedPoolQuestions(
  userId: string,
  examId: string,
  subjectIds: string[],
  count: number,
  seed: string,
  difficulty?: string | null,
): Promise<SessionQuestion[]> {
  const supabase = await createClient()

  const { error: poolError } = await supabase.rpc('ensure_exam_free_pool', {
    p_user_id: userId,
    p_exam_id: examId,
  })
  if (poolError) throw new Error(`Failed to load question pool: ${poolError.message}`)

  const { data: questions, error } = await supabase.rpc('get_session_questions', {
    p_exam_id: examId,
    p_subject_ids: subjectIds.length > 0 ? subjectIds : null,
    p_difficulty: difficulty || null,
    p_limit: count,
    p_seed: seed,
  })

  if (error) throw new Error(`Failed to fetch pool questions: ${error.message}`)
  if (!questions || questions.length === 0) throw new Error('No questions match the selected filters')

  return questions as SessionQuestion[]
}

export async function createExamSession(
  userId: string,
  examId: string,
  mode: 'practice' | 'mock',
  timeLimitSeconds: number | null
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('exam_sessions')
    .insert({
      user_id: userId,
      exam_id: examId,
      mode,
      time_limit_seconds: timeLimitSeconds,
    })
    .select('id, started_at')
    .single()

  if (error) throw new Error(`Failed to create session: ${error.message}`)
  return data as { id: string; started_at: string }
}

export async function getSessionById(sessionId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('exam_sessions')
    .select(`
      id,
      user_id,
      exam_id,
      mode,
      status,
      started_at,
      completed_at,
      time_limit_seconds
    `)
    .eq('id', sessionId)
    .single()

  if (error) throw new Error('Session not found')
  return data as {
    id: string
    user_id: string
    exam_id: string
    mode: 'practice' | 'mock'
    status: 'in_progress' | 'completed' | 'abandoned'
    started_at: string
    completed_at: string | null
    time_limit_seconds: number | null
  }
}

export async function getSessionQuestionsWithStatus(sessionId: string, includeReveal = false) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('session_answers')
    .select(`
      id,
      question_id,
      selected_answer,
      is_correct,
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
    .order('id', { ascending: true })

  if (error) throw new Error('Failed to fetch session questions')

  const questions = data.flatMap((sa) => {
    const q = Array.isArray(sa.question) ? sa.question[0] : sa.question
    if (!q) return []
    return [{
      answerId: sa.id,
      questionId: q.id,
      subjectId: q.subject_id,
      questionText: q.question_text,
      options: q.options as { key: string; text: string }[],
      selectedAnswer: sa.selected_answer,
      isCorrect: sa.is_correct,
      correctAnswer: includeReveal ? (q.correct_answer ?? null) : undefined,
      explanation: includeReveal ? (q.explanation ?? null) : undefined,
    }]
  })

  return questions
}

export async function getUserActiveSessions(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('exam_sessions')
    .select(`
      id,
      exam_id,
      mode,
      started_at,
      exams!inner(name, slug)
    `)
    .eq('user_id', userId)
    .eq('status', 'in_progress')
    .order('started_at', { ascending: false })

  if (error) throw new Error('Failed to fetch active sessions')
  return (data ?? []).map((d: Record<string, unknown>) => ({
    id: d.id as string,
    exam_id: d.exam_id as string,
    mode: d.mode as 'practice' | 'mock',
    started_at: d.started_at as string,
    exams: (Array.isArray(d.exams) ? d.exams[0] : d.exams) as unknown as { name: string; slug: string },
  }))
}

export function isSessionExpired(startedAt: string, timeLimitSeconds: number | null): boolean {
  if (!timeLimitSeconds) return false
  const deadline = new Date(new Date(startedAt).getTime() + timeLimitSeconds * 1000)
  return new Date() > deadline
}

/**
 * Warm-up retrieval: the most recent questions this user got wrong (or skipped)
 * in the same exam, for re-attempt at the start of a new practice session.
 * Returns at most `limit` questions, incorrect-first, most-recent-first.
 * Never throws — warm-up is enhancement, and its absence must be silent.
 */
export async function fetchWarmupQuestions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  examId: string,
  subjectIds: string[],
  excludeIds: string[],
  limit = 3,
): Promise<SessionQuestion[]> {
  try {
    const { data: recentSessions } = await supabase
      .from('exam_sessions')
      .select('id')
      .eq('user_id', userId)
      .eq('exam_id', examId)
      .eq('status', 'completed')
      .order('started_at', { ascending: false })
      .limit(5)

    const sessionIds = (recentSessions ?? []).map((s) => s.id)
    if (sessionIds.length === 0) return []

    const { data: answers } = await supabase
      .from('session_answers')
      .select(`
        id,
        is_correct,
        question:question_id (
          id,
          subject_id,
          question_text,
          options
        )
      `)
      .in('session_id', sessionIds)
      .order('id', { ascending: false })
      .limit(40)

    const seen = new Set(excludeIds)
    const picked: SessionQuestion[] = []
    const skipped: SessionQuestion[] = []

    for (const sa of answers ?? []) {
      const q = Array.isArray(sa.question) ? sa.question[0] : sa.question
      if (!q || seen.has(q.id)) continue
      if (subjectIds.length > 0 && !subjectIds.includes(q.subject_id)) continue
      seen.add(q.id)
      const item: SessionQuestion = {
        id: q.id,
        subjectId: q.subject_id,
        questionText: q.question_text,
        options: q.options as { key: string; text: string }[],
      }
      if (sa.is_correct === false) {
        if (picked.length < limit) picked.push(item)
      } else if (sa.is_correct === null || sa.is_correct === undefined) {
        skipped.push(item)
      }
      if (picked.length >= limit) break
    }

    for (const item of skipped) {
      if (picked.length >= limit) break
      picked.push(item)
    }

    return picked
  } catch {
    return []
  }
}

export async function getFirstMockQuestions(userId: string, examId: string): Promise<SessionQuestion[]> {
  const supabase = await createClient()

  const { data: firstSession } = await supabase
    .from('exam_sessions')
    .select('id')
    .eq('user_id', userId)
    .eq('exam_id', examId)
    .eq('mode', 'mock')
    .order('started_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!firstSession) throw new Error('No previous mock session found')

  const { data: answers } = await supabase
    .from('session_answers')
    .select(`
      question:question_id (
        id,
        subject_id,
        question_text,
        options
      )
    `)
    .eq('session_id', firstSession.id)
    .order('id', { ascending: true })

  const questions: SessionQuestion[] = []
  for (const sa of answers ?? []) {
    const q = Array.isArray(sa.question) ? sa.question[0] : sa.question
    if (!q) continue
    questions.push({
      id: q.id,
      subjectId: q.subject_id,
      questionText: q.question_text,
      options: q.options as { key: string; text: string }[],
    })
  }

  if (questions.length === 0) throw new Error('Previous mock session has no questions')

  return questions
}

export { hasExamAccess, getUsageCounters } from './entitlements'

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

/**
 * Root-fix routing shared by lessons and practice: on a repeated error,
 * walk down the missed question's topic chain to a published foundation
 * lesson. Silent (null) when unmapped — the repair link already shown
 * stands alone.
 */
export async function findPrerequisiteRepair(
  supabase: SupabaseClient,
  questionId: string,
): Promise<{ name: string; href: string } | null> {
  const { data: qTopics } = await supabase
    .from('question_topics')
    .select('topic_id')
    .eq('question_id', questionId)
  const tids = (qTopics ?? []).map((t) => t.topic_id)
  if (tids.length === 0) return null

  const { data: edges } = await supabase
    .from('topic_prerequisites')
    .select('prerequisite_topic_id')
    .in('topic_id', tids)
    .limit(1)
  const preId = (edges ?? [])[0]?.prerequisite_topic_id
  if (!preId) return null

  const [{ data: preLesson }, { data: preTopic }] = await Promise.all([
    supabase
      .from('lessons')
      .select('slug, subject_id')
      .eq('topic_id', preId)
      .eq('status', 'published')
      .limit(1)
      .maybeSingle(),
    supabase.from('topics').select('name').eq('id', preId).single(),
  ])
  const lessonRow = preLesson as { slug: string; subject_id: string } | null
  if (!lessonRow) return null

  const { data: lessonSubject } = await supabase
    .from('subjects')
    .select('slug')
    .eq('id', lessonRow.subject_id)
    .single()
  if (!lessonSubject) return null

  return {
    name: (preTopic as { name?: string } | null)?.name ?? 'Foundation lesson',
    href: `/learn/${(lessonSubject as { slug: string }).slug}/${lessonRow.slug}`,
  }
}

/**
 * How many times this learner has hit the same misconception code before,
 * across practice/mock sessions. Lessons count learning_attempts; the
 * session path counts session_answers — same signal, both stores.
 */
export async function countCodeRepeats(
  supabase: SupabaseClient,
  userId: string,
  code: string,
): Promise<number> {
  const { count } = await supabase
    .from('session_answers')
    .select('id, exam_sessions!inner(user_id)', { count: 'exact', head: true })
    .eq('misconception_code', code)
    .eq('exam_sessions.user_id', userId)
  // The just-recorded answer is included; a repeat means it appeared before.
  return Math.max(0, (count ?? 1) - 1)
}
