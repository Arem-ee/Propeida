'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getActiveProducts, getEntitlement } from '@/lib/entitlements'

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

export async function getDashboardData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const profile = await fetchProfileWithRetry(supabase, user.id)
  const activeProducts = await getActiveProducts(user.id)

  const jambEntitlement = await getEntitlement(user.id, 'jamb_pro')
  const isJambPro = !!(jambEntitlement || activeProducts.includes('jamb_premium_ai'))
  const isTrial = jambEntitlement?.source === 'referral_trial'
  const trialExpiresAt = jambEntitlement?.expires_at ?? null

  const { data: jambExam } = await supabase.from('exams').select('id').eq('slug', 'jamb').single()
  const jambId = jambExam?.id ?? ''

  const [streakRes, historyRes, _dailyRes, dailyQuestionRes, lbAllRes, lbWeeklyRes] = await Promise.all([
    supabase.from('streaks').select('current_streak, longest_streak').eq('user_id', user.id).maybeSingle(),
    supabase.from('exam_sessions').select(`
      id, mode, completed_at,
      exams!inner(name),
      results!inner(score, accuracy)
    `).eq('user_id', user.id).eq('status', 'completed').order('completed_at', { ascending: false }).limit(5),
    supabase.rpc('ensure_daily_question'),
    supabase.from('daily_questions').select('id').eq('date', new Date().toISOString().split('T')[0]).maybeSingle(),
    supabase.from('leaderboard_entries').select('user_id, score, profiles!inner(username, avatar_index)').eq('period', 'all_time').eq('exam_id', jambId).order('score', { ascending: false }).limit(5),
    supabase.from('leaderboard_entries').select('user_id, score, profiles!inner(username, avatar_index)').eq('period', 'weekly').eq('exam_id', jambId).order('score', { ascending: false }).limit(5),
  ])

  if (_dailyRes.error) console.error('[getDashboardData] ensure_daily_question RPC error:', _dailyRes.error)
  if (lbAllRes.error) console.error('[getDashboardData] leaderboard all_time error:', lbAllRes.error)
  if (lbWeeklyRes.error) console.error('[getDashboardData] leaderboard weekly error:', lbWeeklyRes.error)

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

  const lbAllRows = (lbAllRes.data ?? []) as unknown as { user_id: string; score: number; profiles?: { username: string; avatar_index: number | null }[] }[]
  const lbWeeklyRows = (lbWeeklyRes.data ?? []) as unknown as { user_id: string; score: number; profiles?: { username: string; avatar_index: number | null }[] }[]

  const leaderboardAllTime = lbAllRows.map((entry) => ({
    username: entry.profiles?.at(0)?.username ?? 'Unknown',
    avatarIndex: entry.profiles?.at(0)?.avatar_index ?? null,
    score: entry.score,
  }))
  const leaderboardWeekly = lbWeeklyRows.map((entry) => ({
    username: entry.profiles?.at(0)?.username ?? 'Unknown',
    avatarIndex: entry.profiles?.at(0)?.avatar_index ?? null,
    score: entry.score,
  }))

  let userRank = null
  if (user.id) {
    const { data: allTimeEntry } = await supabase
      .from('leaderboard_entries')
      .select('score')
      .eq('user_id', user.id)
      .eq('exam_id', jambId)
      .eq('period', 'all_time')
      .maybeSingle()

    const { data: weeklyEntry } = await supabase
      .from('leaderboard_entries')
      .select('score')
      .eq('user_id', user.id)
      .eq('exam_id', jambId)
      .eq('period', 'weekly')
      .maybeSingle()

    const allTimeScore = allTimeEntry?.score ?? 0
    const weeklyScore = weeklyEntry?.score ?? 0

    const { count: allTimeRank } = await supabase
      .from('leaderboard_entries')
      .select('*', { count: 'exact', head: true })
      .eq('period', 'all_time')
      .eq('exam_id', jambId)
      .gt('score', allTimeScore)

    const { count: weeklyRank } = await supabase
      .from('leaderboard_entries')
      .select('*', { count: 'exact', head: true })
      .eq('period', 'weekly')
      .eq('exam_id', jambId)
      .gt('score', weeklyScore)

    userRank = {
      allTime: allTimeEntry ? (allTimeRank ?? 0) + 1 : null,
      weekly: weeklyEntry ? (weeklyRank ?? 0) + 1 : null,
    }
  }

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
    leaderboard: {
      allTime: leaderboardAllTime,
      weekly: leaderboardWeekly,
    },
    userRank,
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
