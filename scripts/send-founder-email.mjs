#!/usr/bin/env node
/**
 * Founder update email send utility — manual trigger only.
 *
 * NEVER auto-sends. By default it lists the verified recipients and previews
 * the message. Delivery requires the `--send` flag.
 *
 * Usage (from repo root):
 *   node --env-file=.env scripts/send-founder-email.mjs                      # dry run: list + preview
 *   node --env-file=.env scripts/send-founder-email.mjs --send           # deliver to all verified users
 *   node --env-file=.env scripts/send-founder-email.mjs --to user@mail.com    # preview/send one address
 *   node --env-file=.env scripts/send-founder-email.mjs --send --limit 5    # send to the first 5 recipients
 *
 * Delivery providers:
 *   1. SMTP — used when SMTP_HOST is set. Most Supabase projects can reuse
 *      their Auth SMTP settings. Expected env vars:
 *        SMTP_HOST, SMTP_PORT (default 465), SMTP_USER, SMTP_PASS, MAIL_FROM
 *   2. GoTrue admin raw-email — used when SMTP_HOST is unset. Posts to
 *      /auth/v1/admin/emails/send_raw_email (only available where the project
 *      enables it). If both are unavailable the script explains what to do.
 */

import { createTransport } from 'nodemailer'
import { getFounderUpdateEmail } from '../lib/emails/founder-update.ts'

const email = getFounderUpdateEmail()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const argv = process.argv.slice(2)
const SEND = argv.includes('--send')
const DRY = !SEND
const INCLUDE_TEST = argv.includes('--include-test')
const TO = valueOf('--to')
const LIMIT = parseInt(valueOf('--limit') ?? '0', 10) || 0
const PAGE_SIZE = parseInt(valueOf('--page-size') ?? '500', 10) || 500
const DELAY_MS = 250

const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = parseInt(process.env.SMTP_PORT ?? '465', 10)
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const MAIL_FROM = process.env.MAIL_FROM ?? `Propeida <${SMTP_USER ?? 'propeida.help@gmail.com'}>`

function valueOf(name) {
  const i = argv.indexOf(name)
  return i > -1 ? argv[i + 1] ?? null : null
}

const authHeaders = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
}

async function listConfirmedUsers() {
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

async function sendViaGoTrue(to) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/emails/send_raw_email`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ email: to, options: { subject: email.subject, message: email.html } }),
  })
  return { status: res.status, body: await res.text() }
}

function sendViaSmtp(to) {
  const transporter = createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  })
  return transporter
    .sendMail({
      from: MAIL_FROM,
      to,
      subject: email.subject,
      text: email.text,
      html: email.html,
    })
    .then(() => ({ status: 250, body: 'sent' }))
    .catch((err) => ({ status: 900, body: err.message }))
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY in the environment.')
  }

  console.log('Preparing founder update email:')
  console.log(`  Subject: ${email.subject}\n`)
  console.log('----- PLAIN TEXT PREVIEW -----\n')
  console.log(email.text)
  console.log('\n----- END PREVIEW -----\n')

  const provider = SMTP_HOST ? `SMTP (${SMTP_HOST}:${SMTP_PORT})` : 'GoTrue admin raw email'

  let recipients = await listConfirmedUsers()
  if (TO) {
    recipients = recipients.filter((u) => u.email === TO)
    if (!recipients.length) {
      console.log(`No confirmed user with email "${TO}" found.`)
      return
    }
  } else if (!INCLUDE_TEST) {
    recipients = recipients.filter((u) => !(u.email ?? '').toLowerCase().endsWith('.test'))
  }
  if (LIMIT > 0) recipients = recipients.slice(0, LIMIT)

  console.log(`Verified recipients (${recipients.length}):`)
  for (const u of recipients) {
    console.log(`  • ${u.email}${u.user_metadata?.username ? ` (${u.user_metadata.username})` : ''}`)
  }
  if (!recipients.length) {
    console.log('\nNo recipients matched. Nothing was sent.')
    return
  }

  if (DRY) {
    console.log('\nDRY RUN — nothing was sent.')
    console.log(`Provider configured: ${provider}. To deliver:`)
    console.log('  node --env-file=.env scripts/send-founder-email.mjs --to <one email> --send')
    console.log('  node --env-file=.env scripts/send-founder-email.mjs --send')
    return
  }

  console.log(`\nSending to ${recipients.length} recipient(s) via ${provider}…`)
  let sent = 0
  let failed = 0
  for (const u of recipients) {
    const result = SMTP_HOST ? await sendViaSmtp(u.email) : await sendViaGoTrue(u.email)
    if (result.status >= 200 && result.status < 300) {
      sent += 1
      console.log(`  ✓ ${u.email}`)
    } else {
      failed += 1
      console.log(`  ✗ ${u.email}  (${result.status}): ${result.body.slice(0, 200)}`)
      if (!SMTP_HOST && result.status === 404) {
        console.error(
          '\nThe GoTrue admin-email endpoint (send_raw_email) is not available on this project.',
          'Configure SMTP for this script by setting SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS',
          '(and optionally MAIL_FROM), then re-run with --send. Most Supabase projects can reuse',
          'the SMTP credentials under Project Settings → Auth → SMTP.',
        )
        process.exitCode = 1
        break
      }
    }
    await new Promise((resolve) => setTimeout(resolve, DELAY_MS))
  }
  console.log(`\nDone: ${sent} sent, ${failed} failed.`)
  if (failed) process.exitCode = 1
}

main().catch((e) => {
  console.error(`ERROR: ${e.message}`)
  process.exit(1)
})