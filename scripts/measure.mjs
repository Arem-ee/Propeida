import { spawn, execSync } from 'node:child_process'
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PORT = 3111
const BASE_URL = process.env.MEASURE_BASE_URL ?? `http://localhost:${PORT}`
const SESSION_URL = process.env.MEASURE_SESSION_URL ?? null
const THROTTLE = process.env.MEASURE_THROTTLE ?? 'off'

loadEnvFile()

const EMAIL = process.env.MEASURE_EMAIL ?? null
const PASSWORD = process.env.MEASURE_PASSWORD ?? null
const CREATE_ACCOUNT = (process.env.MEASURE_CREATE_ACCOUNT ?? '1') === '1'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function loadEnvFile() {
  const envPath = resolve(ROOT, '.env')
  if (!existsSync(envPath)) return
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    if (!(key in process.env)) process.env[key] = value
  }
}

let createdUserId = null

async function sbFetch(path, options = {}) {
  const headers = {
    apikey: ANON_KEY,
    Authorization: `Bearer ${options.serviceRole ? SERVICE_KEY : ANON_KEY}`,
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  }
  const res = await fetch(`${SUPABASE_URL}${path}`, { ...options, headers, body: options.body ? JSON.stringify(options.body) : undefined })
  const text = await res.text()
  return { ok: res.ok, status: res.status, text }
}

async function bootstrapAccount() {
  if (SESSION_URL && !EMAIL) return null
  if (!CREATE_ACCOUNT || !SUPABASE_URL || !SERVICE_KEY || !ANON_KEY) return null
  const email = `perf.measure.${Date.now()}@propeida.test`
  const password = 'PerfMeasure!2026'
  const createRes = await sbFetch('/auth/v1/admin/users', {
    method: 'POST',
    serviceRole: true,
    body: {
      email,
      password,
      email_confirm: true,
      user_metadata: { username: `perf_m_${Date.now().toString(36)}` },
    },
  })
  if (!createRes.ok) {
    console.log(`   (account bootstrap failed: ${createRes.text})`)
    return null
  }
  const user = JSON.parse(createRes.text)
  const userId = user.id
  createdUserId = userId

  await sbFetch(`/rest/v1/profiles?id=eq.${userId}`, {
    method: 'PATCH',
    serviceRole: true,
    headers: { Prefer: 'return=minimal' },
    body: { onboarding_completed: true },
  })

  const examsRes = await sbFetch('/rest/v1/exams?school_id=not.is.null&select=id&limit=1', { serviceRole: true })
  if (examsRes.ok) {
    const rows = JSON.parse(examsRes.text)
    const examId = rows[0]?.id
    if (examId) {
      await sbFetch('/rest/v1/user_exam_access', {
        method: 'POST',
        serviceRole: true,
        headers: { Prefer: 'return=minimal' },
        body: { user_id: userId, exam_id: examId },
      })
    }
  }
  return { email, password }
}

async function cleanupAccount() {
  if (!createdUserId) return true
  try {
    const res = await sbFetch(`/auth/v1/admin/users/${createdUserId}`, { method: 'DELETE', serviceRole: true })
    if (res.ok) {
      console.log('   (measure account cleaned up)')
      return true
    }
    console.log(`   (measure account cleanup failed: ${res.text})`)
    return false
  } catch (err) {
    console.log(`   (measure account cleanup failed: ${err.message})`)
    return false
  }
}

const THROTTLE_PRESETS = {
  off: null,
  fast3g: { offline: false, latency: 562.5, downloadThroughput: (1.44 * 1e6) / 8, uploadThroughput: (0.75 * 1e6) / 8 },
  '3g': { offline: false, latency: 187.5, downloadThroughput: (1.6 * 1e6) / 8, uploadThroughput: (768 * 1e3) / 8 },
}

const EDGE_CANDIDATES = [
  process.env.MEASURE_EDGE_PATH,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  process.env.LOCALAPPDATA ? `${process.env.LOCALAPPDATA}\\Microsoft\\Edge\\Application\\msedge.exe` : undefined,
  '/usr/bin/microsoft-edge',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean)

const edgePath = EDGE_CANDIDATES.find((p) => existsSync(p))
if (!edgePath) {
  console.error('No Edge/Chrome found. Set MEASURE_EDGE_PATH to your browser executable.')
  process.exit(1)
}

let account = null
const results = []
const now = () => Date.now()
function step(name, data) {
  results.push({ name, ...data })
  console.log(
    `${name.padEnd(42)} ${data.ms !== undefined ? `${String(data.ms).padStart(8)} ms` : '      -    '}  reqs=${data.totalRequests ?? '-'} (post=${data.postRequests ?? '-'})${data.info ? `  ${data.info}` : ''}`
  )
}

