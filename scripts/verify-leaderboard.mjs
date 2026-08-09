// Verification for the leaderboard read fix (migration 20260809000001_fix_leaderboard_rpc.sql).
//
// Prerequisites:
//   - Migration applied: create function public.get_leaderboard(...) + grant.
//   - Email/password auth enabled (the app's signup flow uses it).
//
// What it does:
//   1. Creates two throwaway test users via the Admin API.
//   2. Creates a completed mock session + result for each (the same rows that
//      complete_mock_session produces), firing trg_update_leaderboard.
//   3. Calls get_leaderboard with user A's real JWT (the exact path the app
//      uses) and asserts both users appear, ranked by score, with the correct
//      Bayesian score.
//   4. Demonstrates the pre-fix behavior by running the old PostgREST query
//      (profiles!inner join) as user A: only user A's own row should survive.
//   5. Deletes the test users (cascades remove sessions/results/entries).
//
// Usage:  node --env-file=.env scripts/verify-leaderboard.mjs

const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!BASE_URL || !ANON_KEY || !SERVICE_KEY) {
  console.error('Missing Supabase env vars')
  process.exit(1)
}

const suffix = Date.now().toString(36)
const users = [
  { email: `lb-verify-a-${suffix}@example.com`, password: 'LeaderboardTest123!', score: 70, total: 100 },
  { email: `lb-verify-b-${suffix}@example.com`, password: 'LeaderboardTest123!', score: 90, total: 100 },
]

async function api(path, { method = 'GET', body, key, headers = {} } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await res.text()
  let json = null
  try { json = text ? JSON.parse(text) : null } catch { /* non-JSON */ }
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${text}`)
  return json
}

async function createUser(email, password) {
  return api('/auth/v1/admin/users', {
    method: 'POST',
    key: SERVICE_KEY,
    body: { email, password, email_confirm: true },
  })
}

async function signIn(email, password) {
  const res = await fetch(`${BASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error(`sign-in failed for ${email}: ${res.status} ${await res.text()}`)
  return (await res.json()).access_token
}

async function deleteUser(userId) {
  await api(`/auth/v1/admin/users/${userId}`, { method: 'DELETE', key: SERVICE_KEY })
}

const created = []
try {
  // 1. Confirm the RPC exists (migration applied).
  await api('/rest/v1/rpc/get_leaderboard', {
    method: 'POST',
    key: ANON_KEY,
    body: { p_period: 'weekly', p_exam_id: '00000000-0000-0000-0000-000000000000' },
  })
    .then(() => { throw new Error('expected permission error for anon') })
    .catch((e) => {
      if (/permission/i.test(e.message)) return
      throw e
    })

  // 2. Find the UNILORIN exam id.
  const examRows = await api('/rest/v1/exams?slug=eq.unilorin-post-utme&select=id', { key: SERVICE_KEY })
  const examId = examRows?.[0]?.id
  if (!examId) throw new Error('unilorin-post-utme exam not found')

  // 3. Create users + sessions + results (firing the leaderboard trigger).
  for (const u of users) {
    const authUser = await createUser(u.email, u.password)
    created.push(authUser.id)

    const session = await api('/rest/v1/exam_sessions', {
      method: 'POST',
      key: SERVICE_KEY,
      body: {
        user_id: authUser.id,
        exam_id: examId,
        mode: 'mock',
        status: 'completed',
        started_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        completed_at: new Date().toISOString(),
        time_limit_seconds: 3600,
      },
      headers: { Prefer: 'return=representation' },
    })
    await api('/rest/v1/results', {
      method: 'POST',
      key: SERVICE_KEY,
      body: {
        session_id: session[0].id,
        score: u.score,
        accuracy: u.score / u.total,
        performance_by_subject: {},
      },
    })
    console.log(`  created ${u.email}: score ${u.score}/${u.total}`)
  }

  // 4. Read the leaderboard with user A's real JWT (the app's exact path).
  const tokenA = await signIn(users[0].email, users[0].password)
  const rows = await api(`/rest/v1/rpc/get_leaderboard?p_period=weekly&p_exam_id=${examId}`, {
    key: ANON_KEY,
    headers: { Authorization: `Bearer ${tokenA}` },
  })

  const usernames = new Map(
    rows.map((r) => [r.user_id, r.username]),
  )
  console.log('\nleaderboard via get_leaderboard (weekly):')
  for (const r of rows) console.log(`  #${rows.indexOf(r) + 1} ${r.username} score=${r.score}`)

  const a = created[0]
  const b = created[1]
  const expectedA = ((users[0].score + 5) / (users[0].total + 10) * 100).toFixed(2)
  const expectedB = ((users[1].score + 5) / (users[1].total + 10) * 100).toFixed(2)
  const rowA = rows.find((r) => r.user_id === a)
  const rowB = rows.find((r) => r.user_id === b)
  if (!rowA || !rowB) throw new Error('both test users must appear on the leaderboard')
  if (Number(rowB.score) < Number(rowA.score)) throw new Error('ranking wrong: 90/100 user should rank above 70/100 user')
  if (rowA.score.toFixed(2) !== expectedA || rowB.score.toFixed(2) !== expectedB) {
    throw new Error(`score mismatch: got ${rowA.score}/${rowB.score}, expected ${expectedA}/${expectedB}`)
  }
  console.log('\nPASS: both test users visible to user A with correct Bayesian scores and ranking')

  // 5. Demonstrate the pre-fix bug using the old PostgREST query (profiles!inner).
  const legacy = await api(`/rest/v1/leaderboard_entries?select=user_id,score,profiles!inner(username,avatar_index,schools!left(name,slug))&period=eq.weekly&exam_id=eq.${examId}&order=score.desc&limit=100`, {
    key: ANON_KEY,
    headers: { Authorization: `Bearer ${tokenA}` },
  })
  console.log(`\nlegacy query (profiles!inner) rows visible to user A: ${legacy.length} (pre-fix behavior: only own row)`)

  // 6. Rank integrity: both periods should be consistent.
  const allTime = await api(`/rest/v1/rpc/get_leaderboard?p_period=all_time&p_exam_id=${examId}`, {
    key: ANON_KEY,
    headers: { Authorization: `Bearer ${tokenA}` },
  })
  if (!allTime.find((r) => r.user_id === a) || !allTime.find((r) => r.user_id === b)) {
    throw new Error('all_time leaderboard missing test users')
  }
  console.log('PASS: all_time leaderboard also contains both users')
  console.log('\nVERIFICATION COMPLETE — all checks passed')
} finally {
  for (const id of created) {
    try { await deleteUser(id); console.log(`  cleaned up user ${id}`) } catch (e) { console.warn(`  cleanup failed for ${id}: ${e.message}`) }
  }
}
