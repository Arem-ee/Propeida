'use server'

import { revalidatePath } from 'next/cache'
import { createClient, getAuthUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getExamScope, examPathLabel } from '@/lib/exam-scope'
import { siteUrl } from '@/lib/site-url'
import { reportError } from '@/lib/error-report'
import {
  GOAL_PRESETS,
  SQUAD_COLORS,
  SQUAD_MARK_KEYS,
  addDays,
  mondayUtc,
  resolveSquadIdentity,
  sanitizeSquadName,
  type GoalKind,
} from '@/lib/squad-identity'

export interface SquadGoalStatus {
  kind: GoalKind
  target: number
  weekStart: string
  /** Null when the squad has fewer than 3 members — totals stay hidden. */
  current: number | null
  /** Null when current is null. */
  met: boolean | null
}

export interface SquadStatus {
  joined: boolean
  /** Consent to be matched. False means we never put this learner in a squad. */
  squadsEnabled: boolean
  /** Restricted to a declared path with an attached exam. */
  eligible: boolean
  ineligibleReason: string | null
  pathLabel: string
  ctaHref: string | null
  ctaLabel: string | null
  squad: {
    id: string
    examName: string
    cycleYear: number | null
    memberCount: number
    maxMembers: number
    inviteUrl: string
    shareMessage: string
    /** Display identity — stored, or deterministic fallback for legacy squads. */
    name: string
    mark: string
    color: string
    /** True while the squad still carries its generated default identity. */
    isDefaultName: boolean
    /** Consecutive weeks with the shared goal met. Null below 3 members. */
    streakWeeks: number | null
    /** This week's shared goal, if one is set. Null when unset. */
    goal: SquadGoalStatus | null
    /** Only present for 3+ members. Aggregates, never individuals. */
    weekly: { sessions: number; secured: number; activeMembers: number } | null
    /** Next shared mock window for this squad, if one is scheduled. */
    mockWindow: { id: string; startsAt: string; canCancel: boolean } | null
    joinedAt: string
  } | null
}

async function getCycleYear(
  admin: ReturnType<typeof createAdminClient>,
  examId: string,
): Promise<number | null> {
  const { data } = await admin
    .from('exam_cycles')
    .select('year')
    .eq('exam_id', examId)
    .order('year', { ascending: false })
    .limit(1)
    .maybeSingle()
  return typeof data?.year === 'number' ? data.year : null
}

function baseUrl(): string {
  return siteUrl()
}

function friendlyInviteError(message: string): string {
  if (message.includes('Invite not found')) return 'That squad link is not valid'
  if (message.includes('already in a squad')) return 'You are already in a study squad'
  if (message.includes('That squad is full')) return 'That squad is full, so you need a different invite link'
  return 'Could not join that squad'
}

function friendlyJoinError(message: string): string {
  if (message.includes('authenticated')) return 'You need to sign in before you try again'
  return 'Could not create your squad'
}

type Admin = ReturnType<typeof createAdminClient>

interface GoalRow {
  week_start: string
  kind: GoalKind
  target: number
}

function weekBoundsIso(weekStart: string): { startIso: string; endIso: string } {
  const start = new Date(`${weekStart}T00:00:00.000Z`)
  return {
    startIso: start.toISOString(),
    endIso: new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  }
}

/**
 * Shared squad goal progress. Counts are squad-wide aggregates only —
 * session_answers joins through exam_sessions because answers carry no
 * timestamp of their own; "secured" mirrors the subject-level figure already
 * shown in the weekly card (topic_id null, status secured).
 */
async function countGoalProgress(
  admin: Admin,
  memberIds: string[],
  kind: GoalKind,
  weekStart: string,
): Promise<number> {
  const { startIso, endIso } = weekBoundsIso(weekStart)
  if (kind === 'questions') {
    const { count } = await admin
      .from('session_answers')
      .select('id, exam_sessions!inner(user_id, completed_at)', { count: 'exact', head: true })
      .in('exam_sessions.user_id', memberIds)
      .gte('exam_sessions.completed_at', startIso)
      .lt('exam_sessions.completed_at', endIso)
    return count ?? 0
  }
  const { count } = await admin
    .from('learner_topic_mastery')
    .select('id', { count: 'exact', head: true })
    .in('user_id', memberIds)
    .is('topic_id', null)
    .eq('status', 'secured')
    .gte('updated_at', startIso)
    .lt('updated_at', endIso)
  return count ?? 0
}

