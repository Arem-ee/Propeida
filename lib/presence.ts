import { unstable_cache } from 'next/cache'
import { createAdminClient } from './supabase/admin'

export interface PresenceStats {
  weeklyActiveStudents: number
  sessionsThisWeek: number
  securedThisWeek: number
}

export interface CohortStats {
  weeklyActiveStudents: number
  sessionsThisWeek: number
}

/**
 * Aggregate-only presence, cached for a minute. Dashboard loads are the hot
 * path: hundreds of learners open /home within the same minute, and the
 * numbers only need to feel alive, not be exact to the second.
 *
 * Reads use the service-role client because `unstable_cache` cannot touch
 * cookies. Both RPCs are security-definer and return counts, never people.
 */
export const getCachedPresenceStats = unstable_cache(
  async (): Promise<PresenceStats | null> => {
    const db = createAdminClient()
    const { data, error } = await db.rpc('get_presence_stats')
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
  },
  ['presence-stats'],
  { revalidate: 60 },
)

export const getCachedCohortStats = unstable_cache(
  async (examId: string): Promise<CohortStats | null> => {
    const db = createAdminClient()
    const { data, error } = await db.rpc('get_cohort_stats', { p_exam_id: examId })
    if (error || !data) return null
    const row = (Array.isArray(data) ? data[0] : data) as {
      weekly_active_students?: number | string | null
      sessions_this_week?: number | string | null
    } | null
    if (!row) return null
    return {
      weeklyActiveStudents: Number(row.weekly_active_students ?? 0),
      sessionsThisWeek: Number(row.sessions_this_week ?? 0),
    }
  },
  ['cohort-stats'],
  { revalidate: 60 },
)
