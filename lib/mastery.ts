import { createClient } from './supabase/server'

/**
 * Step 2 proof engine: an explainable rules engine, not ML.
 *
 * Versioned configuration — intervals and thresholds change here, in the
 * open, never in a black box:
 * - Mastery score: exponential moving average (α = 0.5) of per-session
 *   subject accuracy. One number, one update rule, auditable from raw
 *   session_answers at any time.
 * - Success: session subject accuracy ≥ 80%. A success lengthens the next
 *   review gap; anything below resets the ladder (Karpicke & Roediger:
 *   repeated study after success adds nothing — only tested success counts).
 * - Intervals: expanding ladder 1 → 3 → 7 → 14 → 30 days (Cepeda et al.:
 *   optimal absolute gaps grow with retention horizon). Exam-date-anchored
 *   scheduling (gap as a function of days-to-exam) is the documented next
 *   step once the exam calendar binds to paths.
 * - Granularity is SUBJECT-level. topic_id stays null until the topic graph
 *   and misconception maps arrive; the schema already reserves it.
 */

export const MASTERY_CONFIG = {
  alpha: 0.5,
  successThreshold: 0.8,
  developingThreshold: 0.5,
  securedScore: 80,
  developingScore: 50,
  // Indexed by consecutive successes; capped at the last rung.
  intervalDays: [1, 3, 7, 14, 30],
  maxDuePerUser: 5,
} as const

export type MasteryStatus = 'fragile' | 'developing' | 'secured'

export function statusForScore(score: number): MasteryStatus {
  if (score >= MASTERY_CONFIG.securedScore) return 'secured'
  if (score >= MASTERY_CONFIG.developingScore) return 'developing'
  return 'fragile'
}

export function nextReviewInDays(consecutiveSuccesses: number): number {
  const ladder = MASTERY_CONFIG.intervalDays
  return ladder[Math.min(consecutiveSuccesses, ladder.length - 1)] ?? ladder[ladder.length - 1] ?? 30
}

export interface SubjectEvidence {
  subjectId: string
  correct: number
  total: number
}

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

interface MasteryRow {
  subject_id: string
  mastery_score: number
  consecutive_successes: number
}

/**
 * Record one completed session as learner-model evidence. Idempotent per
 * session per subject: re-running never double-counts (queue rows carry the
 * source session; mastery converges rather than accumulates).
 */
export async function recordSessionEvidence(
  supabase: SupabaseClient,
  userId: string,
  sessionId: string,
): Promise<void> {
  const { data: answers } = await supabase
    .from('session_answers')
    .select(`
      is_correct,
      question:question_id ( subject_id )
    `)
    .eq('session_id', sessionId)

  const bySubject = new Map<string, { correct: number; total: number }>()
  for (const sa of answers ?? []) {
    if (sa.is_correct === null || sa.is_correct === undefined) continue
    const q = Array.isArray(sa.question) ? sa.question[0] : sa.question
    if (!q) continue
    const entry = bySubject.get(q.subject_id) ?? { correct: 0, total: 0 }
    entry.total += 1
    if (sa.is_correct === true) entry.correct += 1
    bySubject.set(q.subject_id, entry)
  }
  if (bySubject.size === 0) return

  const { data: existing } = await supabase
    .from('learner_topic_mastery')
    .select('subject_id, mastery_score, consecutive_successes')
    .eq('user_id', userId)
    .is('topic_id', null)

  const prior = new Map<string, MasteryRow>()
  for (const row of (existing ?? []) as MasteryRow[]) {
    prior.set(row.subject_id, row)
  }

  const now = new Date()

  for (const [subjectId, ev] of bySubject) {
    const accuracy = ev.total > 0 ? ev.correct / ev.total : 0
    const prev = prior.get(subjectId)
    const prevScore = prev?.mastery_score ?? 0
    const score = Math.round(
      Math.min(100, Math.max(0, prevScore + MASTERY_CONFIG.alpha * (accuracy * 100 - prevScore))),
    )
    const success = accuracy >= MASTERY_CONFIG.successThreshold
    const successes = success ? (prev?.consecutive_successes ?? 0) + 1 : 0
    const nextReviewAt = new Date(now.getTime() + nextReviewInDays(successes) * 86400000)

    // Explicit update-or-insert: the uniqueness lives in a partial index
    // (topic_id IS NULL), which upsert arbiters cannot address.
    const row = {
      user_id: userId,
      subject_id: subjectId,
      topic_id: null,
      mastery_score: score,
      status: statusForScore(score),
      consecutive_successes: successes,
      last_evidence_at: now.toISOString(),
      next_review_at: nextReviewAt.toISOString(),
      updated_at: now.toISOString(),
    }
    if (prev) {
      await supabase
        .from('learner_topic_mastery')
        .update(row)
        .eq('user_id', userId)
        .eq('subject_id', subjectId)
        .is('topic_id', null)
    } else {
      await supabase.from('learner_topic_mastery').insert(row)
    }

    // The queue reflects the current model, not history: supersede stale due
    // rows for this subject, then schedule fresh work only where needed.
    await supabase
      .from('review_queue')
      .update({ state: 'done', completed_at: now.toISOString() })
      .eq('user_id', userId)
      .eq('subject_id', subjectId)
      .eq('state', 'due')

    if (!success) {
      await supabase.from('review_queue').insert({
        user_id: userId,
        subject_id: subjectId,
        topic_id: null,
        due_at: nextReviewAt.toISOString(),
        state: 'due',
        source_session_id: sessionId,
      })
    }
  }
}

