// End-to-end verification of the 24-hour campaign entitlement.
// Creates throwaway users + one throwaway pro user, runs real campaigns
// against the LIVE database (one at a time, like production), and asserts:
//   1. existing users get full access (has_campaign_access / RLS question reads)
//   2. new users do NOT get access (unless include_new_users)
//   3. access expires exactly 24h after grant (expires_at - granted_at == 24h);
//      end_campaign revokes immediately; time-based expiry works for both the
//      campaign window AND the per-user grant row
//   4. Pro subscribers are untouched (entitlements row unchanged)
// Run: node --env-file=.env scripts/verify-campaign.mjs

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !ANON || !SERVICE) {
  console.error('Missing env vars')
  process.exit(1)
}

const UNILORIN_EXAM = 'aeec6f04-f785-4156-931e-1de03b0b5793'

let failed = false
function check(label, cond, extra = '') {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}${extra ? `  (${extra})` : ''}`)
  if (!cond) failed = true
}

const svcHeaders = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, 'Content-Type': 'application/json' }
const anonHeaders = { apikey: ANON, Authorization: `Bearer ${ANON}`, 'Content-Type': 'application/json' }

async function api(path, { method = 'GET', headers = {}, body, prefer } = {}) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers: { ...svcHeaders, ...(prefer ? { Prefer: prefer } : {}), ...headers },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: res.status, data: await res.json().catch(() => null) }
}

async function rpcAs(token, fn, params = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: ANON, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  return { status: res.status, data: await res.json().catch(() => null) }
}

const password = 'CampVerify_2026!'
async function createUser(email) {
  const { data } = await api('/auth/v1/admin/users', {
    method: 'POST',
    body: { email, password, email_confirm: true },
  })
  if (!data?.id) throw new Error(`Failed to create ${email}`)
  const login = await api('/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { Authorization: `Bearer ${ANON}` },
    body: { email, password },
  })
  return { id: data.id, jwt: login.data?.access_token }
}

async function startCampaign(slug, name, { includeNew = false, hours = 24 } = {}) {
  const { data } = await api('/rest/v1/rpc/start_campaign', {
    method: 'POST',
    body: { p_slug: slug, p_name: name, p_hours: hours, p_include_new_users: includeNew },
  })
  return data
}

async function endCampaign(slug) {
  await api('/rest/v1/rpc/end_campaign', { method: 'POST', body: { p_slug: slug } }).catch(() => {})
}

async function countQuestions(token) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?select=id&exam_id=eq.${UNILORIN_EXAM}&limit=5`, {
    headers: { apikey: ANON, Authorization: `Bearer ${token}` },
  })
  return (await res.json()).length
}

const base = Date.now() % 1000000
const SLUG1 = `verify-campaign-${base}`
const SLUG2 = `verify-campaign-${base}-incl`
const SLUG3 = `verify-campaign-${base}-t`
const createdUsers = []
const campaignIds = []
let campaignId3 = null
let entitlementId = null

