'use server'

import { randomUUID } from 'node:crypto'
import { createClient, getAuthUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { applySubjectEvidence } from '@/lib/mastery'
import { getExamScope } from '@/lib/exam-scope'

export async function completeOnboarding() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Please sign in again.')

  const { error } = await supabase
    .from('profiles')
    .update({ onboarding_completed: true })
    .eq('id', user.id)

  if (error) throw new Error('Could not update your status.')

  revalidatePath('/home')
}

export interface CheckQuestion {
  id: string
  subjectId: string
  subjectName: string
  questionText: string
  options: { key: string; text: string }[]
}

/**
 * Placement by doing: 3 English + 2 Mathematics questions drawn from the
 * learner's own path bank. A restricted path never samples a different
 * exam's questions — general scope falls back to the deepest bank.
 * Skippable — the home works without a model.
 */
export async function getOnboardingCheck(): Promise<CheckQuestion[]> {
  const supabase = await createClient()
  const admin = createAdminClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Please sign in again.')

  const scope = await getExamScope(supabase, user.id)
  const candidates = scope.restricted ? (scope.examIds ?? []) : null
  if (candidates && candidates.length === 0) return []

  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name, slug')
    .in('slug', ['english', 'mathematics'])
  const bySlug = new Map((subjects ?? []).map((s) => [s.slug, s]))

  const out: CheckQuestion[] = []
  for (const [slug, count] of [['english', 3], ['mathematics', 2]] as const) {
    const subject = bySlug.get(slug)
    if (!subject) continue
    let linkQuery = supabase
      .from('exam_subjects')
      .select('exam_id')
      .eq('subject_id', subject.id)
    if (candidates) linkQuery = linkQuery.in('exam_id', candidates)
    const { data: links } = await linkQuery
    let best: string | null = null
    let bestCount = 0
    for (const l of links ?? []) {
      const { count: c } = await admin
        .from('questions')
        .select('id', { count: 'exact', head: true })
        .eq('exam_id', l.exam_id)
        .eq('subject_id', subject.id)
        .eq('status', 'published')
      if ((c ?? 0) > bestCount) {
        bestCount = c ?? 0
        best = l.exam_id
      }
    }
    if (!best) continue
    // The diagnostic draws must work for a brand-new free learner who owns
    // no pool yet: read through the service role. The RPC returns only
    // id/text/options/response_type \u2014 never answer columns.
    const { data } = await admin.rpc('get_session_questions', {
      p_exam_id: best,
      p_subject_ids: [subject.id],
      p_difficulty: null,
      p_limit: count,
      p_seed: randomUUID(),
    })
    for (const q of (data ?? []) as { id: string; question_text?: string; questionText?: string; options: { key: string; text: string }[] }[]) {
      out.push({
        id: q.id,
        subjectId: subject.id,
        subjectName: subject.name,
        questionText: q.questionText ?? q.question_text ?? '',
        options: q.options,
      })
    }
  }
  return out
}

export async function submitOnboardingCheck(
  answers: { questionId: string; subjectId: string; selectedAnswer: string; confidence: 'sure' | 'unsure' }[],
): Promise<{ summary: { subjectName: string; correct: number; total: number }[] }> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Please sign in again.')
  if (answers.length === 0 || answers.length > 5) throw new Error('Please answer all the questions first.')

  // The answer key lives in question_answers, which the learner role
  // cannot read. Grading reads it with the service-role client, inside
  // an action that has already proven the caller's identity.
  const admin = createAdminClient()
  const scope = await getExamScope(admin, user.id)
  const questionIds = answers.map((a) => a.questionId)

  // Restricted paths grade only their own bank: an answer replayed from
  // another exam never enters this learner's model.
  let questionQuery = admin
    .from('questions')
    .select('id, subjects!inner(name)')
    .in('id', questionIds)
  if (scope.restricted) {
    if (!scope.examIds || scope.examIds.length === 0) return { summary: [] }
    questionQuery = questionQuery.in('exam_id', scope.examIds)
  }
  const { data: questions } = await questionQuery

  const { data: answerRows } = await admin
    .from('question_answers')
    .select('question_id, correct_answer')
    .in('question_id', questionIds)
  const answerById = new Map((answerRows ?? []).map((r) => [r.question_id, r.correct_answer]))
  const keyById = new Map((questions ?? []).map((q) => [q.id, q]))

  const bySubject = new Map<string, { name: string; correct: number; total: number }>()
  const rows: {
    user_id: string
    subject_id: string
    question_id: string
    lesson_id: string
    attempt_type: string
    is_correct: boolean
    confidence: 'sure' | 'unsure'
  }[] = []

  for (const a of answers) {
    const q = keyById.get(a.questionId) as
      | { subjects: { name: string } | { name: string }[] | null }
      | undefined
    if (!q) continue
    const correct = answerById.get(a.questionId) === a.selectedAnswer
    const s = Array.isArray(q.subjects) ? q.subjects[0] : q.subjects
    const entry = bySubject.get(a.subjectId) ?? { name: s?.name ?? 'Subject', correct: 0, total: 0 }
    entry.total += 1
    if (correct) entry.correct += 1
    bySubject.set(a.subjectId, entry)
    rows.push({
      user_id: user.id,
      subject_id: a.subjectId,
      question_id: a.questionId,
      lesson_id: 'onboarding-check',
      attempt_type: 'diagnostic',
      is_correct: correct,
      confidence: a.confidence,
    })
  }

  if (rows.length > 0) {
    await createAdminClient().from('learning_attempts').insert(rows)
    const evidence = new Map<string, { correct: number; total: number }>()
    for (const [subjectId, e] of bySubject) {
      evidence.set(subjectId, { correct: e.correct, total: e.total })
    }
    try {
      // Placement evidence belongs to the learner's current path.
      await applySubjectEvidence(supabase, user.id, evidence, null, scope.primaryExamId)
    } catch (err) {
      console.error('[mastery] onboarding evidence failed:', err)
    }
  }

  return {
    summary: [...bySubject.values()].map((e) => ({ subjectName: e.name, correct: e.correct, total: e.total })),
  }
}

