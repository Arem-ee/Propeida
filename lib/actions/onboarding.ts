'use server'

import { randomUUID } from 'node:crypto'
import { createClient, getAuthUser } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { applySubjectEvidence } from '@/lib/mastery'

export async function completeOnboarding() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('profiles')
    .update({ onboarding_completed: true })
    .eq('id', user.id)

  if (error) throw new Error('Failed to update onboarding status')

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
 * Placement by doing: 3 English + 2 Mathematics questions from the deepest
 * bank holding each subject. Skippable — the home works without a model.
 */
export async function getOnboardingCheck(): Promise<CheckQuestion[]> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Not authenticated')

  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name, slug')
    .in('slug', ['english', 'mathematics'])
  const bySlug = new Map((subjects ?? []).map((s) => [s.slug, s]))

  const out: CheckQuestion[] = []
  for (const [slug, count] of [['english', 3], ['mathematics', 2]] as const) {
    const subject = bySlug.get(slug)
    if (!subject) continue
    const { data: links } = await supabase
      .from('exam_subjects')
      .select('exam_id')
      .eq('subject_id', subject.id)
    let best: string | null = null
    let bestCount = 0
    for (const l of links ?? []) {
      const { count: c } = await supabase
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
    const { data } = await supabase.rpc('get_session_questions', {
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
  if (!user) throw new Error('Not authenticated')
  if (answers.length === 0 || answers.length > 5) throw new Error('Invalid submission')

  const { data: questions } = await supabase
    .from('questions')
    .select('id, correct_answer, subjects!inner(name)')
    .in('id', answers.map((a) => a.questionId))
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
      | { correct_answer: string; subjects: { name: string } | { name: string }[] | null }
      | undefined
    if (!q) continue
    const correct = q.correct_answer === a.selectedAnswer
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
    await supabase.from('learning_attempts').insert(rows)
    const evidence = new Map<string, { correct: number; total: number }>()
    for (const [subjectId, e] of bySubject) {
      evidence.set(subjectId, { correct: e.correct, total: e.total })
    }
    try {
      await applySubjectEvidence(supabase, user.id, evidence, null)
    } catch (err) {
      console.error('[mastery] onboarding evidence failed:', err)
    }
  }

  await completeOnboarding()

  return {
    summary: [...bySubject.values()].map((e) => ({ subjectName: e.name, correct: e.correct, total: e.total })),
  }
}



