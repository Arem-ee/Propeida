'use server'

import { createClient, getAuthUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getExamScope } from '@/lib/exam-scope'
import { applySubjectEvidence } from '@/lib/mastery'
import { getProStatus } from '@/lib/entitlements'

export interface RecallCard {
  id: string
  subjectName: string
  front: string
  back: string
  hint: string | null
}

function inScope(examId: string | null, allowed: string[] | undefined | null): boolean {
  if (!examId) return true
  if (!allowed || allowed.length === 0) return true
  return allowed.includes(examId)
}

/**
 * Due recall cards for the review loop. One queue: subjects that are due
 * for review come first; cards marked "Got it" in the last day sit out.
 * Full per-card intervals are tuning, not a new engine.
 */
export async function getDueRecallCards(limit = 10): Promise<RecallCard[]> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Please sign in again.')

  const pro = await getProStatus(user.id)
  if (!pro.isPro) throw new Error('Quick recall is part of Pro.')

  const scope = await getExamScope(supabase, user.id)

  const { data: mastery } = await supabase
    .from('learner_topic_mastery')
    .select('subject_id, next_review_at, exam_id')
    .eq('user_id', user.id)
    .is('topic_id', null)

  const now = new Date()
  const due = new Set<string>()
  const studied = new Set<string>()
  for (const row of (mastery ?? []) as {
    subject_id: string
    next_review_at: string | null
    exam_id: string | null
  }[]) {
    if (!inScope(row.exam_id, scope.restricted ? scope.examIds : null)) continue
    studied.add(row.subject_id)
    if (!row.next_review_at || new Date(row.next_review_at) <= now) {
      due.add(row.subject_id)
    }
  }

  const subjectIds = due.size > 0 ? [...due] : [...studied]
  if (subjectIds.length === 0) return []

  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
  const { data: recent } = await supabase
    .from('learning_attempts')
    .select('recall_card_id')
    .eq('user_id', user.id)
    .eq('attempt_type', 'recall')
    .eq('is_correct', true)
    .gte('created_at', yesterday)
  const recentIds = new Set(
    (recent ?? []).map((r) => r.recall_card_id).filter((v): v is string => Boolean(v)),
  )

  const { data: cards } = await supabase
    .from('recall_cards')
    .select('id, subject_id, front, back, hint, exam_id')
    .eq('published', true)
    .in('subject_id', subjectIds)

  const inScopeCards = ((cards ?? []) as {
    id: string
    subject_id: string
    front: string
    back: string
    hint: string | null
    exam_id: string | null
  }[]).filter((c) => inScope(c.exam_id, scope.restricted ? scope.examIds : null))

  const fresh = inScopeCards.filter((c) => !recentIds.has(c.id))
  const picked = (fresh.length > 0 ? fresh : inScopeCards)
    .sort(() => Math.random() - 0.5)
    .slice(0, limit)

  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name')
    .in('id', [...new Set(picked.map((c) => c.subject_id))])
  const nameById = new Map((subjects ?? []).map((s) => [s.id, s.name]))

  return picked.map((c) => ({
    id: c.id,
    subjectName: nameById.get(c.subject_id) ?? 'Subject',
    front: c.front,
    back: c.back,
    hint: c.hint,
  }))
}

/**
 * Record a recall mark. Evidence folds into the same mastery model as
 * lessons and sessions — no second scheduler.
 */
export async function submitRecallMark(input: {
  cardId: string
  known: boolean
}): Promise<void> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Please sign in again.')

  const admin = createAdminClient()

  const { data: card } = await admin
    .from('recall_cards')
    .select('id, subject_id')
    .eq('id', input.cardId)
    .single()
  if (!card) throw new Error('That card could not be found.')

  const { error } = await admin.from('learning_attempts').insert({
    user_id: user.id,
    subject_id: card.subject_id,
    question_id: null,
    lesson_id: null,
    recall_card_id: card.id,
    attempt_type: 'recall',
    is_correct: input.known,
    confidence: null,
  })
  if (error) throw new Error('Could not save your answer.')

  try {
    const scope = await getExamScope(supabase, user.id)
    await applySubjectEvidence(
      supabase,
      user.id,
      new Map([[card.subject_id, { correct: input.known ? 1 : 0, total: 1 }]]),
      null,
      scope.primaryExamId,
    )
  } catch (err) {
    console.error('[mastery] submitRecallMark failed:', err)
  }
}
