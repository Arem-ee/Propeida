'use server'

import { revalidatePath } from 'next/cache'
import { createClient, getAuthUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getExamScope, examPathLabel } from '@/lib/exam-scope'

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
  return (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://propeida.online').replace(/\/+$/, '')
}

function friendlyInviteError(message: string): string {
  if (message.includes('Invite not found')) return 'That squad link is not valid.'
  if (message.includes('already in a squad')) return 'You are already in a study squad.'
  if (message.includes('That squad is full')) return 'That squad is full. Ask to be matched with a new one.'
  return 'Could not join that squad.'
}

function friendlyJoinError(message: string): string {
  if (message.includes('authenticated')) return 'Sign in and try again.'
  return 'Could not create your squad.'
}

export async function getSquadStatus(): Promise<SquadStatus> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Please sign in again.')

  const admin = createAdminClient()
  const [scope, { data: profile }, membershipResult] = await Promise.all([
    getExamScope(admin, user.id),
    admin.from('profiles').select('squads_enabled').eq('id', user.id).maybeSingle(),
    admin
      .from('squad_members')
      .select(
        'squad_id, joined_at, squads!inner(exam_id, exam_target, cycle_year, max_members, invite_code, exams!inner(name))',
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
      ? 'Choose the exam you are writing first.'
      : 'Choose JAMB or Post-UTME first — a squad is built around one exam.'
  const ctaHref = eligible ? null : scope.restricted ? '/target' : '/account'
  const ctaLabel = eligible
    ? null
    : scope.restricted
      ? 'Choose your school'
      : 'Choose your exam path'

  const row = membershipResult.data as
    | {
        squad_id: string
        joined_at: string
        squads:
          | {
              exam_id: string
              exam_target: string | null
              cycle_year: number | null
              max_members: number
              invite_code: string
              exams: { name: string } | { name: string }[] | null
            }
          | {
              exam_id: string
              exam_target: string | null
              cycle_year: number | null
              max_members: number
              invite_code: string
              exams: { name: string } | { name: string }[] | null
            }[]
          | null
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
  if (!squadRow) throw new Error('Your squad could not be loaded.')
  const examRow = Array.isArray(squadRow.exams) ? squadRow.exams[0] : squadRow.exams
  const examName = examRow?.name ?? 'Your exam'

  const squadId = row.squad_id
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
  if (!user) throw new Error('Please sign in again.')

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
    throw new Error('Choose your exam path first.')
  }

  await admin.from('profiles').update({ squads_enabled: true }).eq('id', user.id)

  const cycleYear = await getCycleYear(admin, scope.primaryExamId)
  const { data, error } = await supabase.rpc('join_my_squad', {
    p_exam_id: scope.primaryExamId,
    p_exam_target: scope.target,
    p_cycle_year: cycleYear,
  })

  if (error) {
    if (!wasEnabled) await admin.from('profiles').update({ squads_enabled: false }).eq('id', user.id)
    throw new Error(friendlyJoinError(error.message))
  }

  revalidatePath('/squad')
  return { squadId: data as string }
}

export async function joinSquadByInvite(code: string): Promise<{ squadId: string }> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Please sign in again.')

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(code)) {
    throw new Error('That squad link is not valid.')
  }

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('squads_enabled')
    .eq('id', user.id)
    .maybeSingle()
  const wasEnabled =
    (profile as { squads_enabled?: boolean } | null)?.squads_enabled ?? false

  await admin.from('profiles').update({ squads_enabled: true }).eq('id', user.id)

  const { data, error } = await supabase.rpc('join_squad_by_invite', { p_code: code })
  if (error) {
    if (!wasEnabled) await admin.from('profiles').update({ squads_enabled: false }).eq('id', user.id)
    throw new Error(friendlyInviteError(error.message))
  }

  revalidatePath('/squad')
  return { squadId: data as string }
}

export async function leaveSquad(): Promise<void> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Please sign in again.')

  const admin = createAdminClient()
  await admin.from('profiles').update({ squads_enabled: false }).eq('id', user.id)
  const { error } = await supabase.rpc('leave_my_squad')
  if (error) throw new Error('Could not leave your squad.')

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
  if (!user) throw new Error('Please sign in again.')

  const start = new Date(startsAt)
  if (Number.isNaN(start.getTime())) throw new Error('Choose a valid date and time.')
  const leadMs = start.getTime() - Date.now()
  if (leadMs < 5 * 60 * 1000) throw new Error('Pick a time at least five minutes from now.')
  if (leadMs > 30 * 24 * 60 * 60 * 1000) throw new Error('Pick a time within the next 30 days.')

  const admin = createAdminClient()
  const membership = await getMembershipWithExam(admin, user.id)
  if (!membership) throw new Error('Join a squad before scheduling a mock window.')

  const { data: existing } = await admin
    .from('squad_mock_windows')
    .select('id')
    .eq('squad_id', membership.squadId)
    .gte('starts_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
    .limit(1)
    .maybeSingle()
  if (existing) throw new Error('Your squad already has a mock window.')

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
  if (error || !data) throw new Error('Could not schedule the mock window.')

  revalidatePath('/squad')
  return { windowId: data.id as string }
}

export async function cancelSquadMockWindow(windowId: string): Promise<void> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Please sign in again.')

  const admin = createAdminClient()
  const membership = await getMembershipWithExam(admin, user.id)
  if (!membership) throw new Error('You are not in a squad.')

  const { data: windowRow } = await admin
    .from('squad_mock_windows')
    .select('id, squad_id, created_by')
    .eq('id', windowId)
    .maybeSingle()
  if (!windowRow || windowRow.squad_id !== membership.squadId) {
    throw new Error('That mock window does not belong to your squad.')
  }
  if (windowRow.created_by !== user.id) {
    throw new Error('Only the learner who set this window can cancel it.')
  }

  const { error } = await admin.from('squad_mock_windows').delete().eq('id', windowId)
  if (error) throw new Error('Could not cancel the mock window.')

  revalidatePath('/squad')
}
