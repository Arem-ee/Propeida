'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function fetchProfileWithRetry(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const delays = [300, 600, 1200]
  for (let attempt = 0; attempt <= 3; attempt++) {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, referral_code, school_id, ai_features_enabled, is_admin, avatar_index')
      .eq('id', userId)
      .single()

    if (data) return data

    if (error && error.code !== 'PGRST116') {
      console.error(`[getDashboardData] Profile fetch attempt ${attempt + 1}/4 unexpected error:`, error)
      throw error
    }

    console.error(`[getDashboardData] Profile fetch attempt ${attempt + 1}/4 failed (not found)`)

    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, delays[attempt]))
    }
  }

  throw new Error('Profile not found')
}

function isActiveEntitlement(status: string, expiresAt: string | null): boolean {
  if (status !== 'active') return false
  if (expiresAt && new Date(expiresAt) <= new Date()) return false
  return true
}

export async function getDashboardData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const today = new Date().toISOString().split('T')[0]!

  const [
    profile,
    entitlementsRes,
    streakRes,
    historyRes,
    _dailyRes,
    dailyQuestionRes,
  ] = await Promise.all([
    fetchProfileWithRetry(supabase, user.id),
    supabase.from('entitlements').select('product, status, expires_at, source').eq('user_id', user.id),
    supabase.from('streaks').select('current_streak, longest_streak').eq('user_id', user.id).maybeSingle(),
    supabase.from('exam_sessions').select(`
      id, mode, completed_at,
      exams!inner(name),
      results!inner(score, accuracy)
    `).eq('user_id', user.id).eq('status', 'completed').order('completed_at', { ascending: false }).limit(5),
    supabase.rpc('ensure_daily_question'),
    supabase.from('daily_questions').select('id').eq('date', today).maybeSingle(),
  ])

  if (_dailyRes.error) console.error('[getDashboardData] ensure_daily_question RPC error:', _dailyRes.error)

  const entitlements = entitlementsRes.data ?? []
  const activeEntitlements = entitlements.filter((e) => isActiveEntitlement(e.status, e.expires_at))
  const jambEntitlement = activeEntitlements.find((e) => e.product === 'jamb_pro') ?? null
  const isJambPro = !!(jambEntitlement || activeEntitlements.some((e) => e.product === 'jamb_premium_ai'))
  const isTrial = jambEntitlement?.source === 'referral_trial'
  const trialExpiresAt = jambEntitlement?.expires_at ?? null

  const streakData = streakRes.data ?? { current_streak: 0, longest_streak: 0 }

  const dailyQuestionId = dailyQuestionRes.data?.id ?? null
  let dailyQuestionAttempt = null
  if (dailyQuestionId) {
    const { data: attempt } = await supabase
      .from('daily_question_attempts')
      .select('is_correct')
      .eq('user_id', user.id)
      .eq('daily_question_id', dailyQuestionId)
      .maybeSingle()
    dailyQuestionAttempt = attempt
  }

  const recentSessions = (historyRes.data ?? []).map((row: Record<string, unknown>) => {
    const e = Array.isArray(row.exams) ? row.exams[0] : row.exams
    const r = Array.isArray(row.results) ? row.results[0] : row.results
    return {
      id: row.id as string,
      mode: row.mode as string,
      examName: (e as { name?: string })?.name ?? 'Unknown',
      score: (r as { score?: number })?.score ?? 0,
      accuracy: (r as { accuracy?: number })?.accuracy ?? 0,
      completedAt: row.completed_at as string,
    }
  })

  const badgeLabel = isJambPro ? (isTrial ? 'Pro Trial' : 'Pro') : 'Free'
  const badgeBg = isJambPro ? (isTrial ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700') : 'bg-gray-50 text-gray-500'

  return {
    profile: {
      username: profile.username,
      email: user.email ?? '',
      isPro: isJambPro,
      isTrial,
      trialExpiresAt,
      badgeLabel,
      badgeBg,
      referralCode: profile.referral_code,
      schoolId: profile.school_id,
      avatarIndex: profile.avatar_index,
    },
    streak: streakData,
    dailyQuestion: {
      id: dailyQuestionId,
      attempt: dailyQuestionAttempt,
    },
    recentSessions,
  }
}

export async function submitDailyQuestion(dailyQuestionId: string, selectedAnswer: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
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
