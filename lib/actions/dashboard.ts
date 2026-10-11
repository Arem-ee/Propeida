'use server'

import { createClient, getAuthUser } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getDueReviews, getMasterySummary, getSecuredSubjects, getPresenceStats } from '@/lib/mastery'
import { getUserActiveSessions } from '@/lib/practice'
import { getNearestCohort } from '@/lib/cohort'

interface DashboardPayload {
  profile: {
    username: string
    referral_code: string
    school_id: string | null
    ai_features_enabled: boolean
    is_admin: boolean
    avatar_index: number | null
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
  daily_question: { id: string; attempt: { is_correct: boolean } | null } | null
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

  const streakData = payload.streak ?? { current_streak: 0, longest_streak: 0 }

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
  let cohort: {
    examName: string
    year: number
    daysLeft: number | null
    verified: boolean
    weeklyActive: number
  } | null = null
  try {
    const [due, summary, secured, presenceStats, active, nearest] = await Promise.all([
      getDueReviews(supabase, user.id),
      getMasterySummary(supabase, user.id),
      getSecuredSubjects(supabase, user.id),
      getPresenceStats(supabase),
      getUserActiveSessions(user.id),
      getNearestCohort(supabase),
    ])
    dueReviews = due
    mastery = summary
    securedSubjects = secured
    presence = presenceStats
    cohort = nearest
    const first = active[0]
    if (first) {
      continueSession = { id: first.id, examName: first.exams.name, mode: first.mode }
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
      avatarIndex: payload.profile.avatar_index,
    },
    streak: streakData,
    dailyQuestion: {
      id: payload.daily_question?.id ?? null,
      attempt: payload.daily_question?.attempt ?? null,
    },
    recentSessions,
    review: {
      due: dueReviews,
      securedCount: mastery.securedCount,
      trackedCount: mastery.totalCount,
      securedSubjects,
    },
    presence,
    continueSession,
    cohort,
  }
}

export async function submitDailyQuestion(dailyQuestionId: string, selectedAnswer: string) {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Not authenticated')

  const { data: submission, error: submissionError } = await supabase.rpc('submit_daily_question_answer', {
    p_daily_question_id: dailyQuestionId,
    p_selected_answer: selectedAnswer,
  })
  const submissionRow = Array.isArray(submission) ? submission[0] : null
  if (submissionError || !submissionRow) throw new Error('Failed to submit answer')

  revalidatePath('/dashboard')

  return { isCorrect: submissionRow.is_correct, correctAnswer: submissionRow.correct_answer }
}
