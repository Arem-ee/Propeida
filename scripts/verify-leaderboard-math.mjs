import { writeFileSync } from 'node:fs'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY
const B = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` }

const nowD = new Date()
const monday = new Date(nowD)
monday.setDate(nowD.getDate() - ((nowD.getDay() + 6) % 7))
monday.setHours(0, 0, 0, 0)
const WEEK_START = monday

let failures = 0
const passed = []
const failed = []
const check = (label, ok, detail = '') => {
  if (ok) passed.push(label)
  else { failures++; failed.push(`${label}${detail ? ` (${detail})` : ''}`) }
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  (${detail})` : ''}`)
}
const round2 = (n) => Math.round(n * 100) / 100

const get = async (path, params = {}) => {
  const qs = new URLSearchParams(params)
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}?${qs}`, { headers: B })
  if (!res.ok) throw new Error(`${path} ${res.status} ${await res.text()}`)
  return res.json()
}

const [entries, sessions, results, profiles] = await Promise.all([
  get('leaderboard_entries', { select: '*', limit: 100000 }),
  get('exam_sessions', { select: 'id,user_id,exam_id,status,completed_at', limit: 100000 }),
  get('results', { select: 'session_id,score,accuracy,performance_by_subject,created_at', limit: 100000 }),
  get('profiles', { select: 'id,username', limit: 100000 }),
])

const completedSessions = sessions.filter((s) => s.status === 'completed')
const byUserExam = new Map()
for (const s of completedSessions) {
  const k = `${s.user_id}|${s.exam_id}`
  if (!byUserExam.has(k)) byUserExam.set(k, [])
  byUserExam.get(k).push(s)
}

// 1. Integrity of raw data
const rBySession = new Map(results.map((r) => [r.session_id, r]))
const resultSessions = new Set(results.map((r) => r.session_id))
const sessionsWithResults = completedSessions.filter((s) => resultSessions.has(s.id))
console.log('--- raw data integrity ---')
check('completed sessions == results rows (every completed mock stored exactly once)',
  completedSessions.length === results.length, `${completedSessions.length} vs ${results.length}`)
check('no result row without a completed session', results.every((r) => completedSessions.some((s) => s.id === r.session_id)))
const dupResultIds = results.length - new Set(results.map((r) => r.session_id)).size
check('no duplicate result rows', dupResultIds === 0)
const usersWithResults = new Set(sessionsWithResults.map((s) => s.user_id))
const usersActiveThisWeek = new Set(sessionsWithResults.filter((s) => new Date(s.completed_at) >= WEEK_START).map((s) => s.user_id))
const entryKeys = new Set(entries.map((e) => `${e.user_id}|${e.exam_id}|${e.period}`))
const perPeriodCount = (p) => entries.filter((e) => e.period === p).length
check('every user with results has exactly one all_time entry',
  perPeriodCount('all_time') === usersWithResults.size, `${perPeriodCount('all_time')} for ${usersWithResults.size} users`)
check('weekly entries only for users active this week',
  perPeriodCount('weekly') === usersActiveThisWeek.size, `${perPeriodCount('weekly')} for ${usersActiveThisWeek.size} users`)
check('no duplicate (user_id, exam_id, period) entries', entryKeys.size === entries.length)
check('ground truth: results.score == sum of performance_by_subject.correct',
  results.every((r) => {
    const perf = Object.values(r.performance_by_subject ?? {})
    const correct = perf.reduce((a, p) => a + (p.correct ?? 0), 0)
    return correct === Number(r.score)
  }))

// 2. Recompute every entry from raw data
console.log('')
console.log('--- per-entry recomputation vs stored (tolerance 0.005) ---')
const trueTotalOf = (r) => {
  let total = 0
  for (const v of Object.values(r.performance_by_subject ?? {})) total += v.total ?? 0
  return total
}
const bayes = (score, total) => (total === 0 ? null : round2(((score + 5) / (total + 10)) * 100))

