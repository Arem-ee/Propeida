import type { SupabaseClient } from '@supabase/supabase-js'

export type ActivityDay = { day: string; count: number }
export type ProgressActivity = { days: ActivityDay[]; due: number }

/**
 * One guarded RPC for the Activity panel. 30 UTC days of logged learning
 * events plus the current due-review backlog. Fails closed to empty data so
 * a transient read error never blocks the page.
 */
export async function getProgressActivity(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProgressActivity> {
  const { data, error } = await supabase.rpc('get_progress_activity', { p_user_id: userId })
  if (error || !data) return { days: [], due: 0 }
  return data as ProgressActivity
}

export type AccuracyPoint = {
  id: string
  mode: string
  examName: string
  accuracy: number
  completedAt: string
}

/** Recent completed sessions with their recorded accuracy, newest first. */
export async function getAccuracySeries(
  supabase: SupabaseClient,
  userId: string,
): Promise<AccuracyPoint[]> {
  const { data, error } = await supabase
    .from('exam_sessions')
    .select('id, mode, started_at, exams(name), results(accuracy, created_at)')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('started_at', { ascending: false })
    .limit(30)

  if (error || !data) return []

  return data
    .map((row) => {
      const result = Array.isArray(row.results) ? row.results[0] : row.results
      const exam = Array.isArray(row.exams) ? row.exams[0] : row.exams
      return {
        id: row.id as string,
        mode: String(row.mode ?? 'practice'),
        examName: String((exam as { name?: string } | null)?.name ?? 'Practice'),
        accuracy: Number((result as { accuracy?: number } | null)?.accuracy ?? 0),
        completedAt: String(
          (result as { created_at?: string } | null)?.created_at ?? row.started_at ?? ''
        ),
      }
    })
    .filter((point) => point.completedAt)
}
