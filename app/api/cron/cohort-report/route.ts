import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAuthorizedCron } from '@/lib/cron'
import { sendEmail } from '@/lib/emails/send'
import { getCachedPresenceStats } from '@/lib/presence'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const MAX_EMAILS = 90 // Resend's free tier allows 100/day; keep headroom.
const ACTIVE_WINDOW_DAYS = 7
const ONE_DAY_MS = 24 * 60 * 60 * 1000

interface WeeklyRow {
  sessions: number
  secured: number
}

/**
 * Weekly cohort report. Aggregates only: the reader sees their own week plus
 * the cohort's collective totals — never another learner's name, score, or
 * pace (docs §13). Sent only to learners active in the last seven days who
 * left notifications on, capped well under the email provider's daily limit.
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

  const [{ data: sessions }, { data: mastery }, presence] = await Promise.all([
    admin
      .from('exam_sessions')
      .select('user_id')
      .eq('status', 'completed')
      .gte('completed_at', since)
      .limit(5000),
    admin
      .from('learner_topic_mastery')
      .select('user_id')
      .eq('status', 'secured')
      .is('topic_id', null)
      .gte('updated_at', since)
      .limit(5000),
    getCachedPresenceStats(),
  ])

  const weekly = new Map<string, WeeklyRow>()
  for (const row of sessions ?? []) {
    const id = row.user_id as string
    const entry = weekly.get(id) ?? { sessions: 0, secured: 0 }
    entry.sessions += 1
    weekly.set(id, entry)
  }
  for (const row of mastery ?? []) {
    const id = row.user_id as string
    const entry = weekly.get(id) ?? { sessions: 0, secured: 0 }
    entry.secured += 1
    weekly.set(id, entry)
  }

  const activeIds = [...weekly.keys()]
  if (activeIds.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, reason: 'no active learners' })
  }

  const { data: profiles } = await admin
    .from('profiles')
    .select('id, username, notifications_enabled')
    .in('id', activeIds.slice(0, 1000))
    .eq('notifications_enabled', true)
  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, reason: 'no eligible profiles' })
  }

  // Page through every auth user (1000 per page) rather than reading only
  // the first page — cohort sizes past 1000 would otherwise be silently
  // dropped from the report.
  const emailById = new Map<string, string>()
  for (let page = 1; page <= 20; page++) {
    const { data: usersPage } = await admin.auth.admin.listUsers({ page, perPage: 1000 })
    const users = usersPage?.users ?? []
    for (const u of users) {
      if (u.email) emailById.set(u.id, u.email)
    }
    if (users.length < 1000) break
  }

  const cohortSessions = presence?.sessionsThisWeek ?? (sessions ?? []).length
  const cohortSecured = presence?.securedThisWeek ?? (mastery ?? []).length

  let sent = 0
  let failed = 0

  for (const profile of profiles) {
    if (sent >= MAX_EMAILS) break
    const email = emailById.get(profile.id as string)
    if (!email) continue

    const row = weekly.get(profile.id as string) ?? { sessions: 0, secured: 0 }
    const name = (profile.username as string | null)?.trim() || 'there'

    const text = [
      `Hi ${name},`,
      '',
      'Here is your week on Propeida.',
      '',
      `You completed ${row.sessions} session${row.sessions === 1 ? '' : 's'} and secured ${row.secured} topic${row.secured === 1 ? '' : 's'}.`,
      `Your cohort completed ${cohortSessions.toLocaleString()} sessions and secured ${cohortSecured.toLocaleString()} topics this week.`,
      '',
      'Keep the loop going: one review today is worth more than a long session tomorrow.',
      '',
      'Open Propeida: https://propeida.online/home',
      '',
      'Want fewer emails? Turn cohort updates off in Settings: https://propeida.online/account/settings',
    ].join('\n')

    const html = `
      <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#101c33">
        <p style="margin:0 0 16px 0;font-size:16px">Hi <strong>${escapeHtml(name)}</strong>,</p>
        <p style="margin:0 0 16px 0;font-size:16px">Here is your week on Propeida.</p>
        <div style="background:#f0f6ff;border:1px solid #d6e6ff;border-radius:16px;padding:16px;margin:0 0 16px 0">
          <p style="margin:0 0 8px 0;font-size:15px"><strong>You</strong></p>
          <p style="margin:0;font-size:15px">${row.sessions} session${row.sessions === 1 ? '' : 's'} completed · ${row.secured} topic${row.secured === 1 ? '' : 's'} secured</p>
        </div>
        <div style="background:#f7f7f8;border:1px solid #e7e7ea;border-radius:16px;padding:16px;margin:0 0 16px 0">
          <p style="margin:0 0 8px 0;font-size:15px"><strong>Your cohort</strong></p>
          <p style="margin:0;font-size:15px">${cohortSessions.toLocaleString()} sessions completed · ${cohortSecured.toLocaleString()} topics secured</p>
        </div>
        <p style="margin:0 0 16px 0;font-size:15px">Keep the loop going: one review today is worth more than a long session tomorrow.</p>
        <p style="margin:0 0 24px 0">
          <a href="https://propeida.online/home" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:14px">Open Propeida</a>
        </p>
        <p style="margin:0;font-size:12px;color:#667085">
          Want fewer emails? Turn cohort updates off in
          <a href="https://propeida.online/account/settings" style="color:#2563eb">Settings</a>.
        </p>
      </div>
    `

    const result = await sendEmail({
      to: email,
      subject: 'Your week on Propeida',
      text,
      html,
    })
    if (result.ok) sent += 1
    else failed += 1
  }

  return NextResponse.json({ ok: true, sent, failed, eligible: profiles.length })
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
