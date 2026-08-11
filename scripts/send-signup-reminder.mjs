#!/usr/bin/env node
/**
 * Recovery outreach for incomplete signups (see scripts/audit-signup-abandonment.mjs
 * and scripts/signup-abandonment-queries.sql). Manual trigger only — never
 * auto-sends. By default it previews the copy and lists recipients with their
 * stage; delivery requires `--send`.
 *
 * User types (one email each, deduped by metadata markers):
 *   confirm — email never confirmed: re-sends the official Supabase/GoTrue
 *             verification email (POST /auth/v1/admin/resend) AND sends the
 *             "finish creating your account" reminder.
 *   finish  — email confirmed but never completed onboarding (incl. the
 *             placeholder user_* usernames that never picked a username).
 *   nudge   — onboarded but no session yet, or sessions but no completed mock.
 *
 * Usage (from repo root):
 *   node --env-file=.env scripts/send-signup-reminder.mjs                 (dry run, all)
 *   node --env-file=.env scripts/send-signup-reminder.mjs --type confirm  (dry run, one type)
 *   node --env-file=.env scripts/send-signup-reminder.mjs --to a@b.com --send
 *   node --env-file=.env scripts/send-signup-reminder.mjs --send
 *
 * Dedupe markers in auth.users.user_metadata:
 *   signup_confirm_email_sent_at / signup_reminder_email_sent_at.
 * Deliveries and resends are logged to logs/.
 */

import { Resend } from 'resend'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getSignupReminderEmail } from '../lib/emails/signup-reminder.ts'

const LOG_DIR = fileURLToPath(new URL('../logs/', import.meta.url))

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const RESEND_API_KEY = process.env.RESEND_API_KEY
const EMAIL_FROM = process.env.EMAIL_FROM ?? 'The Propeida Team <onboarding@resend.dev>'

const argv = process.argv.slice(2)
const SEND = argv.includes('--send')
const DRY = !SEND
const INCLUDE_TEST = argv.includes('--include-test')
const TYPE = valueOf('--type') ?? 'all'
const TO = valueOf('--to')
const LIMIT = parseInt(valueOf('--limit') ?? '0', 10) || 0
const PAGE_SIZE = parseInt(valueOf('--page-size') ?? '500', 10) || 500
const DELAY_MS = 5000

if (!['all', 'confirm', 'finish', 'nudge'].includes(TYPE)) {
  console.error('Missing or invalid --type (expected all|confirm|finish|nudge)')
  process.exit(1)
}

function valueOf(name) {
  const i = argv.indexOf(name)
  return i > -1 ? argv[i + 1] ?? null : null
}

const CONFIRM_MARKER = 'signup_confirm_email_sent_at'
const REMINDER_MARKER = 'signup_reminder_email_sent_at'
const LOG_PREFIX = 'send-signup-reminder'

const authHeaders = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
}
const restHeaders = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  Accept: 'application/json',
}

async function listAllUsers() {
  let page = 1
  let users = []
  for (;;) {
    const url = `${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=${PAGE_SIZE}`
    const res = await fetch(url, { headers: authHeaders })
    if (res.status === 401 || res.status === 403) {
      throw new Error(`Auth admin API rejected the key (HTTP ${res.status}). Check SUPABASE_SERVICE_ROLE_KEY.`)
    }
    if (!res.ok) throw new Error(`Failed to list users (HTTP ${res.status}): ${await res.text()}`)
    const data = await res.json()
    const batch = data.users ?? []
    users = users.concat(batch)
    if (!batch.length || page >= (data.last_page ?? page)) break
    page += 1
  }
  return users.filter((u) => u.role !== 'service_role')
}

async function getTable(path, select) {
  const out = []
  for (let off = 0; ; off += 1000) {
    const url = `${SUPABASE_URL}/rest/v1/${path}?select=${encodeURIComponent(select)}&limit=1000&offset=${off}`
    const res = await fetch(url, { headers: restHeaders })
    if (!res.ok) throw new Error(`Failed to read ${path} (HTTP ${res.status}): ${await res.text()}`)
    const rows = await res.json()
    out.push(...rows)
    if (rows.length < 1000) break
  }
  return out
}

