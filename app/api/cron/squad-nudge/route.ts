import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAuthorizedCron } from '@/lib/cron'
import { sendEmail } from '@/lib/emails/send'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const MAX_EMAILS = 90
const ACTIVE_WINDOW_DAYS = 7
const ONE_DAY_MS = 24 * 60 * 60 * 1000
const MIN_MEMBERS = 3

/**
 * Weekly squad nudge. A pre-written signal, not a comparison: collective
 * counts only, no names, no scores, and nothing is sent for a squad too small
 * to hide its members inside an aggregate.
 */
export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    return NextResponse.json({ ok: true, skipped: 'email not configured' })
  }

  const admin = createAdminClient()
  const since = new Date(Date.now() - ACTIVE_WINDOW_DAYS * ONE_DAY_MS).toISOString()

  const [membersResult, sessionsResult, securedResult] = await Promise.all([
    admin.from('squad_members').select('squad_id, user_id').limit(5000),
    admin
      .from('exam_sessions')
      .select('user_id')
      .eq('status', 'completed')
      .gte('completed_at', since)
      .limit(5000),
    admin
      .from('learner_topic_mastery')
      .select('user_id')
      .is('topic_id', null)
      .eq('status', 'secured')
      .gte('updated_at', since)
      .limit(5000),
  ])

  const bySquad = new Map<string, string[]>()
  for (const row of membersResult.data ?? []) {
    const squadId = row.squad_id as string
    const memberId = row.user_id as string
    const list = bySquad.get(squadId) ?? []
    list.push(memberId)
    bySquad.set(squadId, list)
  }

  const sessionRows = (sessionsResult.data ?? []) as { user_id: string }[]
  const securedRows = (securedResult.data ?? []) as { user_id: string }[]
  const sessionCount = new Map<string, number>()
  const securedCount = new Map<string, number>()
  for (const row of sessionRows) {
    sessionCount.set(row.user_id, (sessionCount.get(row.user_id) ?? 0) + 1)
  }
  for (const row of securedRows) {
    securedCount.set(row.user_id, (securedCount.get(row.user_id) ?? 0) + 1)
  }

  const candidateIds = [...new Set([...bySquad.values()].flat())]
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, username, notifications_enabled, squads_enabled')
    .in('id', candidateIds)
    .eq('notifications_enabled', true)
    .eq('squads_enabled', true)

  const profileById = new Map(
    (profiles ?? []).map((row) => [row.id as string, row]),
  )

  const { data: squads } = await admin
    .from('squads')
    .select('id, exams!inner(name)')
    .in('id', [...bySquad.keys()])

  const examNameById = new Map(
    (squads ?? []).map((row) => {
      const exam = Array.isArray(row.exams) ? row.exams[0] : row.exams
      return [row.id as string, (exam as { name?: string } | null)?.name ?? 'your exam']
    }),
  )

  const emailableBySquad = new Map<string, string[]>()
  for (const [squadId, members] of bySquad) {
    const candidates = members.filter((memberId) => profileById.has(memberId))
    if (candidates.length > 0) emailableBySquad.set(squadId, candidates)
  }

  const { data: usersPage } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const emailById = new Map(
    (usersPage?.users ?? [])
      .filter((user) => !!user.email)
      .map((user) => [user.id, user.email as string]),
  )

  let sent = 0
  let failed = 0

  for (const [squadId, members] of bySquad) {
    const examName = examNameById.get(squadId) ?? 'your exam'
    const totalSessions = members.reduce((sum, id) => sum + (sessionCount.get(id) ?? 0), 0)
    const totalSecured = members.reduce((sum, id) => sum + (securedCount.get(id) ?? 0), 0)
    if (members.length < MIN_MEMBERS || totalSessions === 0) continue

    const recipients = emailableBySquad.get(squadId) ?? []
    for (const memberId of recipients) {
      if (sent >= MAX_EMAILS) break
      const email = emailById.get(memberId)
      if (!email) continue

      const profile = profileById.get(memberId)
      const name = (profile?.username as string | null)?.trim() || 'there'
      const text = [
        `Hi ${name},`,
        '',
        `Your study squad for ${examName} is moving.`,
        '',
        `The squad completed ${totalSessions} session${totalSessions === 1 ? '' : 's'} and secured ${totalSecured} subject${totalSecured === 1 ? '' : 's'} this week. No names, no scores — just people showing up for the same exam.`,
        '',
        'Open Propeida and pick up where you left off: https://propeida.online/home',
        '',
        'Want fewer emails? Turn cohort updates off in Settings: https://propeida.online/account/settings',
      ].join('\n')
      const html = `
        <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#101c33">
          <p style="margin:0 0 16px 0;font-size:16px">Hi <strong>${escapeHtml(name)}</strong>,</p>
          <p style="margin:0 0 16px 0;font-size:16px">Your study squad for <strong>${escapeHtml(examName)}</strong> is moving.</p>
          <p style="margin:0 0 16px 0;font-size:15px">The squad completed <strong>${totalSessions}</strong> session${totalSessions === 1 ? '' : 's'} and secured <strong>${totalSecured}</strong> subject${totalSecured === 1 ? '' : 's'} this week. No names, no scores — just people showing up for the same exam.</p>
          <p style="margin:0 0 16px 0"><a href="https://propeida.online/home" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:14px">Open Propeida</a></p>
          <p style="margin:0;font-size:12px;color:#667085">Want fewer emails? Turn cohort updates off in <a href="https://propeida.online/account/settings" style="color:#2563eb">Settings</a>.</p>
        </div>
      `

      const result = await sendEmail({
        to: email,
        subject: 'Your study squad is moving',
        text,
        html,
      })
      if (result.ok) sent += 1
      else failed += 1
    }
  }

  return NextResponse.json({ ok: true, sent, failed })
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