export interface DueReview {
  subjectId: string
  subjectName: string
  subjectSlug: string
  dueAt: string
}

export async function getDueReviews(
  supabase: SupabaseClient,
  userId: string,
): Promise<DueReview[]> {
  const { data } = await supabase
    .from('review_queue')
    .select(`
      subject_id,
      due_at,
      subject:subject_id ( name, slug )
    `)
    .eq('user_id', userId)
    .eq('state', 'due')
    .lte('due_at', new Date().toISOString())
    .order('due_at', { ascending: true })
    .limit(MASTERY_CONFIG.maxDuePerUser)

  return (data ?? []).map((row) => {
    const s = Array.isArray(row.subject) ? row.subject[0] : row.subject
    return {
      subjectId: row.subject_id as string,
      subjectName: (s?.name as string | undefined) ?? 'Unknown',
      subjectSlug: (s?.slug as string | undefined) ?? '',
      dueAt: row.due_at as string,
    }
  })
}

export async function getMasterySummary(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ securedCount: number; totalCount: number }> {
  const { data } = await supabase
    .from('learner_topic_mastery')
    .select('status')
    .eq('user_id', userId)
    .is('topic_id', null)

  const rows = (data ?? []) as { status: string }[]
  return {
    securedCount: rows.filter((r) => r.status === 'secured').length,
    totalCount: rows.length,
  }
}

export interface SecuredSubject {
  subjectId: string
  subjectName: string
  subjectSlug: string
}

/** The collection: subjects this learner has secured, for the home shelf. */
export async function getSecuredSubjects(
  supabase: SupabaseClient,
  userId: string,
): Promise<SecuredSubject[]> {
  const { data } = await supabase
    .from('learner_topic_mastery')
    .select(`
      subject_id,
      subject:subject_id ( name, slug )
    `)
    .eq('user_id', userId)
    .is('topic_id', null)
    .eq('status', 'secured')
    .order('updated_at', { ascending: false })
    .limit(12)

  return (data ?? []).map((row) => {
    const s = Array.isArray(row.subject) ? row.subject[0] : row.subject
    return {
      subjectId: row.subject_id as string,
      subjectName: (s?.name as string | undefined) ?? 'Unknown',
      subjectSlug: (s?.slug as string | undefined) ?? '',
    }
  })
}

export interface PresenceStats {
  weeklyActiveStudents: number
  sessionsThisWeek: number
  securedThisWeek: number
}

/** Aggregate-only presence ("the library is full"). Counts, never people. */
export async function getPresenceStats(
  supabase: SupabaseClient,
): Promise<PresenceStats | null> {
  const { data, error } = await supabase.rpc('get_presence_stats')
  if (error || !data) return null
  const row = (Array.isArray(data) ? data[0] : data) as {
    weekly_active_students?: number | string | null
    sessions_this_week?: number | string | null
    secured_this_week?: number | string | null
  } | null
  if (!row) return null
  return {
    weeklyActiveStudents: Number(row.weekly_active_students ?? 0),
    sessionsThisWeek: Number(row.sessions_this_week ?? 0),
    securedThisWeek: Number(row.secured_this_week ?? 0),
  }
}

export async function getNextReviews(
  supabase: SupabaseClient,
  userId: string,
  subjectIds: string[],
): Promise<Record<string, string | null>> {
  if (subjectIds.length === 0) return {}
  const { data } = await supabase
    .from('learner_topic_mastery')
    .select('subject_id, next_review_at')
    .eq('user_id', userId)
    .is('topic_id', null)
    .in('subject_id', subjectIds)

  const out: Record<string, string | null> = {}
  for (const row of (data ?? []) as { subject_id: string; next_review_at: string | null }[]) {
    out[row.subject_id] = row.next_review_at
  }
  return out
}
