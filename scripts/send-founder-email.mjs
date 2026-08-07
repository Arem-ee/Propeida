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
 * Delivery provider: Resend (https://resend.com). Expected env vars:
 *   RESEND_API_KEY  — API key from Resend dashboard
 *   EMAIL_FROM      — verified "From" address (e.g. "The Propeida Team <updates@propeida.online>")
 *
 * Each delivery attempt is paced 5 seconds apart, and every recipient is
 * logged with a per-address success/failure line. The log is written to
 *   logs/send-founder-email-YYYYMMDD-HHMMSS.log
 */

import { Resend } from 'resend'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getFounderUpdateEmail } from '../lib/emails/founder-update.ts'

const email = getFounderUpdateEmail()

const LOG_DIR = fileURLToPath(new URL('../logs/', import.meta.url))

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const argv = process.argv.slice(2)
const SEND = argv.includes('--send')
const DRY = !SEND
const INCLUDE_TEST = argv.includes('--include-test')
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

function testingDomainExplanation() {
  if (!EMAIL_FROM.toLowerCase().includes('@resend.dev')) return null
  return (
    'Resend is currently using the onboarding testing domain. ' +
    'Emails can only be sent to the account owner until propeida.online is verified. ' +
    'Verify the domain in Resend and change EMAIL_FROM to an address using propeida.online.'
  )
}

function logLine(entry) {
  const line = entry.map((part) => String(part ?? '')).join(' | ')
  console.log(line)
  logEntries.push(line)
}

async function writeLogFile() {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  await mkdir(LOG_DIR, { recursive: true })
  const filePath = join(LOG_DIR, `send-founder-email-${stamp}.log`)
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

  console.log('Preparing founder update email:')
  console.log(`  Subject: ${email.subject}\n`)
  console.log('----- PLAIN TEXT PREVIEW -----\n')
  console.log(email.text)
  console.log('\n----- END PREVIEW -----\n')

  const provider = `Resend (from: ${EMAIL_FROM})`

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

  const resend = new Resend(RESEND_API_KEY)
  console.log(`\nSending to ${recipients.length} recipient(s) via ${provider}…`)
  let sent = 0
  let failed = 0
  for (const u of recipients) {
    const result = await sendViaResend(resend, u.email)
    const stamp = new Date().toISOString()
    if (result.ok) {
      sent += 1
      logLine([stamp, 'SENT', u.email, result.id ?? '(no id)'])
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
        testingDomainExplanation() ?? 'no further explanation',
      ])
      console.log(
        `  Explanation: ${testingDomainExplanation() ?? 'Check the Resend dashboard (https://resend.com) for details.'}`,
      )
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