/** Goal rows for the current and previous `weeksBack` ISO weeks, keyed by week_start. */
async function loadSquadGoals(
  admin: Admin,
  squadId: string,
  weeksBack: number,
): Promise<Map<string, GoalRow>> {
  const since = addDays(mondayUtc(new Date()), -7 * weeksBack)
  const { data } = await admin
    .from('squad_weekly_goals')
    .select('week_start, kind, target')
    .eq('squad_id', squadId)
    .gte('week_start', since)
  const map = new Map<string, GoalRow>()
  for (const row of data ?? []) {
    map.set(String(row.week_start), {
      week_start: String(row.week_start),
      kind: row.kind as GoalKind,
      target: row.target as number,
    })
  }
  return map
}

const STREAK_LOOKBACK_WEEKS = 12

export async function getSquadStatus(): Promise<SquadStatus> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Please sign in again')

  const admin = createAdminClient()
  const [scope, { data: profile }, membershipResult] = await Promise.all([
    getExamScope(admin, user.id),
    admin.from('profiles').select('squads_enabled').eq('id', user.id).maybeSingle(),
    admin
      .from('squad_members')
      .select(
        'squad_id, joined_at, squads!inner(id, exam_id, exam_target, cycle_year, max_members, invite_code, name, emoji, color, exams!inner(name))',
      )
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  const squadsEnabled = (profile as { squads_enabled?: boolean } | null)?.squads_enabled ?? false
  const pathLabel = examPathLabel(scope)
  const examIds = scope.examIds ?? []
  const eligible = scope.restricted && examIds.length > 0 && !!scope.primaryExamId
  const ineligibleReason = eligible
    ? null
    : scope.restricted
      ? 'Choose the exam you are taking first'
      : 'Choose JAMB or Post-UTME first because a squad is built around one exam'
  const ctaHref = eligible ? null : scope.restricted ? '/target' : '/account'
  const ctaLabel = eligible
    ? null
    : scope.restricted
      ? 'Choose your school'
      : 'Choose your exam path'

  type SquadShape = {
    id: string
    exam_id: string
    exam_target: string | null
    cycle_year: number | null
    max_members: number
    invite_code: string
    name: string | null
    emoji: string | null
    color: string | null
    exams: { name: string } | { name: string }[] | null
  }
  const row = membershipResult.data as
    | {
        squad_id: string
        joined_at: string
        squads: SquadShape | SquadShape[] | null
      }
    | null

  if (!row) {
    return {
      joined: false,
      squadsEnabled,
      eligible,
      ineligibleReason,
      pathLabel,
      ctaHref,
      ctaLabel,
      squad: null,
    }
  }

  const squadRow = Array.isArray(row.squads) ? row.squads[0] : row.squads
  if (!squadRow) throw new Error('Your squad could not be loaded')
  const examRow = Array.isArray(squadRow.exams) ? squadRow.exams[0] : squadRow.exams
  const examName = examRow?.name ?? 'Your exam'

  const squadId = row.squad_id
  const identity = resolveSquadIdentity({
    id: squadId,
    name: squadRow.name,
    emoji: squadRow.emoji,
    color: squadRow.color,
  })
  const { data: members } = await admin
    .from('squad_members')
    .select('user_id')
    .eq('squad_id', squadId)
  const memberIds = [...new Set((members ?? []).map((member) => member.user_id as string))]
  const memberCount = memberIds.length

  const { data: mockWindowRow } = await admin
    .from('squad_mock_windows')
    .select('id, created_by, starts_at')
    .eq('squad_id', squadId)
    .gte('starts_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
    .order('starts_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  type SquadWeekly = NonNullable<SquadStatus['squad']>['weekly']
  let weekly: SquadWeekly = null
  if (memberCount >= 3 && squadId) {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const [sessionsResult, securedResult] = await Promise.all([
      admin
        .from('exam_sessions')
        .select('user_id')
        .in('user_id', memberIds)
        .eq('status', 'completed')
        .gte('completed_at', since)
        .limit(5000),
      admin
        .from('learner_topic_mastery')
        .select('user_id')
        .in('user_id', memberIds)
        .is('topic_id', null)
        .eq('status', 'secured')
        .gte('updated_at', since)
        .limit(5000),
    ])
    const sessionRows = (sessionsResult.data ?? []) as { user_id: string }[]
    weekly = {
      sessions: sessionRows.length,
      secured: (securedResult.data ?? []).length,
      activeMembers: new Set(sessionRows.map((r) => r.user_id)).size,
    }
  }

  const inviteUrl = `${baseUrl()}/squad?join=${squadRow.invite_code}`
  const shareMessage = `I'm studying for ${examName} on Propeida. Join my squad: ${inviteUrl}`

  // Shared weekly goal + cooperative streak. Counts only exist for squads
  // with 3+ members — below that we never compute or show squad totals.
  const thisWeek = mondayUtc(new Date())
  const goals = await loadSquadGoals(admin, squadId, STREAK_LOOKBACK_WEEKS)
  const goalRow = goals.get(thisWeek) ?? null
  let goal: SquadGoalStatus | null = null
  if (goalRow) {
    if (memberCount >= 3) {
      const current = await countGoalProgress(admin, memberIds, goalRow.kind, thisWeek)
      goal = {
        kind: goalRow.kind,
        target: goalRow.target,
        weekStart: thisWeek,
        current,
        met: current >= goalRow.target,
      }
    } else {
      goal = { kind: goalRow.kind, target: goalRow.target, weekStart: thisWeek, current: null, met: null }
    }
  }

  let streakWeeks: number | null = null
  if (memberCount >= 3) {
    let streak = goal?.met ? 1 : 0
    for (let offset = 1; offset < STREAK_LOOKBACK_WEEKS; offset++) {
      const weekStart = addDays(thisWeek, -7 * offset)
      const past = goals.get(weekStart)
      if (!past) break
      const progress = await countGoalProgress(admin, memberIds, past.kind, weekStart)
      if (progress < past.target) break
      streak += 1
    }
    streakWeeks = streak
  }

  return {
    joined: true,
    squadsEnabled,
    eligible,
    ineligibleReason,
    pathLabel,
    ctaHref,
    ctaLabel,
    squad: {
      id: squadId,
      examName,
      cycleYear: squadRow.cycle_year,
      memberCount,
      maxMembers: squadRow.max_members,
      inviteUrl,
      shareMessage,
      name: identity.name,
      mark: identity.mark,
      color: identity.color,
      isDefaultName: identity.isDefault,
      streakWeeks,
      goal,
      weekly,
      mockWindow: mockWindowRow
        ? {
            id: mockWindowRow.id as string,
            startsAt: mockWindowRow.starts_at as string,
            canCancel: mockWindowRow.created_by === user.id,
          }
        : null,
      joinedAt: row.joined_at,
    },
  }
}

export async function joinMySquad(): Promise<{ squadId: string }> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Please sign in again')

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('squads_enabled')
    .eq('id', user.id)
    .maybeSingle()
  const wasEnabled =
    (profile as { squads_enabled?: boolean } | null)?.squads_enabled ?? false

  const scope = await getExamScope(admin, user.id)
  if (!scope.restricted || !scope.examIds || scope.examIds.length === 0 || !scope.primaryExamId) {
    throw new Error('Choose your exam path first')
  }

  const { error: flagError } = await admin.from('profiles').update({ squads_enabled: true }).eq('id', user.id)
  if (flagError) {
    void reportError('squad/enable-flag', flagError)
    throw new Error('Could not open squads for your account')
  }

  const cycleYear = await getCycleYear(admin, scope.primaryExamId)
  const { data, error } = await supabase.rpc('join_my_squad', {
    p_exam_id: scope.primaryExamId,
    p_exam_target: scope.target,
    p_cycle_year: cycleYear,
  })

  if (error) {
    if (!wasEnabled) {
      const { error: undoError } = await admin.from('profiles').update({ squads_enabled: false }).eq('id', user.id)
      if (undoError) void reportError('squad/undo-flag', undoError)
    }
    throw new Error(friendlyJoinError(error.message))
  }

  revalidatePath('/squad')
  return { squadId: data as string }
}

export async function joinSquadByInvite(code: string): Promise<{ squadId: string }> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Please sign in again')

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(code)) {
    throw new Error('That squad link is not valid')
  }

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('squads_enabled')
    .eq('id', user.id)
    .maybeSingle()
  const wasEnabled =
    (profile as { squads_enabled?: boolean } | null)?.squads_enabled ?? false

  const { error: flagError } = await admin.from('profiles').update({ squads_enabled: true }).eq('id', user.id)
  if (flagError) {
    void reportError('squad/enable-flag', flagError)
    throw new Error('Could not open squads for your account')
  }

  const { data, error } = await supabase.rpc('join_squad_by_invite', { p_code: code })
  if (error) {
    if (!wasEnabled) {
      const { error: undoError } = await admin.from('profiles').update({ squads_enabled: false }).eq('id', user.id)
      if (undoError) void reportError('squad/undo-flag', undoError)
    }
    throw new Error(friendlyInviteError(error.message))
  }

  revalidatePath('/squad')
  return { squadId: data as string }
}

