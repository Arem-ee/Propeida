const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY

async function api(path, { method = 'GET', headers = {}, body } = {}) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers: { apikey: ANON, Authorization: `Bearer ${SERVICE}`, 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: res.status, data: await res.json().catch(() => null) }
}

const email = `lbfull-${Date.now()}@propeida.test`
const password = 'FullPass_2026!'
const UNILORIN_EXAM = 'aeec6f04-f785-4156-931e-1de03b0b5793'

let userId
try {
  const { data: created } = await api('/auth/v1/admin/users', { method: 'POST', body: { email, password, email_confirm: true } })
  userId = created?.id
  const login = await api('/auth/v1/token?grant_type=password', { method: 'POST', headers: { Authorization: `Bearer ${ANON}` }, body: { email, password } })
  const jwt = login.data?.access_token

  console.log('--- grant UNILORIN access (like Add institution / signup) ---')
  const ins = await fetch(`${SUPABASE_URL}/rest/v1/user_exam_access`, {
    method: 'POST',
    headers: { apikey: ANON, Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ user_id: userId, exam_id: UNILORIN_EXAM }),
  })
  console.log('insert status:', ins.status)

  console.log('\n--- getLeaderboardExams (server action logic, real user JWT) ---')
  const accessRes = await fetch(`${SUPABASE_URL}/rest/v1/user_exam_access?select=exam_id&user_id=eq.${userId}`, { headers: { apikey: ANON, Authorization: `Bearer ${jwt}` } })
  const accessIds = (await accessRes.json()).map((a) => a.exam_id)
  const examsRes = await fetch(`${SUPABASE_URL}/rest/v1/exams?select=id,name,slug,school_id&or=${encodeURIComponent('(slug.eq.jamb,school_id.not.is.null)')}&order=name`, { headers: { apikey: ANON, Authorization: `Bearer ${jwt}` } })
  const exams = await examsRes.json()
  const filtered = exams.filter((e) => e.slug === 'jamb' || accessIds.includes(e.id))
  console.log('exams shown to user:', JSON.stringify(filtered.map((e) => e.slug)))
  const firstSchool = filtered.find((e) => e.slug !== 'jamb')
  const examSlug = firstSchool?.slug ?? null
  console.log('page examSlug:', examSlug, '-> resolved exam_id:', firstSchool?.id)

  console.log('\n--- getLeaderboardData(' + "'all_time'" + ', examSlug) RPC as user ---')
  const rpc = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_leaderboard`, {
    method: 'POST',
    headers: { apikey: ANON, Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_period: 'all_time', p_exam_id: firstSchool.id }),
  })
  const rows = await rpc.json()
  console.log('status:', rpc.status, '| rows:', Array.isArray(rows) ? rows.length : JSON.stringify(rows))
  const users = Array.isArray(rows) ? [...new Set(rows.map((r) => r.username))] : []
  console.log('usernames on board (>=2 proves fix):', JSON.stringify(users.slice(0, 5)), '... total', users.length)

  console.log('\n--- weekly ---')
  const rpcW = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_leaderboard`, {
    method: 'POST',
    headers: { apikey: ANON, Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_period: 'weekly', p_exam_id: firstSchool.id }),
  })
  const rowsW = await rpcW.json()
  console.log('rows:', Array.isArray(rowsW) ? rowsW.length : JSON.stringify(rowsW))
} finally {
  if (userId) await api(`/auth/v1/admin/users/${userId}`, { method: 'DELETE' }).catch(() => {})
  console.log('cleaned up')
}