try {
  console.log('=== 0. setup ===')
  const existing = await createUser(`camp-exist-${base}@propeida.test`)
  createdUsers.push(existing)
  console.log(`existing user: ${existing.id}`)

  console.log('\n=== 1. start campaign (24h, include_new_users = false) ===')
  campaignIds.push(await startCampaign(SLUG1, 'Verify 24h Unlock'))
  check('start_campaign returns a campaign id', typeof campaignIds[0] === 'string' && campaignIds[0].length > 0, campaignIds[0])

  const grant = await api(`/rest/v1/campaign_access?select=user_id,granted_at,expires_at&campaign_id=eq.${campaignIds[0]}&user_id=eq.${existing.id}&limit=1`)
  check('existing user received a grant row', (grant.data ?? []).length === 1)
  const grantRow = grant.data?.[0]
  if (grantRow) {
    const deltaH = (new Date(grantRow.expires_at) - new Date(grantRow.granted_at)) / 3600000
    check('grant expires exactly 24h after granted_at', Math.abs(deltaH - 24) < 0.001, `${deltaH.toFixed(4)}h`)
  }

  console.log('\n=== 2. existing user has access ===')
  const hasExisting = await rpcAs(existing.jwt, 'has_campaign_access')
  check('has_campaign_access() → true for existing user', hasExisting.data === true)

  const statusRes = await rpcAs(existing.jwt, 'get_campaign_status')
  const status = statusRes.data?.[0]
  check('get_campaign_status() exposes access + expiry', status?.has_access === true && !!status?.expires_at && !!status?.campaign_slug, JSON.stringify(status))

  console.log('\n=== 3. full question-bank RLS on an exam the user NEVER joined ===')
  const qExisting = await countQuestions(existing.jwt)
  check('existing user reads UNILORIN questions (no user_exam_access)', qExisting > 0, `rows=${qExisting}`)

  console.log('\n=== 4. new user (created AFTER start) has NO access ===')
  const newUser = await createUser(`camp-new-${base}@propeida.test`)
  createdUsers.push(newUser)
  const nothingForNew = await api(`/rest/v1/campaign_access?select=id&campaign_id=eq.${campaignIds[0]}&user_id=eq.${newUser.id}&limit=1`)
  check('new user has no grant row', (nothingForNew.data ?? []).length === 0)

  const hasNew = await rpcAs(newUser.jwt, 'has_campaign_access')
  check('has_campaign_access() → false for new user', hasNew.data === false)

  const qNew = await countQuestions(newUser.jwt)
  check('new user reads ZERO UNILORIN questions', qNew === 0, `rows=${qNew}`)

  console.log('\n=== 5. end_campaign revokes access immediately ===')
  const ended = await api('/rest/v1/rpc/end_campaign', { method: 'POST', body: { p_slug: SLUG1 } })
  check('end_campaign returns a timestamp', typeof ended.data === 'string')

  const afterEnd = await rpcAs(existing.jwt, 'has_campaign_access')
  check('has_campaign_access() → false right after end_campaign', afterEnd.data === false)

  const statusAfter = await rpcAs(existing.jwt, 'get_campaign_status')
  const sAfter = statusAfter.data?.[0]
  check('get_campaign_status() reports recently_expired after end', sAfter?.recently_expired === true, JSON.stringify(sAfter))

  const qAfterEnd = await countQuestions(existing.jwt)
  check('RLS question reads revoke too (0 rows)', qAfterEnd === 0, `rows=${qAfterEnd}`)

  console.log('\n=== 6. include_new_users grants users created during the window ===')
  campaignIds.push(await startCampaign(SLUG2, 'Verify Include', { includeNew: true }))
  check('include campaign started', typeof campaignIds[1] === 'string')

  const userDuring = await createUser(`camp-during-${base}@propeida.test`)
  createdUsers.push(userDuring)
  const hasDuring = await rpcAs(userDuring.jwt, 'has_campaign_access')
  check('user created DURING include-window campaign has access', hasDuring.data === true)

  const hasNewStill = await rpcAs(newUser.jwt, 'has_campaign_access')
  check('snapshot semantics: user existing when campaign 2 started gains access', hasNewStill.data === true)
  await endCampaign(SLUG2)
  const afterInclEnd = await rpcAs(userDuring.jwt, 'has_campaign_access')
  check('include-window user loses access when that campaign ends', afterInclEnd.data === false)

  console.log('\n=== 7. Pro subscriber: access granted AND untouched by campaign lifecycle ===')
  const pro = await createUser(`camp-pro-${base}@propeida.test`)
  createdUsers.push(pro)
  const insEnt = await api('/rest/v1/entitlements', {
    method: 'POST',
    prefer: 'return=representation',
    body: { user_id: pro.id, product: 'putme_pro', status: 'active', source: 'payment', expires_at: null },
  })
  entitlementId = insEnt.data?.[0]?.id ?? null
  check('pro entitlement inserted', !!entitlementId)

  campaignId3 = await startCampaign(SLUG3, 'Verify Time', { includeNew: false })
  const entBefore = await api(`/rest/v1/entitlements?select=product,status,expires_at,source&id=eq.${entitlementId}&limit=1`)

  const proHas = await rpcAs(pro.jwt, 'has_campaign_access')
  check('pro user gets temporary campaign access (orthogonal)', proHas.data === true)

  const proQ = await countQuestions(pro.jwt)
  check('pro user reads UNILORIN questions while campaign active', proQ > 0, `rows=${proQ}`)

  console.log('\n=== 8. automatic time-based expiry (no end_campaign) ===')
  const setEnds = await api(`/rest/v1/campaigns?slug=eq.${SLUG3}`, {
    method: 'PATCH',
    body: { ends_at: new Date(Date.now() - 3600000).toISOString() },
  })
  check('simulated window closure (ends_at in the past)', setEnds.status === 204)

  const proAfterWindow = await rpcAs(pro.jwt, 'has_campaign_access')
  check('has_campaign_access() → false once campaign window closes', proAfterWindow.data === false)

  await api(`/rest/v1/campaigns?slug=eq.${SLUG3}`, { method: 'PATCH', body: { ends_at: new Date(Date.now() + 3600000).toISOString() } })
  const proWindowReopened = await rpcAs(pro.jwt, 'has_campaign_access')
  check('reopened window restores access', proWindowReopened.data === true)

  await api(`/rest/v1/campaign_access?campaign_id=eq.${campaignId3}&user_id=eq.${pro.id}`, {
    method: 'PATCH',
    body: { expires_at: new Date(Date.now() - 3600000).toISOString() },
  })
  const proAfterGrantExpiry = await rpcAs(pro.jwt, 'has_campaign_access')
  check('grant-row expiry alone revokes access (even with open window)', proAfterGrantExpiry.data === false)

  const entAfter = await api(`/rest/v1/entitlements?select=product,status,expires_at,source&id=eq.${entitlementId}&limit=1`)
  check(
    'entitlements row unchanged by campaign lifecycle',
    JSON.stringify(entBefore.data) === JSON.stringify(entAfter.data),
    JSON.stringify(entAfter.data),
  )
} catch (err) {
  console.error('ERROR:', err.message)
  failed = true
} finally {
  console.log('\n=== cleanup ===')
  for (const slug of [SLUG1, SLUG2, SLUG3]) {
    await endCampaign(slug)
  }
  for (const id of [...campaignIds, campaignId3].filter(Boolean)) {
    await api(`/rest/v1/campaigns?id=eq.${id}`, { method: 'DELETE' }).catch(() => {})
  }
  if (entitlementId) {
    await api(`/rest/v1/entitlements?id=eq.${entitlementId}`, { method: 'DELETE' }).catch(() => {})
  }
  for (const u of createdUsers) {
    await api(`/auth/v1/admin/users/${u.id}`, { method: 'DELETE' }).catch(() => {})
  }
  console.log('cleaned up')
}

process.exit(failed ? 1 : 0)