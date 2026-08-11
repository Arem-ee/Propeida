import { createClient } from '@supabase/supabase-js'
import { writeFileSync, mkdirSync } from 'node:fs'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY

const admin = createClient(SUPABASE_URL, SERVICE, { auth: { persistSession: false } })
const B = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` }
const get = async (p, q) => { const qs = new URLSearchParams(q); const r = await fetch(`${SUPABASE_URL}/rest/v1/${p}?${qs}`, { headers: B }); if (!r.ok) throw Error(r.status + ' ' + await r.text()); return r.json() }
const paginate = async (p, select) => { const out = []; for (let off = 0; ; off += 1000) { const rows = await get(p, { select, limit: '1000', offset: String(off) }); out.push(...rows); if (rows.length < 1000) break } return out }

console.log('Fetching auth.users via admin API...')
const authUsers = []
for (let page = 1; ; page++) {
  const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 })
  if (error) throw Error(error.message)
  authUsers.push(...data.users)
  if (data.users.length < 1000) break
}
console.log(`auth.users: ${authUsers.length}`)

console.log('Fetching tables...')
const [profiles, sessions, examAccess, pools, campaigns, campaignAccess] = await Promise.all([
  paginate('profiles', 'id,username,school_id,referral_code,avatar_index,is_admin,onboarding_completed,created_at'),
  paginate('exam_sessions', 'id,user_id,exam_id,mode,status,started_at,completed_at'),
  paginate('user_exam_access', 'user_id,exam_id'),
  paginate('user_exam_free_pools', 'user_id'),
  paginate('campaigns', 'id,slug,name,starts_at,ends_at,include_new_users'),
  paginate('campaign_access', 'user_id,campaign_id'),
])

const profileByUid = new Map(profiles.map((p) => [p.id, p]))
const sessionsByUid = new Map()
for (const s of sessions) {
  if (!sessionsByUid.has(s.user_id)) sessionsByUid.set(s.user_id, [])
  sessionsByUid.get(s.user_id).push(s)
}
const accessByUid = new Map()
for (const a of examAccess) {
  if (!accessByUid.has(a.user_id)) accessByUid.set(a.user_id, [])
  accessByUid.get(a.user_id).push(a)
}
const poolByUid = new Set(pools.map((p) => p.user_id))
const campaignByUid = new Map()
for (const c of campaignAccess) {
  if (!campaignByUid.has(c.user_id)) campaignByUid.set(c.user_id, [])
  campaignByUid.get(c.user_id).push(c.campaign_id)
}
const campaignById = new Map(campaigns.map((c) => [c.id, c]))

const SEVEN_DAYS = 7 * 24 * 3600 * 1000
const now = Date.now()

const stageName = (s) => [
  'OK: fully active (mock completed)',
  'LATE: sessions but NO completed mock',
  'EARLY: onboarded but never started a session',
  'ONBOARDING: confirmed but onboarding_completed=false',
  'UNCONFIRMED: email not confirmed',
  'ORPHAN: auth user with no profiles row',
][s]

const users = authUsers
  .filter((u) => u.email && !u.email.toLowerCase().includes('@propeida.test') && u.role === 'authenticated')
  .map((u) => {
    const uid = u.id
    const profile = profileByUid.get(uid)
    const mySessions = sessionsByUid.get(uid) ?? []
    const sessionsWithStatus = mySessions
    const started = mySessions.length > 0
    const completedMock = mySessions.some((s) => s.mode === 'mock' && s.status === 'completed')
    const confirmed = !!u.email_confirmed_at || !!u.confirmed_at
    const onboarded = profile?.onboarding_completed === true
    let stage
    if (!profile) stage = 5
    else if (!confirmed) stage = 4
    else if (!onboarded) stage = 3
    else if (!started) stage = 2
    else if (!completedMock) stage = 1
    else stage = 0
    return {
      id: uid,
      email: u.email,
      created_at: u.created_at,
      confirmed: !!confirmed,
      confirmed_at: u.email_confirmed_at || u.confirmed_at || null,
      last_sign_in_at: u.last_sign_in_at || null,
      username: profile?.username ?? null,
      meta: u.user_metadata ?? {},
      app_meta: u.app_metadata ?? {},
      provider: (u.app_metadata?.provider ?? (u.identities?.[0]?.provider ?? 'email')),
      has_profile: !!profile,
      onboarding_completed: profile?.onboarding_completed ?? null,
      school_set: !!profile?.school_id,
      sessions: mySessions.length,
      mocks_started: mySessions.filter((s) => s.mode === 'mock').length,
      mocks_completed: mySessions.filter((s) => s.mode === 'mock' && s.status === 'completed').length,
      practice_sessions: mySessions.filter((s) => s.mode === 'practice').length,
      pool_created: poolByUid.has(uid),
      exam_access: accessByUid.get(uid)?.length ?? 0,
      campaign_ids: campaignByUid.get(uid) ?? [],
      stage,
      stage_name: stageName(stage),
      recent_7d: now - new Date(u.created_at).getTime() <= SEVEN_DAYS,
    }
  })

const incomplete = users.filter((u) => u.stage > 0)
const byStage = {}
for (const u of users) byStage[u.stage] = (byStage[u.stage] ?? 0) + 1
const byStage7 = {}
for (const u of users) if (u.recent_7d) byStage7[u.stage] = (byStage7[u.stage] ?? 0) + 1

const fmt = (d) => new Date(d).toISOString().replace('T', ' ').slice(0, 19)
const lines = []
lines.push('# Signup abandonment audit — production')
lines.push('')
lines.push(`Generated: ${new Date().toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, 'Z')}`)
lines.push(`Total auth.users (authenticated, non-test): ${users.length}`)
lines.push(`Incomplete signups (stage > 0): ${incomplete.length} (${(incomplete.length / Math.max(1, users.length) * 100).toFixed(1)}%)`)
lines.push(`Fully active: ${users.length - incomplete.length}`)
lines.push(`Last-7d cohort: ${users.filter((u) => u.recent_7d).length} signups, ${users.filter((u) => u.recent_7d && u.stage > 0).length} incomplete`)
lines.push('')
lines.push('## Breakdown by stage')
lines.push('')
lines.push('| stage | count | last-7d | detail |')
lines.push('|---|---|---|---|')
const stageDetail = [
  'completed >=1 mock',
  'has sessions but no completed mock',
  'onboarded, never started a session',
  'confirmed email, onboarding_completed=false',
  'email never confirmed',
  'no profiles row (trigger failure)',
]
for (let s = 0; s <= 5; s++) {
  lines.push(`| ${s} | ${byStage[s] ?? 0} | ${byStage7[s] ?? 0} | ${stageDetail[s]} |`)
}
lines.push('')
lines.push('## Affected users')
lines.push('')
lines.push('| stage | email | created_at | confirmed | last_sign_in | username | onboarding | school | sessions | mocks done | pool | exam_access | campaign |')
lines.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|')
const sorted = [...incomplete].sort((a, b) => b.stage - a.stage || new Date(a.created_at) - new Date(b.created_at))
for (const u of sorted) {
  lines.push(`| ${u.stage} | ${u.email} | ${fmt(u.created_at)} | ${u.confirmed ? 'Y' : 'N'} | ${u.last_sign_in_at ? fmt(u.last_sign_in_at) : '—'} | ${u.username ?? '—'} | ${u.onboarding_completed ? 'Y' : u.onboarding_completed === false ? 'N' : '—'} | ${u.school_set ? 'Y' : 'N'} | ${u.sessions} | ${u.mocks_completed} | ${u.pool_created ? 'Y' : 'N'} | ${u.exam_access} | ${u.campaign_ids.length} |`)
}
lines.push('')
lines.push('## Last-7d cohort detail')
lines.push('')
lines.push('| email | stage | created_at | confirmed | onboarding | sessions | column_note |')
lines.push('|---|---|---|---|---|---|---|')
for (const u of users.filter((x) => x.recent_7d).sort((a, b) => new Date(a.created_at) - new Date(b.created_at))) {
  lines.push(`| ${u.email} | ${u.stage} | ${fmt(u.created_at)} | ${u.confirmed ? 'Y' : 'N'} | ${u.onboarding_completed ? 'Y' : 'N'} | ${u.sessions} | |`)
}
lines.push('')
lines.push('## Unconfirmed users by signup day (correlation with releases)')
lines.push('')
const dayCount = {}
for (const u of users.filter((x) => !x.confirmed)) {
  const day = fmt(u.created_at).slice(0, 10)
  dayCount[day] = (dayCount[day] ?? 0) + 1
}
for (const [day, n] of Object.entries(dayCount).sort()) lines.push(`| ${day} | ${n} |`)

const report = lines.join('\n')
mkdirSync('logs', { recursive: true })
const outFile = `logs/signup-abandonment-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.md`
writeFileSync(outFile, report, 'utf8')

console.log(report)
console.log(`\nReport written to ${outFile}`)

const recoverable = incomplete.filter((u) => u.stage >= 3 && u.stage <= 5)
const walk = (u) => !u.confirmed ? 'unconfirmed (resend verification + reminder)' : u.stage === 3 ? 'onboarding (reminder)' : 'orphan (needs investigation)'
console.log(`\nRECOVERABLE (${recoverable.length}): unconfirmed + not-onboarded + orphans`)
for (const u of recoverable) console.log(`  ${u.email}  |  created ${fmt(u.created_at)}  |  ${walk(u)}`)
writeFileSync('logs/signup-abandonment-recoverable.json', JSON.stringify(recoverable.map((u) => ({ email: u.email, id: u.id, stage: u.stage, created_at: u.created_at, username: u.username, provider: u.provider })), null, 2), 'utf8')