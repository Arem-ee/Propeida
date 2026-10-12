import { createClient } from './supabase/server'

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
 * The nearest cohort: first verified cycle with a future date, else the
 * latest dated row, else the latest undated row (dates TBA). Unverified or
 * dateless cycles never render a countdown — "dates to be announced" is
 * the honest state, not a missing feature.
 */
export async function getNearestCohort(
  supabase: SupabaseClient,
): Promise<CohortInfo | null> {
  const { data, error } = await supabase.rpc('get_upcoming_cycles')
  if (error || !data) return null

  const rows = (data ?? []) as {
    exam_id: string
    exam_name: string
    year: number
    starts_at: string | null
    verified: boolean
  }[]

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
  const { data: stats } = await supabase.rpc('get_cohort_stats', { p_exam_id: pick.exam_id })
  const row = (Array.isArray(stats) ? stats[0] : stats) as { weekly_active_students?: number | string | null } | null
  weeklyActive = Number(row?.weekly_active_students ?? 0)

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
 * Exam horizon for scheduling: whole days until the nearest VERIFIED
 * future cycle start. Null when no verified date exists — the scheduler
 * falls back to its fixed ladder rather than planning around a rumor.
 */
export async function getExamHorizonDays(
  supabase: SupabaseClient,
): Promise<number | null> {
  const { data, error } = await supabase.rpc('get_upcoming_cycles')
  if (error || !data) return null

  const now = Date.now()
  let best: number | null = null
  for (const row of data as { starts_at: string | null; verified: boolean }[]) {
    if (!row.verified || !row.starts_at) continue
    const diff = Math.round((new Date(row.starts_at).getTime() - now) / 86400000)
    if (diff > 0 && (best === null || diff < best)) best = diff
  }
  return best
}
