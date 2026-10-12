'use server'

import { randomUUID } from 'node:crypto'
import { createClient, getAuthUser } from '@/lib/supabase/server'
import { applySubjectEvidence, getNextReviews } from '@/lib/mastery'
import { getNoteById } from '@/lib/notes'

export interface LessonQuestion {
  id: string
  subjectId: string
  questionText: string
  options: { key: string; text: string }[]
}

interface AttemptInput {
  subjectId: string
  lessonId: string
  questionId: string | null
  selectedAnswer: string | null
  confidence: 'sure' | 'unsure' | null
  attemptType: 'diagnostic' | 'supported' | 'independent'
}

async function resolveExamForSubject(
  supabase: Awaited<ReturnType<typeof createClient>>,
  subjectId: string,
): Promise<string | null> {
  const { data: links } = await supabase
    .from('exam_subjects')
    .select('exam_id')
    .eq('subject_id', subjectId)
  const examIds = (links ?? []).map((l) => l.exam_id)
  if (examIds.length === 0) return null

  // Prefer the exam holding the deepest bank for this subject.
  let best: string | null = null
  let bestCount = -1
  for (const examId of examIds) {
    const { count } = await supabase
      .from('questions')
      .select('id', { count: 'exact', head: true })
      .eq('exam_id', examId)
      .eq('subject_id', subjectId)
    if ((count ?? 0) > bestCount) {
      bestCount = count ?? 0
      best = examId
    }
  }
  return bestCount > 0 ? best : null
}

/**
 * Lesson question set: 1 diagnostic + 2 independent, drawn from the
 * deepest bank holding this subject. Answers never leave the server —
 * checking happens in recordLessonAttempt.
 */
export async function getLessonQuestions(subjectId: string): Promise<{
  examId: string
  diagnostic: LessonQuestion | null
  independent: LessonQuestion[]
}> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Not authenticated')

  const examId = await resolveExamForSubject(supabase, subjectId)
  if (!examId) return { examId: '', diagnostic: null, independent: [] }

  const { data, error } = await supabase.rpc('get_session_questions', {
    p_exam_id: examId,
    p_subject_ids: [subjectId],
    p_difficulty: null,
    p_limit: 3,
    p_seed: randomUUID(),
  })
  if (error) throw new Error('Failed to load lesson questions')

  const rows = ((data ?? []) as {
    id: string
    subjectId?: string
    subject_id?: string
    questionText?: string
    question_text?: string
    options: { key: string; text: string }[]
  }[]).map((q) => ({
    id: q.id,
    subjectId: q.subjectId ?? q.subject_id ?? subjectId,
    questionText: q.questionText ?? q.question_text ?? '',
    options: q.options,
  }))

  const [diagnostic, ...independent] = rows
  return { examId, diagnostic: diagnostic ?? null, independent }
}

/**
 * Checkout twin: one isomorphic follow-up (same subject, unseen here)
 * after an incorrect independent answer. Transfer proven, not memorised.
 * Returns null when the bank has nothing fresh to offer.
 */
export async function getTwinQuestion(
  subjectId: string,
  excludeIds: string[],
): Promise<LessonQuestion | null> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Not authenticated')

  const examId = await resolveExamForSubject(supabase, subjectId)
  if (!examId) return null

  const { data, error } = await supabase.rpc('get_session_questions', {
    p_exam_id: examId,
    p_subject_ids: [subjectId],
    p_difficulty: null,
    p_limit: 5,
    p_seed: randomUUID(),
  })
  if (error) return null

  const rows = ((data ?? []) as {
    id: string
    subjectId?: string
    subject_id?: string
    questionText?: string
    question_text?: string
    options: { key: string; text: string }[]
  }[])
  const fresh = rows.find((q) => !excludeIds.includes(q.id))
  if (!fresh) return null
  return {
    id: fresh.id,
    subjectId: fresh.subjectId ?? fresh.subject_id ?? subjectId,
    questionText: fresh.questionText ?? fresh.question_text ?? '',
    options: fresh.options,
  }
}

