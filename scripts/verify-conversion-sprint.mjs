// Sprint verification: countdown math, parent-share message, email copy, and
// live renders of the upgrade page + practice page (countdown banner) as an
// admin user granted campaign access.
import { spawn } from 'node:child_process'
import { formatCountdown } from '../lib/campaign/countdown.ts'
import { buildParentShareLink, getCampaignParentPitch } from '../lib/campaign/messages.ts'
import { getCampaignReminderEmail } from '../lib/emails/campaign-reminder.ts'
import { getCampaignExpiredEmail } from '../lib/emails/campaign-expired.ts'

let failed = false
function check(label, cond, extra = '') {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}${extra ? `  (${extra})` : ''}`)
  if (!cond) failed = true
}

// --- units ---
check('countdown: 2h 3m 4s -> 02:03:04', formatCountdown(2 * 3600000 + 3 * 60000 + 4 * 1000) === '02:03:04', formatCountdown(2 * 3600000 + 3 * 60000 + 4 * 1000))
check('countdown: 24h -> 24:00:00', formatCountdown(24 * 3600000) === '24:00:00', formatCountdown(24 * 3600000))
check('countdown: negative clamps to 00:00:00', formatCountdown(-5000) === '00:00:00')

const pitch = getCampaignParentPitch()
check('parent pitch mentions UNILORIN Post-UTME', pitch.includes('UNILORIN Post-UTME'))
check('parent pitch links propeida.online', pitch.includes('https://propeida.online'))
const share = buildParentShareLink()
check('share link is wa.me with encoded pitch', share.startsWith('https://wa.me/?text=') && decodeURIComponent(share).includes('UNILORIN Post-UTME'))

const reminder = getCampaignReminderEmail()
const expired = getCampaignExpiredEmail()
check('reminder subject', reminder.subject === 'You still have time')
check('expiry subject', expired.subject === 'Your full access has ended')
check('reminder text links propeida.online', reminder.text.includes('https://propeida.online'))
check('expiry text links propeida.online', expired.text.includes('https://propeida.online'))
check('reminder body tone words', reminder.text.includes('ends soon') && reminder.text.includes('last hours'))
check('expiry body tone words', expired.text.includes('few days away') && expired.text.toLowerCase().includes('upgrade'))
check('no propeida.com anywhere in copy', !(pitch + reminder.text + expired.text).includes('propeida.com'))

// --- live render ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY
const PORT = 3315
const ORIGIN = `http://localhost:${PORT}`
const REF = new URL(SUPABASE_URL).hostname.split('.')[0]
const TOKEN_COOKIE = `sb-${REF}-auth-token`

const svcHeaders = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, 'Content-Type': 'application/json' }
const anonHeaders = { apikey: ANON, Authorization: `Bearer ${ANON}`, 'Content-Type': 'application/json' }
async function api(path, { method = 'GET', headers = {}, body, prefer } = {}) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers: { ...svcHeaders, ...(prefer ? { Prefer: prefer } : {}), ...headers },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  return { status: res.status, data }
}

const CAMPAIGN_ID = '5358de88-5f4f-4a72-8bd7-f748e968d7e4'
const stamp = Date.now()
const email = `sprint-${stamp}@propeida.test`
const password = 'SprintCheck_2026!'
let userId
let server

try {
  const created = await api('/auth/v1/admin/users', { method: 'POST', body: { email, password, email_confirm: true } })
  userId = created.data?.id
  check('temp user created', !!userId)
  await api(`/rest/v1/profiles?id=eq.${userId}`, { method: 'PATCH', body: { is_admin: true } })
  const grant = await api('/rest/v1/campaign_access', {
    method: 'POST',
    body: {
      campaign_id: CAMPAIGN_ID,
      user_id: userId,
      granted_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 5 * 3600000).toISOString(),
    },
  })
  check('campaign access granted (5h left)', grant.status === 201)

  const login = await api('/auth/v1/token?grant_type=password', { method: 'POST', headers: { Authorization: `Bearer ${ANON}` }, body: { email, password } })
  const session = login.data
  const tokenJson = JSON.stringify({
    access_token: session.access_token, refresh_token: session.refresh_token,
    token_type: session.token_type ?? 'bearer', expires_in: session.expires_in,
    expires_at: session.expires_at ?? Math.floor(Date.now() / 1000) + session.expires_in,
    user: session.user,
  })
  const cookie = `${TOKEN_COOKIE}=${encodeURIComponent(tokenJson)}; Path=/`

  server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(PORT)], { stdio: 'pipe' })
  let log = ''
  server.stdout.on('data', (d) => (log += d))
  server.stderr.on('data', (d) => (log += d))
  await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('server start timeout')), 60000)
    server.stdout.on('data', (d) => { if (String(d).includes('Ready')) { clearTimeout(t); resolve() } })
  })

const practiceRaw = (await (await fetch(`${ORIGIN}/practice?hub=universities`, { headers: { Cookie: cookie } })).text())
  const practice = practiceRaw.replaceAll('\\"', '"').replaceAll('\\\\', '\\')
  check('practice page wires CampaignPanel with active access', practice.includes('"hasAccess":true') && practice.includes('"expiresAt":"'))
  check('practice page server-renders exam list (unilorin-post-utme)', /unilorin-post-utme/.test(practice))

  const upgradeRaw = await (await fetch(`${ORIGIN}/account/upgrade`, { headers: { Cookie: cookie } })).text()
  const upgrade = upgradeRaw.replaceAll('\\"', '"').replaceAll('\\\\', '\\')
  check('upgrade page has parent-share button', upgrade.includes('Ask a parent or guardian on WhatsApp'))
  const waTexts = [...upgrade.matchAll(/https:\/\/wa\.me\/\?text=([^\s"']+)/g)].map((m) => decodeURIComponent(m[1]))
  check('upgrade page share link is wa.me', waTexts.length > 0)
  check('upgrade page share link links propeida.online', waTexts.some((t) => t.includes('propeida.online')))
} catch (err) {
  console.error('ERROR:', err.message)
  failed = true
} finally {
  if (server) server.kill()
  if (userId) {
    await api(`/rest/v1/campaign_access?campaign_id=eq.${CAMPAIGN_ID}&user_id=eq.${userId}`, { method: 'DELETE' }).catch(() => {})
    await api(`/auth/v1/admin/users/${userId}`, { method: 'DELETE' }).catch(() => {})
  }
  console.log('cleaned up (server + grant + temp user)')
}

process.exit(failed ? 1 : 0)