export async function leaveSquad(): Promise<void> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Please sign in again')

  const admin = createAdminClient()
  const { error: flagError } = await admin.from('profiles').update({ squads_enabled: false }).eq('id', user.id)
  if (flagError) {
    void reportError('squad/disable-flag', flagError)
    throw new Error('Could not update your squad settings')
  }
  const { error } = await supabase.rpc('leave_my_squad')
  if (error) throw new Error('Could not leave your squad')

  revalidatePath('/squad')
}

async function getMembershipWithExam(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
): Promise<{ squadId: string; examId: string } | null> {
  const { data } = await admin
    .from('squad_members')
    .select('squad_id, squads!inner(exam_id)')
    .eq('user_id', userId)
    .maybeSingle()

  const row = data as {
    squad_id: string
    squads: { exam_id: string } | { exam_id: string }[]
  } | null
  if (!row) return null
  const joined = Array.isArray(row.squads) ? row.squads[0] : row.squads
  if (!joined?.exam_id) return null
  return { squadId: row.squad_id, examId: joined.exam_id }
}

/**
 * Schedule one shared mock sitting for the whole squad. It does not compare
 * scores — it fixes the time, so everyone sits under the same conditions.
 */
export async function createSquadMockWindow(startsAt: string): Promise<{ windowId: string }> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Please sign in again')

  const start = new Date(startsAt)
  if (Number.isNaN(start.getTime())) throw new Error('Choose a valid date and time')
  const leadMs = start.getTime() - Date.now()
  if (leadMs < 5 * 60 * 1000) throw new Error('Pick a time at least five minutes from now')
  if (leadMs > 30 * 24 * 60 * 60 * 1000) throw new Error('Pick a time within the next 30 days')

  const admin = createAdminClient()
  const membership = await getMembershipWithExam(admin, user.id)
  if (!membership) throw new Error('Join a squad before scheduling a mock window')

  const { data: existing } = await admin
    .from('squad_mock_windows')
    .select('id')
    .eq('squad_id', membership.squadId)
    .gte('starts_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
    .limit(1)
    .maybeSingle()
  if (existing) throw new Error('Your squad already has a mock window')

  const { data, error } = await admin
    .from('squad_mock_windows')
    .insert({
      squad_id: membership.squadId,
      exam_id: membership.examId,
      created_by: user.id,
      starts_at: start.toISOString(),
    })
    .select('id')
    .single()
  if (error || !data) throw new Error('Could not schedule the mock window')

  revalidatePath('/squad')
  return { windowId: data.id as string }
}

