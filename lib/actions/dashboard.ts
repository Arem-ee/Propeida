'use server'

import { createClient, getAuthUser } from '@/lib/supabase/server'
import { getDueReviews, getMasterySummary, getSecuredSubjects, getPresenceStats, getProgressMap, getWeakestSubject } from '@/lib/mastery'
import { getUserActiveSessions } from '@/lib/practice'
import { getNearestCohort } from '@/lib/cohort'
import { getNoteById } from '@/lib/notes'

interface DashboardPayload {
  profile: {
    username: string
    referral_code: string
    school_id: string | null
    ai_features_enabled: boolean
    is_admin: boolean
  } | null
  entitlements: { product: string; status: string; expires_at: string | null; source: string }[]
  streak: { current_streak: number; longest_streak: number } | null
  recent_sessions: {
    id: string
    mode: string
    completed_at: string
    exam_name: string
    score: number
    accuracy: number
  }[]
}

async function fetchDashboardPayload(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<DashboardPayload | null> {
  const { data, error } = await supabase.rpc('get_dashboard_data', { p_user_id: userId })
  if (error) throw error
  return data as DashboardPayload
}

function isActiveEntitlement(status: string, expiresAt: string | null): boolean {
  if (status !== 'active') return false
  if (expiresAt && new Date(expiresAt) <= new Date()) return false
  return true
}

export async function getDashboardData() {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Not authenticated')

  let payload = await fetchDashboardPayload(supabase, user.id)

  // Profile row can lag a signup by a moment; retry once before failing
  if (!payload?.profile) {
    await new Promise((r) => setTimeout(r, 500))
    payload = await fetchDashboardPayload(supabase, user.id)
  }

  if (!payload) throw new Error('Failed to load dashboard data')
  if (!payload.profile) throw new Error('Profile not found')

  const entitlements = payload.entitlements ?? []
  const activeEntitlements = entitlements.filter((e) => isActiveEntitlement(e.status, e.expires_at))
  const jambEntitlement = activeEntitlements.find((e) => e.product === 'jamb_pro') ?? null
  const isJambPro = !!(jambEntitlement || activeEntitlements.some((e) => e.product === 'jamb_premium_ai'))
  const isTrial = jambEntitlement?.source === 'referral_trial'
  const trialExpiresAt = jambEntitlement?.expires_at ?? null

  // Redefined streak (docs §3): consecutive days with a completed planned
  // action — finished session or lesson attempts — not logins. Computed
  // from evidence, so it can never reward mere opens.
  let learningDays = 0
  try {
    const [sessionsRes, attemptsRes] = await Promise.all([
      supabase
        .from('exam_sessions')
        .select('completed_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(400),
      supabase
        .from('learning_attempts')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1000),
    ])
    const days = new Set<string>()
    const dayKey = (iso: string) => new Date(iso).toISOString().slice(0, 10)
    for (const r of (sessionsRes.data ?? []) as { completed_at: string | null }[]) {
      if (r.completed_at) days.add(dayKey(r.completed_at))
    }
    for (const r of (attemptsRes.data ?? []) as { created_at: string }[]) {
      days.add(dayKey(r.created_at))
    }
    const today = new Date().toISOString().slice(0, 10)
    const cursor = new Date(`${today}T00:00:00.000Z`)
    if (!days.has(today)) cursor.setUTCDate(cursor.getUTCDate() - 1)
    while (days.has(cursor.toISOString().slice(0, 10))) {
      learningDays += 1
      cursor.setUTCDate(cursor.getUTCDate() - 1)
    }
  } catch {
    learningDays = 0
  }

  const recentSessions = payload.recent_sessions.map((row) => ({
    id: row.id,
    mode: row.mode,
    examName: row.exam_name ?? 'Unknown',
    score: row.score ?? 0,
    accuracy: row.accuracy ?? 0,
    completedAt: row.completed_at,
  }))

  const badgeLabel = isJambPro ? (isTrial ? 'Pro Trial' : 'Pro') : 'Free'
  const badgeBg = isJambPro ? (isTrial ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700') : 'bg-gray-50 text-gray-500'

  // Proof engine surface. Never throws the dashboard: no learner model yet
  // (brand-new user) simply means no review card.
  let dueReviews: { subjectId: string; subjectName: string; subjectSlug: string; dueAt: string }[] = []
  let mastery = { securedCount: 0, totalCount: 0 }
  let securedSubjects: { subjectId: string; subjectName: string; subjectSlug: string }[] = []
  let presence: { weeklyActiveStudents: number; sessionsThisWeek: number; securedThisWeek: number } | null = null
  let continueSession: { id: string; examName: string; mode: string } | null = null
  let continueLesson: { noteId: string; subject: string; slug: string; topic: string } | null = null
  let cohort: {
    examName: string
    year: number
    daysLeft: number | null
    verified: boolean
    weeklyActive: number
  } | null = null
  let progressMap: { subjectId: string; subjectName: string; subjectSlug: string; status: string }[] = []
  let weakest: { subjectId: string; subjectName: string; subjectSlug: string } | null = null
  try {
    const [due, summary, secured, presenceStats, active, nearest, pmap, weak] = await Promise.all([
      getDueReviews(supabase, user.id),
      getMasterySummary(supabase, user.id),
      getSecuredSubjects(supabase, user.id),
      getPresenceStats(supabase),
      getUserActiveSessions(user.id),
      getNearestCohort(supabase),
      getProgressMap(supabase, user.id),
      getWeakestSubject(supabase, user.id),
    ])
    dueReviews = due
    mastery = summary
    securedSubjects = secured
    presence = presenceStats
    cohort = nearest
    progressMap = pmap
    weakest = weak
    const first = active[0]
    if (first) {
      continueSession = { id: first.id, examName: first.exams.name, mode: first.mode }
    }
    // Last engaged lesson (teach-first ordering is resolved client-side;
    // here we only supply the candidate).
    const { data: lastAttempts } = await supabase
      .from('learning_attempts')
      .select('lesson_id')
      .eq('user_id', user.id)
      .not('lesson_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(10)
    for (const row of lastAttempts ?? []) {
      const note = (row as { lesson_id: string }).lesson_id
        ? getNoteById((row as { lesson_id: string }).lesson_id)
        : null
      if (note) {
        continueLesson = { noteId: note.id, subject: note.subject, slug: note.slug, topic: note.topic }
        break
      }
    }
  } catch {
    dueReviews = []
  }

  return {
    profile: {
      username: payload.profile.username,
      email: user.email ?? '',
      isPro: isJambPro,
      isTrial,
      trialExpiresAt,
      badgeLabel,
      badgeBg,
      referralCode: payload.profile.referral_code,
      schoolId: payload.profile.school_id,
    },
    streak: { current_streak: learningDays, longest_streak: 0 },
    recentSessions,
    review: {
      due: dueReviews,
      securedCount: mastery.securedCount,
      trackedCount: mastery.totalCount,
      securedSubjects,
    },
    presence,
    continueSession,
    continueLesson,
    cohort,
    progressMap,
    weakest,
  }
}