export async function recordLessonAttempt(input: AttemptInput): Promise<{
  isCorrect: boolean
  correctAnswer: string
  explanation: string
  misconception: { name: string; explanation: string; repeatCount: number; repairHref: string | null } | null
}> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Not authenticated')

  if (input.confidence !== null && !['sure', 'unsure'].includes(input.confidence)) {
    throw new Error('Invalid confidence')
  }
  if (!['diagnostic', 'supported', 'independent'].includes(input.attemptType)) {
    throw new Error('Invalid attempt type')
  }

  // Open-ended supported prompts carry no bank question: engagement is
  // recorded (is_correct null) without polluting the mastery model.
  if (!input.questionId) {
    const { error: insertError } = await supabase.from('learning_attempts').insert({
      user_id: user.id,
      subject_id: input.subjectId,
      question_id: null,
      lesson_id: input.lessonId,
      attempt_type: input.attemptType,
      is_correct: null,
      confidence: input.confidence,
    })
    if (insertError) throw new Error('Failed to record attempt')
    return { isCorrect: false, correctAnswer: '', explanation: '', misconception: null }
  }

  const { data: question, error: qError } = await supabase
    .from('questions')
    .select('id, correct_answer, explanation')
    .eq('id', input.questionId)
    .single()
  if (qError || !question) throw new Error('Question not found')

  const isCorrect = question.correct_answer === input.selectedAnswer

  let misconception: { name: string; explanation: string; repeatCount: number; repairHref: string | null } | null = null
  let misconceptionCode: string | null = null
  if (!isCorrect && input.selectedAnswer) {
    const { data: mc } = await supabase
      .from('question_misconceptions')
      .select('misconception_code, misconception_name, explanation, repair_note_id')
      .eq('question_id', input.questionId)
      .eq('option_key', input.selectedAnswer)
      .maybeSingle()
    if (mc) {
      misconceptionCode = mc.misconception_code
      // Repeat detection: how many times has this exact error appeared
      // before for this learner? A repeat routes to root-fix, not retry.
      const { count: repeats } = await supabase
        .from('learning_attempts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('misconception_code', mc.misconception_code)
      const repairNote = mc.repair_note_id ? getNoteById(mc.repair_note_id) : null
      misconception = {
        name: mc.misconception_name,
        explanation: mc.explanation,
        repeatCount: repeats ?? 0,
        repairHref: repairNote ? `/learn/${repairNote.subject}/${repairNote.slug}` : null,
      }
    }
  }

  const { error: insertError } = await supabase.from('learning_attempts').insert({
    user_id: user.id,
    subject_id: input.subjectId,
    question_id: input.questionId,
    lesson_id: input.lessonId,
    attempt_type: input.attemptType,
    is_correct: isCorrect,
    confidence: input.confidence,
    misconception_code: misconceptionCode,
  })
  if (insertError) throw new Error('Failed to record attempt')

  return {
    isCorrect,
    correctAnswer: question.correct_answer,
    explanation: question.explanation ?? '',
    misconception,
  }
}

/**
 * Close-out: fold this lesson's diagnostic + independent results into the
 * learner model through the same rules as sessions. Counts come from the
 * client (its own model — gaming it only mis-schedules its own reviews),
 * bounded sanely server-side.
 */
export async function completeLesson(input: {
  subjectId: string
  correct: number
  total: number
}): Promise<{ nextReviewAt: string | null; status: string }> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Not authenticated')

  const correct = Math.max(0, Math.min(input.correct, 12))
  const total = Math.max(1, Math.min(input.total, 12))

  const bySubject = new Map<string, { correct: number; total: number }>()
  bySubject.set(input.subjectId, { correct, total })

  try {
    await applySubjectEvidence(supabase, user.id, bySubject, null)
  } catch (err) {
    console.error('[mastery] completeLesson failed:', err)
  }

  const reviews = await getNextReviews(supabase, user.id, [input.subjectId])
  return { nextReviewAt: reviews[input.subjectId] ?? null, status: 'recorded' }
}