export async function cancelSquadMockWindow(windowId: string): Promise<void> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Please sign in again')

  const admin = createAdminClient()
  const membership = await getMembershipWithExam(admin, user.id)
  if (!membership) throw new Error('You are not in a squad')

  const { data: windowRow } = await admin
    .from('squad_mock_windows')
    .select('id, squad_id, created_by')
    .eq('id', windowId)
    .maybeSingle()
  if (!windowRow || windowRow.squad_id !== membership.squadId) {
    throw new Error('That mock window does not belong to your squad')
  }
  if (windowRow.created_by !== user.id) {
    throw new Error('Only the person who set this window can cancel it')
  }

  const { error } = await admin.from('squad_mock_windows').delete().eq('id', windowId)
  if (error) throw new Error('Could not cancel the mock window')

  revalidatePath('/squad')
}

/**
 * Any member may set the squad's shared identity — names are a group thing,
 * not an admin role. Marks and colour come from fixed presets so the palette
 * stays tasteful and legible everywhere it renders.
 */
export async function setSquadIdentity(input: {
  name: string
  mark: string
  color: string
}): Promise<void> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Please sign in again')

  const name = sanitizeSquadName(input.name)
  if (!name) throw new Error('Give your squad a name between 2 and 40 characters')
  if (!(SQUAD_MARK_KEYS as readonly string[]).includes(input.mark)) {
    throw new Error('Pick one of the squad marks')
  }
  if (!(SQUAD_COLORS as readonly string[]).includes(input.color)) {
    throw new Error('Pick one of the squad colours')
  }

  const admin = createAdminClient()
  const membership = await getMembershipWithExam(admin, user.id)
  if (!membership) throw new Error('Join a squad first')

  const { error } = await admin
    .from('squads')
    .update({ name, emoji: input.mark, color: input.color })
    .eq('id', membership.squadId)
  if (error) throw new Error('Could not save your squad identity')

  revalidatePath('/squad')
}