async function waitForPaint(page) {
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
}

let serverProc = null
async function ensureServer() {
  if (process.env.MEASURE_BASE_URL) return
  if (!existsSync(resolve(ROOT, '.next', 'BUILD_ID'))) {
    console.error('.next build missing — run `npm run build` first (or set MEASURE_BASE_URL).')
    process.exit(1)
  }
  serverProc = spawn('npx.cmd', ['next', 'start', '-p', String(PORT)], {
    cwd: ROOT,
    stdio: 'ignore',
    shell: true,
    windowsHide: true,
  })
  for (let i = 0; i < 90; i++) {
    try {
      const res = await fetch(`${BASE_URL}/login`)
      if (res.ok) return
    } catch {}
    await new Promise((r) => setTimeout(r, 1000))
  }
  console.error('App server did not start in time.')
  process.exit(1)
}

async function stopServer() {
  if (!serverProc) return
  try {
    execSync(`taskkill /F /T /PID ${serverProc.pid}`, { stdio: 'ignore' })
  } catch {}
  serverProc = null
}

async function login(page) {
  if (!account) {
    step('login (credentials)', { ms: 0, totalRequests: 0, postRequests: 0, info: 'skipped — set MEASURE_EMAIL/MEASURE_PASSWORD or allow MEASURE_CREATE_ACCOUNT=1' })
    return false
  }
  const t0 = now()
  const before = page._reqCount
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('input[type=email]', { timeout: 15000 })
  await page.type('input[type=email]', account.email)
  await page.type('input[type=password]', account.password)
  await page.click('button[type=submit]')
  await page.waitForFunction(() => window.location.pathname.startsWith('/dashboard'), { timeout: 25000 })
  await page.waitForSelector('h1', { timeout: 15000 })
  step('login → dashboard', { ms: now() - t0, totalRequests: page._reqCount - before, postRequests: page._postCount - before })
  return true
}

async function measureHardNav(page, title, path, selector) {
  const t0 = now()
  const beforeReq = page._reqCount
  const beforePost = page._postCount
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction((s) => document.querySelector(s), { timeout: 20000 }, selector)
  const timings = await page.evaluate(() => {
    const n = performance.getEntriesByType('navigation')[0]
    return {
      load: n ? Math.round(n.loadEventEnd) : null,
      dcl: n ? Math.round(n.domContentLoadedEventEnd) : null,
      lcp: window.__lcp || null,
    }
  })
  const ms = now() - t0
  step(`${title} (hard load)`, { ms, load: timings.load, dcl: timings.dcl, lcp: timings.lcp, totalRequests: page._reqCount - beforeReq, postRequests: page._postCount - beforePost })
}

async function measureSoftNav(page, title, label, fallbackPath, contentText) {
  const href = await page.evaluate((lbl) => {
    const a = [...document.querySelectorAll('a')].find((x) => x.innerText.trim() === lbl)
    return a ? a.getAttribute('href') : null
  }, label)
  const t0 = now()
  const beforeReq = page._reqCount
  const beforePost = page._postCount
  let usedFallback = false
  if (href) {
    await page.evaluate((h) => { document.querySelector(`a[href="${h}"]`)?.click() }, href)
    const matched = await page.waitForFunction((t) => document.body.innerText.includes(t), { timeout: 8000 }, contentText).then(() => true).catch(() => false)
    if (!matched) {
      await page.goto(`${BASE_URL}${fallbackPath}`, { waitUntil: 'domcontentloaded' })
      usedFallback = true
    }
  } else {
    await page.goto(`${BASE_URL}${fallbackPath}`, { waitUntil: 'domcontentloaded' })
    usedFallback = true
  }
  await page.waitForFunction((t) => document.body.innerText.includes(t), { timeout: 20000 }, contentText)
  await waitForPaint(page)
  step(`${title} (soft nav)`, { ms: now() - t0, totalRequests: page._reqCount - beforeReq, postRequests: page._postCount - beforePost, ...(usedFallback ? { info: 'fallback to direct nav' } : {}) })
}

