import type { createClient } from '@/lib/supabase/server'

type ServerSupabase = Awaited<ReturnType<typeof createClient>>

/**
 * Reads the learner's current streak (days with a completed planned
 * action). Best-effort by design: a failed read never blocks, never
 * throws, and never turns a celebration into an error.
 */
export async function fetchCurrentStreak(
  supabase: ServerSupabase,
  userId: string,
): Promise<number | null> {
  try {
    const { data, error } = await supabase
      .from('streaks')
      .select('current_streak')
      .eq('user_id', userId)
      .maybeSingle()
    if (error || !data) return null
    const value = (data as { current_streak?: number | null }).current_streak
    return typeof value === 'number' ? value : null
  } catch {
    return null
  }
}