/**
 * Set (or replace) the squad's single shared goal for the current ISO week
 * (Monday-start, UTC). Preset targets only — no arbitrary numbers. The goal
 * is one collective target, never a quota against individuals.
 */
export async function setSquadWeeklyGoal(input: {
  kind: GoalKind
  target: number
}): Promise<void> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Please sign in again')

  const preset = GOAL_PRESETS[input.kind]
  if (!preset) throw new Error('Pick a goal type')
  if (!preset.options.includes(input.target)) throw new Error('Pick one of the preset targets')

  const admin = createAdminClient()
  const membership = await getMembershipWithExam(admin, user.id)
  if (!membership) throw new Error('Join a squad first')

  // Single statement, last write wins — two members picking a target in the
  // same moment never hits a unique-violation race.
  const { error } = await admin
    .from('squad_weekly_goals')
    .upsert(
      {
        squad_id: membership.squadId,
        week_start: mondayUtc(new Date()),
        kind: input.kind,
        target: input.target,
      },
      { onConflict: 'squad_id,week_start' },
    )
  if (error) throw new Error('Could not set the goal')

  revalidatePath('/squad')
}

export interface SquadInvitePreview {
  name: string
  mark: string
  color: string
  examName: string
  cycleYear: number | null
  memberCount: number
  maxMembers: number
}

/**
 * What an invite link may reveal: the squad's name, mark, colour, exam and
 * open seats. Deliberately nothing else — no member names, no activity.
 */
export async function getSquadInvitePreview(code: string): Promise<SquadInvitePreview | null> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(code)) {
    return null
  }

  const admin = createAdminClient()
  const { data } = await admin
    .from('squads')
    .select('id, max_members, cycle_year, name, emoji, color, exams!inner(name)')
    .eq('invite_code', code)
    .maybeSingle()
  if (!data) return null

  const previewRow = data as unknown as {
    id: string
    max_members: number
    cycle_year: number | null
    name: string | null
    emoji: string | null
    color: string | null
    exams: { name: string } | { name: string }[]
  }
  const examRow = Array.isArray(previewRow.exams) ? previewRow.exams[0] : previewRow.exams
  const identity = resolveSquadIdentity(previewRow)

  const { count } = await admin
    .from('squad_members')
    .select('user_id', { count: 'exact', head: true })
    .eq('squad_id', previewRow.id)

  return {
    name: identity.name,
    mark: identity.mark,
    color: identity.color,
    examName: examRow?.name ?? 'Your exam',
    cycleYear: previewRow.cycle_year,
    memberCount: count ?? 0,
    maxMembers: previewRow.max_members,
  }
}