async function measureLeaderboard(page) {
  await page.goto(`${BASE_URL}/leaderboard?hub=universities`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.body.innerText.includes('University Leaderboard'), { timeout: 20000 })
  await page.waitForFunction(() => document.querySelectorAll('select').length > 0, { timeout: 15000 })
  await page.waitForFunction(() => document.body.innerText.includes('score'), { timeout: 20000 }).catch(() => {})

  const t0 = now()
  const beforeReq = page._reqCount
  const beforePost = page._postCount
  await page.evaluate(() => { [...document.querySelectorAll('button')].find((b) => b.innerText.includes('Weekly'))?.click() })
  await waitForPaint(page)
  step('leaderboard period switch (all→weekly)', { ms: now() - t0, totalRequests: page._reqCount - beforeReq, postRequests: page._postCount - beforePost })

  await page.evaluate(() => { [...document.querySelectorAll('button')].find((b) => b.innerText.includes('All Time'))?.click() })
  await waitForPaint(page)

  const select = await page.$('select')
  if (!select) {
    step('leaderboard exam switch', { ms: 0, info: 'skipped — exam dropdown not rendered' })
    return
  }
  const optionValues = await page.evaluate(() => [...document.querySelectorAll('select option')].map((o) => o.value).filter(Boolean))
  const second = optionValues.find((v) => v !== (optionValues[0] ?? ''))
  if (!second) {
    step('leaderboard exam switch', { ms: 0, info: 'skipped — only one exam option' })
    return
  }
  const t1 = now()
  const beforeReq2 = page._reqCount
  const beforePost2 = page._postCount
  await select.select(second)
  await waitForPaint(page)
  step('leaderboard exam switch', { ms: now() - t1, totalRequests: page._reqCount - beforeReq2, postRequests: page._postCount - beforePost2 })
}

