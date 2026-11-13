import { createClient } from './supabase/server'
import { getCachedCohortStats } from './presence'
import { getExamScope } from './exam-scope'

export interface CohortInfo {
  examId: string
  examName: string
  year: number
  /** Whole days until starts_at. Null when the date is unconfirmed. */
  daysLeft: number | null
  verified: boolean
  weeklyActive: number
}

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

/**
 * The nearest cohort **inside the learner's own path**.
 *
 * This used to pick the nearest cycle across every exam, which meant a
 * Post-UTME learner could be shown "Class of JAMB 2027" — two different
 * exams, one countdown. A cohort is only meaningful when the exam matches;
 * a learner with no declared path gets no cohort card at all.
 */
export async function getNearestCohort(
  supabase: SupabaseClient,
  userId: string,
): Promise<CohortInfo | null> {
  const scope = await getExamScope(supabase, userId)
  if (!scope.primaryExamId || !scope.examIds || scope.examIds.length === 0) return null

  const { data, error } = await supabase.rpc('get_upcoming_cycles')
  if (error || !data) return null

  const allowed = new Set(scope.examIds)
  const rows = ((data ?? []) as {
    exam_id: string
    exam_name: string
    year: number
    starts_at: string | null
    verified: boolean
  }[]).filter((row) => allowed.has(row.exam_id))

  const now = Date.now()
  const withDates = rows
    .filter((r) => r.starts_at && new Date(r.starts_at).getTime() > now)
    .sort((a, b) => new Date(a.starts_at as string).getTime() - new Date(b.starts_at as string).getTime())
  const verifiedDated = withDates.find((r) => r.verified) ?? null
  const pick = verifiedDated ?? withDates[0] ?? [...rows].sort((a, b) => b.year - a.year)[0]
  if (!pick) return null

  const daysLeft =
    pick.verified && pick.starts_at
      ? Math.max(0, Math.ceil((new Date(pick.starts_at).getTime() - now) / 86400000))
      : null

  let weeklyActive = 0
  const stats = await getCachedCohortStats(pick.exam_id)
  weeklyActive = stats?.weeklyActiveStudents ?? 0

  return {
    examId: pick.exam_id,
    examName: pick.exam_name,
    year: pick.year,
    daysLeft,
    verified: pick.verified,
    weeklyActive,
  }
}

/**
 * Exam horizon for scheduling: whole days until the nearest VERIFIED future
 * cycle start **in the learner's path**. Null when no verified date exists —
 * the scheduler falls back to its fixed ladder rather than planning around a
 * rumor or another exam's calendar.
 */
export async function getExamHorizonDays(
  supabase: SupabaseClient,
  userId: string,
): Promise<number | null> {
  const scope = await getExamScope(supabase, userId)
  if (!scope.examIds || scope.examIds.length === 0) return null
  const allowed = new Set(scope.examIds)

  const { data, error } = await supabase.rpc('get_upcoming_cycles')
  if (error || !data) return null

  const now = Date.now()
  let best: number | null = null
  for (const row of data as { exam_id: string; starts_at: string | null; verified: boolean }[]) {
    if (!allowed.has(row.exam_id)) continue
    if (!row.verified || !row.starts_at) continue
    const diff = Math.round((new Date(row.starts_at).getTime() - now) / 86400000)
    if (diff > 0 && (best === null || diff < best)) best = diff
  }
  return best
}
