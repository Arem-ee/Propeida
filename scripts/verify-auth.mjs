import { spawn } from 'node:child_process'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY
const PORT = 3310
const ORIGIN = `http://localhost:${PORT}`

if (!SUPABASE_URL || !ANON || !SERVICE) {
  console.error('Missing env vars (NEXT_PUBLIC_SUPABASE_URL, ANON, SERVICE_ROLE)')
  process.exit(1)
}

const REF = new URL(SUPABASE_URL).hostname.split('.')[0]
const TOKEN_COOKIE = `sb-${REF}-auth-token`

let failed = false
function check(label, cond, extra = '') {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}${extra ? `  (${extra})` : ''}`)
  if (!cond) failed = true
}

async function api(path, { method = 'GET', headers = {}, body } = {}) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers: { apikey: ANON, Authorization: `Bearer ${SERVICE}`, ...headers },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: res.status, data: await res.json().catch(() => null) }
}

async function request(path, cookie = undefined) {
  const res = await fetch(`${ORIGIN}${path}`, {
    headers: cookie ? { Cookie: cookie } : {},
    redirect: 'manual',
  })
  return { status: res.status, location: res.headers.get('location'), setCookie: res.headers.get('set-cookie') }
}

const email = `authverify-${Date.now()}@propeida.test`
const password = 'VerifyPass_2026!'

let userId
try {
  const { data: created } = await api('/auth/v1/admin/users', {
    method: 'POST',
    body: { email, password, email_confirm: true },
  })
  userId = created?.id
  check('test user created', !!userId)

  const login = await api('/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { Authorization: `Bearer ${ANON}`, 'Content-Type': 'application/json' },
    body: { email, password },
  })
  const session = login.data
  check('password sign-in returns session', !!session?.access_token && !!session?.refresh_token)

  const tokenJson = JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    token_type: session.token_type ?? 'bearer',
    expires_in: session.expires_in,
    expires_at: session.expires_at ?? Math.floor(Date.now() / 1000) + session.expires_in,
    user: session.user,
  })
  const cookie = `${TOKEN_COOKIE}=${encodeURIComponent(tokenJson)}; Path=/`

  const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(PORT)], { stdio: 'pipe' })
  let serverLog = ''
  server.stdout.on('data', (d) => (serverLog += d))
  server.stderr.on('data', (d) => (serverLog += d))

  await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('server start timeout')), 60000)
    server.stdout.on('data', (d) => {
      if (String(d).includes('Ready')) {
        clearTimeout(t)
        resolve()
      }
    })
  })

  try {
    const anonRoot = await request('/')
    check('anon / -> 200 landing', anonRoot.status === 200, `status=${anonRoot.status}`)

    const anonDash = await request('/dashboard')
    check('anon /dashboard -> 307 /login', anonDash.status === 307 && anonDash.location?.startsWith('/login'), `status=${anonDash.status} location=${anonDash.location}`)

    const anonOnboarding = await request('/onboarding')
    check('anon /onboarding -> 307 /login', anonOnboarding.status === 307, `status=${anonOnboarding.status}`)

    const authedRoot = await request('/', cookie)
    check('authed / -> 307 /dashboard', authedRoot.status === 307 && authedRoot.location === '/dashboard', `status=${authedRoot.status} location=${authedRoot.location}`)

    const authedLogin = await request('/login', cookie)
    check('authed /login -> 307 /dashboard', authedLogin.status === 307 && authedLogin.location === '/dashboard', `status=${authedLogin.status} location=${authedLogin.location}`)

    const authedSignup = await request('/signup', cookie)
    check('authed /signup -> 307 /dashboard', authedSignup.status === 307, `status=${authedSignup.status}`)

    const authedDash = await request('/settings', cookie)
    check('authed /settings -> 200', authedDash.status === 200, `status=${authedDash.status}`)

    const logoutRes = await fetch(`${ORIGIN}/api/auth/logout`, { method: 'POST', headers: { Cookie: cookie }, redirect: 'manual' })
    const cleared = logoutRes.headers.get('set-cookie') ?? ''
    const logoutLocation = logoutRes.headers.get('location') ?? ''
    check('logout -> 307 /', logoutRes.status === 307 && (logoutLocation === '/' || logoutLocation.endsWith('/')), `status=${logoutRes.status} location=${logoutLocation}`)
    check('logout clears session cookie', /sb-/.test(cleared) && /Max-Age=0/.test(cleared) || /expires=Thu, 01 Jan 1970/.test(cleared), `${cleared.slice(0, 120)}`)

    const afterLogout = await request('/')
    check('after logout / -> 200 landing', afterLogout.status === 200, `status=${afterLogout.status}`)

    server.kill()
  } finally {
    server.kill()
  }
} catch (err) {
  console.error('ERROR:', err.message)
  failed = true
} finally {
  if (userId) {
    await api(`/auth/v1/admin/users/${userId}`, { method: 'DELETE' }).catch(() => {})
    console.log('test user cleaned up')
  }
}

process.exit(failed ? 1 : 0)