async function openSession(page) {
  if (SESSION_URL) {
    await page.goto(SESSION_URL, { waitUntil: 'domcontentloaded' })
  } else {
    await page.goto(`${BASE_URL}/practice?hub=universities`, { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => document.body.innerText.includes('University Practice'), { timeout: 20000 })
    const resume = await page.evaluate(() => {
      const b = [...document.querySelectorAll('button')].find((x) => x.innerText.includes('Continue exam') || x.innerText.includes('Resume session'))
      if (b) { b.click(); return true }
      return false
    })
    if (!resume) {
      const examClicked = await page.evaluate(() => {
        const b = [...document.querySelectorAll('button')].find((x) => {
          const span = x.querySelector(':scope > span')
          return span && /text-sm/.test(span.className) && /font-bold/.test(span.className) && !/flex/.test(span.className) && !x.innerText.includes('£')
        })
        if (!b) return false
        b.click()
        return true
      })
      if (!examClicked) throw new Error('no exam card found')
      await page.waitForFunction(() => {
        const b = [...document.querySelectorAll('button')].find((x) => /^Start Practice/.test(x.innerText.trim()))
        return !!b
      }, { timeout: 15000 })
      await page.evaluate(() => {
        const b = [...document.querySelectorAll('button')].find((x) => /^Start Practice/.test(x.innerText.trim()))
        b.click()
      })
    }
  }
  await page.waitForFunction(() => window.location.pathname.startsWith('/practice/session/'), { timeout: 30000 })
  await page.waitForFunction(() => document.querySelector('h3'), { timeout: 30000 })
  await page.waitForFunction(() => document.body.innerText.includes('Question 1 of'), { timeout: 30000 })
  return page.url()
}

async function measureSessionInteractions(page) {
  const isPractice = await page.evaluate(() => !![...document.querySelectorAll('button')].find((b) => b.innerText.includes('Check Answer')))

  if (isPractice) {
    const t0 = now()
    const beforeReq = page._reqCount
    const beforePost = page._postCount
    await page.click('div.space-y-3 button')
    await waitForPaint(page)
    step('answer select (practice)', { ms: now() - t0, totalRequests: page._reqCount - beforeReq, postRequests: page._postCount - beforePost })

    const t1 = now()
    const beforeReq2 = page._reqCount
    const beforePost2 = page._postCount
    await page.evaluate(() => { [...document.querySelectorAll('button')].find((b) => b.innerText.includes('Check Answer'))?.click() })
    await page.waitForFunction(() => document.body.innerText.includes('Correct') || document.body.innerText.includes('Incorrect'), { timeout: 15000 })
    step('check answer (practice)', { ms: now() - t1, totalRequests: page._reqCount - beforeReq2, postRequests: page._postCount - beforePost2 })

    const t2 = now()
    await page.evaluate(() => { [...document.querySelectorAll('button')].find((b) => b.innerText.includes('Next Question'))?.click() })
    await page.waitForFunction(() => document.body.innerText.includes('Question 2 of'), { timeout: 15000 })
    step('next question (practice)', { ms: now() - t2 })
  } else {
    const t0 = now()
    const beforeReq = page._reqCount
    const beforePost = page._postCount
    await page.click('div.space-y-3 button')
    await waitForPaint(page)
    step('answer select (mock)', { ms: now() - t0, totalRequests: page._reqCount - beforeReq, postRequests: page._postCount - beforePost })

    const t1 = now()
    const clicked = await page.evaluate(() => {
      const b = [...document.querySelectorAll('button')].find((x) => /^(Next|Previous)$/.test(x.innerText.trim()))
      if (!b) return false
      b.click()
      return true
    })
    if (clicked) {
      await page.waitForFunction(() => document.body.innerText.includes('Question 2 of'), { timeout: 15000 })
      step('next question (mock)', { ms: now() - t1 })
    } else {
      step('next question (mock)', { ms: now() - t1, info: 'next button not found' })
    }
  }
}

async function main() {
  account = EMAIL && PASSWORD ? { email: EMAIL, password: PASSWORD } : await bootstrapAccount()

  await ensureServer()
  console.log(`Measuring against ${BASE_URL} (throttle: ${THROTTLE})`)
  console.log(`Account: ${account ? 'auto-created (cleaned up after run)' : 'public/passwordless scenarios only'}`)
  console.log('')

  const browser = await puppeteer.launch({ executablePath: edgePath, headless: true, args: ['--disable-gpu', '--window-size=1280,800'] })
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800 })
  page._reqCount = 0
  page._postCount = 0
  page.on('request', (r) => {
    page._reqCount++
    if (r.method() === 'POST') page._postCount++
  })
  await page.setCacheEnabled(false)
  await page.evaluateOnNewDocument(() => {
    window.__lcp = null
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        if (entries.length) window.__lcp = Math.round(entries[entries.length - 1].startTime)
      }).observe({ type: 'largest-contentful-paint', buffered: true })
    } catch {}
  })

  if (THROTTLE_PRESETS[THROTTLE]) {
    const cdp = await page.createCDPSession()
    await cdp.send('Network.enable')
    await cdp.send('Network.emulateNetworkConditions', THROTTLE_PRESETS[THROTTLE])
  }

  const loggedIn = await login(page)
  if (!loggedIn) {
    console.log('SKIPPING authenticated scenarios (dashboard, practice, session, leaderboard).')
  } else {
    await measureHardNav(page, 'dashboard', '/dashboard', 'h1')
    await page.goto(`${BASE_URL}/dashboard?hub=universities`, { waitUntil: 'domcontentloaded' })
    await page.waitForFunction((s) => document.querySelector(s), { timeout: 20000 }, 'h1')
    await measureSoftNav(page, 'dashboard → leaderboard', 'Leaderboard', '/leaderboard?hub=universities', 'University Leaderboard')
    await measureLeaderboard(page)
    await measureSoftNav(page, 'leaderboard → practice', 'Practice', '/practice?hub=universities', 'University Practice')
    try {
      const sessionUrl = await openSession(page)
      console.log(`   (session: ${sessionUrl})`)
      await measureSessionInteractions(page)
    } catch (err) {
      console.log(`   (session scenario skipped: ${err.message})`)
    }
  }

  await browser.close()
  await cleanupAccount()
  await stopServer()

  const dir = resolve(ROOT, 'logs', 'perf')
  mkdirSync(dir, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const base = `measure-${stamp}`
  const json = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    throttle: THROTTLE,
    authenticated: loggedIn,
    session: SESSION_URL,
    results,
  }
  writeFileSync(resolve(dir, `${base}.json`), JSON.stringify(json, null, 2))
  const md = [
    '# Performance measurement',
    '',
    `- Generated: ${json.generatedAt}`,
    `- Target: \`${BASE_URL}\``,
    `- Throttle: \`${THROTTLE}\``,
    `- Authenticated scenarios: ${loggedIn}`,
    '',
    '| Metric | ms | requests | POSTs | load | dcl | LCP |',
    '|---|---:|---:|---:|---:|---:|---:|',
    ...results.map((r) => `| ${r.name} | ${r.ms ?? '-'} | ${r.totalRequests ?? '-'} | ${r.postRequests ?? '-'} | ${r.load ?? '-'} | ${r.dcl ?? '-'} | ${r.lcp ?? '-'} |`),
    '',
  ].join('\n')
  writeFileSync(resolve(dir, `${base}.md`), md)
  console.log(`\nReport: logs/perf/${base}.json (+ .md)`)

  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  cleanupAccount()
    .catch(() => {})
    .finally(() => stopServer().finally(() => process.exit(1)))
})