let checked = 0, mismatches = 0
const mismatchLog = []
const recomputed = new Map()
for (const e of entries) {
  const key = `${e.user_id}|${e.exam_id}`
  if (!recomputed.has(key)) {
    const rows = byUserExam.get(key) ?? []
    let aScore = 0, aQ = 0, wScore = 0, wQ = 0
    for (const s of rows) {
      const r = rBySession.get(s.id)
      if (!r) continue
      aScore += Number(r.score); aQ += trueTotalOf(r)
      if (new Date(s.completed_at) >= WEEK_START) { wScore += Number(r.score); wQ += trueTotalOf(r) }
    }
    recomputed.set(key, {
      all_time: bayes(aScore, aQ), weekly: bayes(wScore, wQ),
      correct: aScore, questions: aQ, mocks: rows.length,
    })
  }
  checked++
  const ours = recomputed.get(key)[e.period]
  const diff = ours === null || Math.abs(ours - Number(e.score)) > 0.005
  if (diff) {
    mismatches++
    if (mismatchLog.length < 20) mismatchLog.push(`${e.period} user=${e.user_id.slice(0, 8)} stored=${e.score} ours=${ours} (correct=${recomputed.get(key).correct} q=${recomputed.get(key).questions} mocks=${recomputed.get(key).mocks} updated=${e.updated_at.slice(0, 10)})`)
  }
}
check('every stored leaderboard entry equals independent recalculation', mismatches === 0, `checked=${checked} diffs=${mismatches}`)
for (const l of mismatchLog) console.log('  MISMATCH:', l)

// 3. Verify the recompute RPC is callable (service role) and idempotent
console.log('')
console.log('--- recompute_leaderboard_entries() RPC ---')
let rpcErr = null
try {
  const rpc = await fetch(`${SUPABASE_URL}/rest/v1/rpc/recompute_leaderboard_entries`, { method: 'POST', headers: { ...B, 'Content-Type': 'application/json' }, body: '{}' })
  if (!rpc.ok) rpcErr = `${rpc.status} ${await rpc.text()}`
} catch (e) { rpcErr = e.message }
check('recompute_leaderboard_entries() callable and succeeds', !rpcErr, rpcErr ?? '')
if (!rpcErr) {
  const entries2 = await get('leaderboard_entries', { select: '*', limit: 100000 })
  check('recompute leaves every entry unchanged (idempotent, score stable after fix)',
    entries2.length === entries.length && entries2.every((e) => Math.abs(Number(e.score) - Number(entries.find((x) => x.user_id === e.user_id && x.exam_id === e.exam_id && x.period === e.period)?.score ?? 0)) <= 0.005))
}

// 4. Corrected all-time top-10 table
console.log('')
console.log('--- corrected all-time top 10 (recomputed) ---')
const nameOf = (uid) => profiles.find((p) => p.id === uid)?.username ?? '???'
const ranked = [...recomputed.entries()]
  .map(([k, v]) => ({ key: k, ...v }))
  .filter((x) => x.all_time !== null && x.correct > 0)
  .sort((a, b) => b.all_time - a.all_time)
  .slice(0, 10)
for (const [i, r] of ranked.entries()) {
  const stored = entries.find((e) => `${e.user_id}|${e.exam_id}` === r.key && e.period === 'all_time')
  console.log(`  ${String(i + 1).padStart(2)}. ${(nameOf(r.key.split('|')[0]) ?? '???').padEnd(22)} score=${r.all_time.toFixed(2).padEnd(7)} (correct=${r.correct} questions=${r.questions} mocks=${r.mocks})`)
}

// 5. Weekly vs all-time separation
console.log('')
const weekly = entries.find((e) => e.period === 'weekly' && `${e.user_id}|${e.exam_id}` === ranked[0]?.key)
const allT = entries.find((e) => e.period === 'all_time' && `${e.user_id}|${e.exam_id}` === ranked[0]?.key)
check('top user has distinct weekly and all_time entries', !!weekly && !!allT && weekly.id !== allT.id)
check('weekly score <= all_time score for top user (week window is a subset)', Number(weekly?.score ?? 0) <= Number(allT?.score ?? 0) + 0.005)

writeFileSync('logs/leaderboard-verification.txt', [
  `verified at ${new Date().toISOString()}`,
  `entries checked: ${checked}`,
  `PASS ${passed.length} | FAIL ${failures}`,
  ...failed.map((f) => `FAIL ${f}`),
  '',
  'corrected top 10:',
  ...ranked.map((r, i) => `${i + 1}. ${nameOf(r.key.split('|')[0])} ${r.all_time}`),
].join('\n'))
console.log(`\nPASS ${passed.length} | FAIL ${failures}`)
process.exit(failures ? 1 : 0)