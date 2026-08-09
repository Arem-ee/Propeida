#!/usr/bin/env node
/**
 * Send the 24-hour campaign unlock email to eligible users — manual trigger
 * only. NEVER auto-sends. By default it previews the message and lists the
 * recipients; delivery requires the `--send` flag.
 *
 * Eligibility: users that received a campaign_access grant for the campaign
 * slug passed with `--slug` (i.e. everyone who existed when the campaign
 * started, unless include_new_users semantics apply).
 *
 * Usage (from repo root):
 *   node --env-file=.env scripts/send-campaign-unlock-email.mjs --slug 24h-unlock-aug-2026
 *   node --env-file=.env scripts/send-campaign-unlock-email.mjs --slug 24h-unlock-aug-2026 --to user@mail.com
 *   node --env-file=.env scripts/send-campaign-unlock-email.mjs --slug 24h-unlock-aug-2026 --send
 *   node --env-file=.env scripts/send-campaign-unlock-email.mjs --slug 24h-unlock-aug-2026 --send --limit 5
 *
 * Expected env vars:
 *   NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
 *   RESEND_API_KEY, EMAIL_FROM (only for --send)
 *
 * Sent users are marked in auth.users.user_metadata.campaign_24h_email_sent_at
 * so re-runs never double-send (same pattern as the welcome email).
 * Every delivery is logged to logs/send-campaign-unlock-email-<stamp>.log .
 */

import { Resend } from 'resend'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getCampaignUnlockEmail } from '../lib/emails/campaign-unlock.ts'

const email = getCampaignUnlockEmail()

const LOG_DIR = fileURLToPath(new URL('../logs/', import.meta.url))
const MARKER = 'campaign_24h_email_sent_at'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const argv = process.argv.slice(2)
const SEND = argv.includes('--send')
const DRY = !SEND
const INCLUDE_TEST = argv.includes('--include-test')
const SLUG = valueOf('--slug')
const TO = valueOf('--to')
const LIMIT = parseInt(valueOf('--limit') ?? '0', 10) || 0
const PAGE_SIZE = parseInt(valueOf('--page-size') ?? '500', 10) || 500
const DELAY_MS = 5000

const RESEND_API_KEY = process.env.RESEND_API_KEY
const EMAIL_FROM = process.env.EMAIL_FROM ?? 'The Propeida Team <onboarding@resend.dev>'

function valueOf(name) {
  const i = argv.indexOf(name)
  return i > -1 ? argv[i + 1] ?? null : null
}

const logEntries = []

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

async function listCampaignUsers() {
  if (!SLUG) return null
  const url = `${SUPABASE_URL}/rest/v1/campaigns?select=id&slug=eq.${encodeURIComponent(SLUG)}`
  const res = await fetch(url, { headers: restHeaders })
  if (!res.ok) throw new Error(`Failed to find campaign (HTTP ${res.status})`)
  const campaigns = await res.json()
  const campaign = campaigns?.[0]
  if (!campaign) return []
  const accessRes = await fetch(
    `${SUPABASE_URL}/rest/v1/campaign_access?select=user_id&campaign_id=eq.${campaign.id}&limit=1000`,
    { headers: restHeaders }
  )
  if (!accessRes.ok) throw new Error(`Failed to list campaign access (HTTP ${accessRes.status})`)
  return (await accessRes.json()).map((a) => a.user_id)
}

async function listUsers() {
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
  return users.filter((u) => u.role !== 'service_role' && !!u.email_confirmed_at && !u.banned_until)
}

function sendViaResend(resend, to) {
  return resend.emails
    .send({
      from: EMAIL_FROM,
      to,
      subject: email.subject,
      text: email.text,
      html: email.html,
    })
    .then((res) => {
      if (res.error) {
        return {
          ok: false,
          status: res.error.statusCode ?? null,
          code: res.error.name ?? 'unknown',
          message: res.error.message ?? 'Unknown Resend error',
        }
      }
      return { ok: true, id: res.data?.id ?? null }
    })
    .catch((err) => ({
      ok: false,
      status: err?.statusCode ?? err?.cause?.statusCode ?? err?.cause?.status ?? null,
      code: (err?.name && err.name !== 'Error' && err.name) || err?.cause?.name || 'exception',
      message: err?.message ?? String(err),
    }))
}

async function markSent(userId) {
  const body = { user_metadata: { [MARKER]: new Date().toISOString() } }
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    return `(marker write failed: HTTP ${res.status})`
  }
  return null
}

function logLine(entry) {
  const line = entry.map((part) => String(part ?? '')).join(' | ')
  console.log(line)
  logEntries.push(line)
}

async function writeLogFile() {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  await mkdir(LOG_DIR, { recursive: true })
  const filePath = join(LOG_DIR, `send-campaign-unlock-email-${stamp}.log`)
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

  console.log('Preparing 24-hour campaign unlock email:')
  console.log(`  Subject: ${email.subject}\n`)
  console.log('----- PLAIN TEXT PREVIEW -----\n')
  console.log(email.text)
  console.log('\n----- END PREVIEW -----\n')

  const campaignUserIds = await listCampaignUsers()
  if (!campaignUserIds) {
    console.log('NOTE: no --slug provided — falling back to all confirmed users.')
  }
  console.log(
    campaignUserIds
      ? `Campaign grants found: ${campaignUserIds.length}`
      : '(no campaign filter)',
  )

  let users = await listUsers()
  const userIdFilter = campaignUserIds ? new Set(campaignUserIds) : null
  users = users.filter((u) => !userIdFilter || userIdFilter.has(u.id))

  if (TO) {
    users = users.filter((u) => u.email === TO)
    if (!users.length) {
      console.log(`No confirmed user with email "${TO}" found.`)
      return
    }
  } else if (!INCLUDE_TEST) {
    users = users.filter((u) => !(u.email ?? '').toLowerCase().endsWith('.test'))
  }

  const notYetSent = users.filter((u) => !u.user_metadata?.[MARKER])
  console.log(`Recipients (${notYetSent.length} new, ${users.length - notYetSent.length} already sent):`)
  for (const u of notYetSent) {
    console.log(`  • ${u.email}${u.user_metadata?.username ? ` (${u.user_metadata.username})` : ''}`)
  }
  if (!notYetSent.length) {
    console.log('\nNo unsent recipients matched. Nothing to send.')
    return
  }

  let recipients = notYetSent
  if (LIMIT > 0) recipients = recipients.slice(0, LIMIT)

  if (DRY) {
    console.log('\nDRY RUN — nothing was sent.')
    console.log(`Provider configured: Resend (from: ${EMAIL_FROM}). To deliver:`)
    console.log('  node --env-file=.env scripts/send-campaign-unlock-email.mjs --slug <slug> --to <one email> --send')
    console.log('  node --env-file=.env scripts/send-campaign-unlock-email.mjs --slug <slug> --send')
    return
  }

  const resend = new Resend(RESEND_API_KEY)
  console.log(`\nSending to ${recipients.length} recipient(s)…`)
  let sent = 0
  let failed = 0
  for (const u of recipients) {
    const result = await sendViaResend(resend, u.email)
    const stamp = new Date().toISOString()
    if (result.ok) {
      sent += 1
      const markerError = await markSent(u.id)
      logLine([stamp, 'SENT', u.email, result.id ?? '(no id)', markerError ?? ''])
    } else {
      failed += 1
      const status = result.status ?? 'unknown'
      logLine([
        stamp,
        'FAILED',
        u.email,
        `HTTP ${status}`,
        `code: ${result.code}`,
        `message: ${result.message}`,
        `from: ${EMAIL_FROM}`,
      ])
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