/* ============================================================
   Edit onboarding preferences (account settings — no compulsory validation)
   ============================================================ */

export async function updateOnboardingProfile(payload: Partial<OnboardingProfileInput>) {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Please sign in again.')

  const { error } = await supabase
    .from('profiles')
    .update({
      ...(payload.exam_target !== undefined && { exam_target: payload.exam_target }),
      ...(payload.subject_combinations !== undefined && {
        subject_combinations: payload.subject_combinations,
      }),
      ...(payload.intended_course !== undefined && {
        intended_course: payload.intended_course,
      }),
      ...(payload.heard_about !== undefined && { heard_about: payload.heard_about }),
      ...(payload.study_time !== undefined && { study_time: payload.study_time }),
      ...(payload.target_score !== undefined && { target_score: payload.target_score }),
      ...(payload.accessibility_needs !== undefined && {
        accessibility_needs: payload.accessibility_needs,
      }),
      ...(payload.subjects_pending !== undefined && { subjects_pending: payload.subjects_pending }),
    })
    .eq('id', user.id)

  if (error) throw new Error('Could not save your preferences.')

  revalidatePath('/account')
  revalidatePath('/home')
}

/* ============================================================
   Compulsory onboarding profile save
   ============================================================ */

export type ExamTarget = 'jamb' | 'post-utme' | 'general'
export type HeardAbout = 'whatsapp' | 'friend' | 'school' | 'social' | 'other'
export type StudyTime = 'morning' | 'afternoon' | 'night' | 'flexible'

export interface AccessibilityNeeds {
  large_font: boolean
  high_contrast: boolean
  sound_off: boolean
}

export interface OnboardingProfileInput {
  exam_target: ExamTarget
  subject_combinations: string[]            // subject slugs
  intended_course?: string | null
  heard_about: HeardAbout
  study_time: StudyTime
  target_score: number
  accessibility_needs: AccessibilityNeeds
  subjects_pending?: boolean
}

class OnboardingError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OnboardingError'
  }
}

export async function saveOnboardingProfile(payload: OnboardingProfileInput) {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Please sign in again.')

  // ---- Compulsory validation ----
  if (!payload.exam_target) throw new OnboardingError('Please select what you are preparing for.')
  if (!payload.subject_combinations?.length && !payload.subjects_pending) {
    throw new OnboardingError('Please select at least one subject, or choose to pick subjects later.')
  }
  if (!payload.intended_course?.trim()) payload.intended_course = null // optional
  if (!payload.heard_about) throw new OnboardingError('Please tell us how you heard about Propeida.')
  if (!payload.study_time) throw new OnboardingError('Please select your preferred study time.')
  if (!payload.target_score || payload.target_score < 1) {
    throw new OnboardingError('Please enter a valid target score.')
  }
  if (payload.exam_target === 'jamb' && payload.target_score > 400) {
    throw new OnboardingError('JAMB scores run from 1 to 400.')
  }
  if (payload.exam_target === 'post-utme' && payload.target_score > 100) {
    throw new OnboardingError('Post-UTME scores are typically out of 100.')
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      exam_target: payload.exam_target,
      subject_combinations: payload.subject_combinations,
      intended_course: payload.intended_course,
      heard_about: payload.heard_about,
      study_time: payload.study_time,
      target_score: payload.target_score,
      accessibility_needs: payload.accessibility_needs,
      subjects_pending: !!payload.subjects_pending,
      onboarding_completed: true,
    })
    .eq('id', user.id)

  if (error) throw new Error('Could not save your profile.')

  revalidatePath('/home')
  revalidatePath('/account')
}



