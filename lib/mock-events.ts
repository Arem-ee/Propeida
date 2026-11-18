import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export interface MockEvent {
  id: string
  name: string
  slug: string
  exam_id: string
  starts_at: string
  ends_at: string
  description: string | null
  topicIds: string[] | null
  questionCount: number | null
  exam_name: string | null
  exam_slug: string | null
}

/** The events a learner sees. Public rows only — RLS lets any authenticated user read. */
export async function listMockEvents(): Promise<MockEvent[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('mock_events')
    .select('id, name, slug, exam_id, starts_at, ends_at, description, topic_ids, question_count, exams!inner(name, slug)')
    .order('starts_at', { ascending: false })
  if (error) return []
  return (data ?? []).map((row) => {
    const exams = Array.isArray(row.exams) ? row.exams[0] : row.exams
    return {
      id: row.id as string,
      name: row.name as string,
      slug: row.slug as string,
      exam_id: row.exam_id as string,
      starts_at: row.starts_at as string,
      ends_at: row.ends_at as string,
      description: (row.description as string | null) ?? null,
      topicIds: (row.topic_ids as string[] | null) ?? null,
      questionCount: (row.question_count as number | null) ?? null,
      exam_name: (exams as { name?: string })?.name ?? null,
      exam_slug: (exams as { slug?: string })?.slug ?? null,
    }
  })
}

export async function getMockEvent(slug: string): Promise<MockEvent | null> {
  const all = await listMockEvents()
  return all.find((e) => e.slug === slug || e.id === slug) ?? null
}

/** Live or most-recent event for this exam — used by banners and the nav. */
export async function getCurrentMockEvent(examId: string | null): Promise<MockEvent | null> {
  const events = await listMockEvents()
  if (!events.length) return null
  const now = Date.now()
  const examFiltered = examId ? events.filter((e) => e.exam_id === examId) : events

  const live = examFiltered.find((e) => now >= new Date(e.starts_at).getTime() && now < new Date(e.ends_at).getTime())
  if (live) return live
  const upcoming = examFiltered
    .filter((e) => now < new Date(e.starts_at).getTime())
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())[0]
  if (upcoming) return upcoming
  return null
}

export interface LeaderboardRow {
  rank: number
  userId: string
  username: string
  score: number
  total: number
  accuracy: number
  completed_at: string
  isYou: boolean
}

/**
 * Leaderboard of an event. Private, Pro-only data — reads across users via the
 * service role. Names are the profile usernames; nothing else about the user
 * is exposed.
 */
export async function getMockEventLeaderboard(eventId: string, viewerId: string | null): Promise<{ rows: LeaderboardRow[]; participantCount: number; closed: boolean }> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('exam_sessions')
    .select(`
      id,
      user_id,
      completed_at,
      results!inner(score, accuracy),
      profiles!exam_sessions_user_id_fkey(username)
    `)
    .eq('mock_event_id', eventId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: true })
  if (error) {
    return { rows: [], participantCount: 0, closed: false }
  }

  type RawRow = {
    id: string
    user_id: string
    completed_at: string
    results: { score: number; accuracy: number } | { score: number; accuracy: number }[] | null
    profiles: { username: string | null } | { username: string | null }[] | null
  }

  const raw = (data ?? []) as RawRow[]
  const rows: LeaderboardRow[] = raw.map((row, i) => {
    const results = Array.isArray(row.results) ? row.results[0] : row.results
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles
    return {
      rank: i + 1,
      userId: row.user_id,
      username: (profile?.username ?? 'earner') as string,
      score: Number(results?.score ?? 0),
      total: 0,
      accuracy: Number(results?.accuracy ?? 0),
      completed_at: row.completed_at,
      isYou: viewerId !== null && row.user_id === viewerId,
    }
  }).sort((a, b) => b.accuracy - a.accuracy || b.score - a.score || a.completed_at.localeCompare(b.completed_at))
    .map((r, i) => ({ ...r, rank: i + 1 }))

  const { data: event } = await admin
    .from('mock_events')
    .select('ends_at')
    .eq('id', eventId)
    .single()

  return {
    rows,
    participantCount: rows.length,
    closed: event ? new Date(event.ends_at).getTime() < Date.now() : false,
  }
}

/** One user's entry for the event — used to show "you've already sat it". */
export async function getMyEventEntry(eventId: string, userId: string) {
  const admin = createAdminClient()
  const { data } = await admin
    .from('exam_sessions')
    .select('id, status, completed_at')
    .eq('mock_event_id', eventId)
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data as { id: string; status: string; completed_at: string } | null
}