async function resendVerification(userId) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/resend`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ type: 'signup', user_id: userId }),
  })
  return res.ok ? null : `resend failed: HTTP ${res.status} ${await res.text()}`
}

async function stampMarker(userId, marker) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ user_metadata: { [marker]: new Date().toISOString() } }),
  })
  return res.ok ? null : `(marker write failed: HTTP ${res.status})`
}

function logLine(entry) {
  const line = entry.map((part) => String(part ?? '')).join(' | ')
  console.log(line)
  logEntries.push(line)
}

const logEntries = []

async function writeLogFile() {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  await mkdir(LOG_DIR, { recursive: true })
  const filePath = join(LOG_DIR, `${LOG_PREFIX}-${stamp}.log`)
  return writeFile(filePath, `${logEntries.join('\n')}\n`).then(
    () => filePath,
    (err) => `(log file write failed: ${err.message})`,
  )
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY in the environment.')
  }
  if (SEND && !RESEND_API_KEY) {
    throw new Error('Missing RESEND_API_KEY in the environment (required for --send).')
  }

  for (const t of ['confirm', 'finish', 'nudge']) {
    if (TYPE === 'all' || TYPE === t) {
      const e = getSignupReminderEmail(t)
      console.log(`----- ${t.toUpperCase()} — subject: ${e.subject} -----`)
      console.log(e.text)
      console.log('----- END PREVIEW -----\n')
    }
  }

  const [authUsers, profiles, sessions] = await Promise.all([
    listAllUsers(),
    getTable('profiles', 'id,username,onboarding_completed'),
    getTable('exam_sessions', 'user_id,mode,status'),
  ])
  const profileByUid = new Map(profiles.map((p) => [p.id, p]))
  const mockDone = new Set(sessions.filter((s) => s.mode === 'mock' && s.status === 'completed').map((s) => s.user_id))
  const hasSession = new Set(sessions.map((s) => s.user_id))

  const users = authUsers
    .filter((u) => u.email && (INCLUDE_TEST || !u.email.toLowerCase().endsWith('.test')) && u.role === 'authenticated')
    .map((u) => {
      const profile = profileByUid.get(u.id)
      const confirmed = !!u.email_confirmed_at || !!u.confirmed_at
      const onboarded = profile?.onboarding_completed === true
      let type
      if (!confirmed) type = 'confirm'
      else if (!onboarded) type = 'finish'
      else if (!hasSession.has(u.id)) type = 'nudge'
      else if (!mockDone.has(u.id)) type = 'nudge'
      else type = null
      return { ...u, _type: type, _username: profile?.username ?? null }
    })
    .filter((u) => u._type)

  let recipients = users
  if (TYPE !== 'all') recipients = recipients.filter((u) => u._type === TYPE)
  if (TO) {
    recipients = recipients.filter((u) => u.email === TO)
    if (!recipients.length) {
      console.log(`No incomplete-signup user with email "${TO}" found.`)
      return
    }
  }

  const totals = {}
  for (const u of recipients) totals[u._type] = (totals[u._type] ?? 0) + 1
  console.log(`Recipients by type: ${JSON.stringify(totals)} (total ${recipients.length})`)

  const sendable = []
  for (const u of recipients) {
    const reminderSent = u.user_metadata?.[REMINDER_MARKER]
    const markerOk = u._type === 'confirm' ? (u.user_metadata?.[CONFIRM_MARKER] ? false : true) : reminderSent ? false : true
    if (markerOk) sendable.push(u)
  }
  console.log(`Unsent (${sendable.length}, skipping ${recipients.length - sendable.length} already sent):`)
  for (const u of sendable) {
    console.log(`  • [${u._type}] ${u.email} (created ${(u.created_at ?? '').slice(0, 10)})${u._username ? ` — ${u._username}` : ''}`)
  }
  if (!sendable.length) {
    console.log('\nNothing unsent to deliver.')
    return
  }

  if (LIMIT > 0) sendable.length = Math.min(sendable.length, LIMIT)

  if (DRY) {
    console.log('\nDRY RUN — nothing was sent.')
    console.log(`Provider configured: Resend (from: ${EMAIL_FROM}). To deliver:`)
    console.log(`  node --env-file=.env scripts/send-signup-reminder.mjs --to <one email> --send`)
    console.log(`  node --env-file=.env scripts/send-signup-reminder.mjs --send`)
    return
  }

  const resend = new Resend(RESEND_API_KEY)
  console.log(`\nSending to ${sendable.length} recipient(s)…`)
  let sent = 0
  let failed = 0
  for (const u of sendable) {
    const stamp = new Date().toISOString()
    const email = getSignupReminderEmail(u._type)
    const result = await resend.emails
      .send({ from: EMAIL_FROM, to: u.email, subject: email.subject, text: email.text, html: email.html })
      .then((res) => (res.error ? { ok: false, message: res.error.message ?? 'Resend error' } : { ok: true, id: res.data?.id ?? null }))
      .catch((err) => ({ ok: false, message: err?.message ?? String(err) }))

    let resendNote = ''
    if (result.ok && u._type === 'confirm') {
      resendNote = await resendVerification(u.id)
      const markerError = await stampMarker(u.id, CONFIRM_MARKER)
      resendNote = [resendNote, markerError].filter(Boolean).join(' ')
    }
    if (result.ok) {
      sent += 1
      const markerError = await stampMarker(u.id, REMINDER_MARKER)
      logLine([stamp, 'SENT', u._type, u.email, result.id ?? '(no id)', resendNote, markerError])
    } else {
      failed += 1
      logLine([stamp, 'FAILED', u._type, u.email, `message: ${result.message}`])
    }
    await new Promise((resolve) => setTimeout(resolve, DELAY_MS))
  }

  const logPath = await writeLogFile()
  console.log(`\nDone: ${sent} sent, ${failed} failed.`)
  console.log(`Log: ${logPath}`)
  if (failed) process.exitCode = 1
}

main().catch((e) => {
  console.error(`ERROR: ${e.message}`)
  process.exit(1)
})