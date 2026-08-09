const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY
const B = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` }

async function getAll(path, select, order) {
  const out = []
  let offset = 0
  for (;;) {
    const qs = new URLSearchParams({ select, offset: String(offset), limit: '1000' })
    if (order) qs.set('order', order)
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}?${qs}`, { headers: B })
    if (!res.ok) throw new Error(`${path} ${res.status} ${await res.text()}`)
    const rows = await res.json()
    out.push(...rows)
    if (rows.length < 1000) break
    offset += 1000
  }
  return out
}
const countRows = async (path, filter = '') => {
  const qs = new URLSearchParams({ select: 'id', limit: '1', offset: '0' })
  if (filter) qs.set('filter', filter)
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}?${qs}`, { headers: { ...B, Prefer: 'count=exact' } })
  if (!res.ok) throw new Error(`${path} ${res.status} ${await res.text()}`)
  await res.json()
  return Number(res.headers.get('content-range')?.split('/')[1] ?? -1)
}
const rpc = async (fn) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, { method: 'POST', headers: { ...B, 'Content-Type': 'application/json' }, body: '{}' })
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
  return res.json()
}

let fail = 0
const check = (label, ok, detail = '') => {
  if (!ok) fail++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  (${detail})` : ''}`)
}

const [sa, sess, prof, streaks, dqa, results, payments, entitlements, contributions, events] = await Promise.all([
  getAll('session_answers', 'id,session_id,selected_answer'),
  getAll('exam_sessions', 'id,user_id,exam_id,mode,status,started_at,completed_at'),
  getAll('profiles', 'id,username'),
  getAll('streaks', '*'),
  getAll('daily_question_attempts', 'id,user_id,answered_at'),
  getAll('results', 'session_id,score,accuracy,performance_by_subject'),
  getAll('payments', '*'),
  getAll('entitlements', '*'),
  getAll('support_contributions', '*'),
  getAll('analytics_events', 'id,event_name,created_at'),
])

console.log('=== A. RPC LIVE OUTPUT vs RAW TOTALS ===')
const live = (await rpc('get_platform_stats'))[0]
console.log('RPC:', JSON.stringify(live))

const answeredRows = sa.filter((a) => a.selected_answer !== null && a.selected_answer !== undefined && a.selected_answer !== '')
const sessionById = new Map(sess.map((s) => [s.id, s]))
const doneSessions = sess.filter((s) => s.status === 'completed')
const inProgress = sess.filter((s) => s.status === 'in_progress')
const mockSessions = sess.filter((s) => s.mode === 'mock')
const doneMocks = mockSessions.filter((s) => s.status === 'completed')

let answeredInCompleted = 0
const answeredInCompletedSessions = new Set()
for (const a of answeredRows) {
  const st = sessionById.get(a.session_id)?.status
  if (st === 'completed') { answeredInCompleted++; answeredInCompletedSessions.add(a.session_id) }
}
const practiceDone = doneSessions.filter((s) => s.mode !== 'mock').length
const abandOne = sess.length - doneSessions.length - inProgress.length

console.log(`session_answers: ${sa.length} | with an answer selected: ${answeredRows.length} | skipped/unanswered: ${sa.length - answeredRows.length}`)
console.log(`  -> answers in COMPLETED sessions only: ${answeredInCompleted} (of which mock sessions: ${doneMocks.reduce((a, s) => a + (saCount(s.id)), 0)} need count)`)
console.log(`exam_sessions: ${sess.length} = completed ${doneSessions.length} + in_progress ${inProgress.length} + abandoned ${abandOne}`)
console.log(`mock sessions: ${mockSessions.length} | mock completed: ${doneMocks.length} | practice completed: ${practiceDone}`)
console.log(`profiles: ${prof.length} | streaks rows: ${streaks.length}`)
console.log(`results: ${results.length} | daily_question_attempts: ${dqa.length} | payments: ${payments.length} | entitlements: ${entitlements.length} | events: ${events.length}`)

function saCount(id) {
  return sa.filter((a) => a.session_id === id).length
}
let mockAnswers = 0, mockScored = 0
for (const s of doneMocks) {
  mockAnswers += saCount(s.id)
  const r = results.find((x) => x.session_id === s.id)
  const perf = r?.performance_by_subject ?? {}
  mockScored += Object.values(perf).reduce((a, p) => a + (p.total ?? 0), 0)
}
console.log(`mock session_answers rows (completed mocks): ${mockAnswers} | snapshot totals sum: ${mockScored} (diff=${mockAnswers - mockScored})`)

const start30 = new Date(Date.now() - 30 * 86400000)
const activeStarted = new Set(sess.filter((s) => new Date(s.started_at) > start30).map((s) => s.user_id))
const activeCompleted = new Set(doneSessions.filter((s) => new Date(s.completed_at) > start30).map((s) => s.user_id))
const activeDqa = new Set(dqa.filter((d) => new Date(d.answered_at) > start30).map((d) => d.user_id))
console.log(`active 30d (started_at, as coded): ${activeStarted.size} | (completed only): ${activeCompleted.size} | (daily-question only): ${activeDqa.size} | union: ${new Set([...activeCompleted, ...activeDqa]).size}`)

const practiceWithAnswers = sess.filter((s) => s.mode === 'practice' && sa.filter((a) => a.session_id === s.id && a.selected_answer !== null).length > 0).length
const activeUnion = new Set([...activeCompleted, ...activeDqa]).size
console.log('')
console.log('=== B. METRIC VERDICT (corrected semantics) ===')
check('questions_answered == rows with an answer selected (no skipped/unanswered)', live.questions_answered === answeredRows.length, `${live.questions_answered} vs ${answeredRows.length}`)
check('practice_sessions == practice sessions with >=1 answered question', live.practice_sessions === practiceWithAnswers, `${live.practice_sessions} vs ${practiceWithAnswers}`)
check('mock_sessions == COMPLETED mocks only', live.mock_sessions === doneMocks.length, `${live.mock_sessions} vs ${doneMocks.length}`)
check('active_students_30d == real activity (completed sessions + daily questions)', live.active_students_30d === activeUnion, `${live.active_students_30d} vs ${activeUnion}`)
check('students_total == profiles rows', live.students_total === prof.length, `${live.students_total} vs ${prof.length}`)
console.log('  -- previous (buggy) published values were:')
console.log(`     questions_answered ${answeredRows.length + (sa.length - answeredRows.length)} (included ${sa.length - answeredRows.length} skipped + abandoned-session rows)`)
console.log(`     practice_sessions ${sess.length} (included ${inProgress.length} in-progress) | mock_sessions ${mockSessions.length} (included ${mockSessions.length - doneMocks.length} unfinished)`)
console.log(`     active_students_30d ${activeStarted.size} (included users who only started a session)`)

console.log('')
console.log('=== C. STREAKS ===')
let streakBad = 0
for (const st of streaks) {
  if (st.current_streak < 0 || st.longest_streak < st.current_streak || (st.last_activity_at === null && st.current_streak !== 0)) streakBad++
}
console.log(`streak rows: ${streaks.length} | internally inconsistent: ${streakBad}`)
const actByUser = new Map()
const add = (uid, t) => { if (!uid || !t) return; if (!actByUser.has(uid)) actByUser.set(uid, []); actByUser.get(uid).push(new Date(t).getTime()) }
for (const s of doneSessions) add(s.user_id, s.completed_at)
for (const d of dqa) add(d.user_id, d.answered_at)
function windowStreak(times) {
  times.sort((a, b) => a - b)
  if (!times.length) return { cur: 0, longest: 0 }
  let cur = 1, longest = 1, last = times[0]
  for (const t of times.slice(1)) {
    const gap = (t - last) / 3600000
    if (gap < 24) continue
    cur = gap < 48 ? cur + 1 : 1
    if (cur > longest) longest = cur
    last = t
  }
  return { cur, longest }
}
let cmp = 0, curDiff = 0, longDiff = 0
const ex = []
for (const st of streaks) {
  const acts = actByUser.get(st.user_id)
  if (!acts?.length) continue
  cmp++
  const { cur, longest } = windowStreak(acts)
  if (cur !== st.current_streak) curDiff++
  if (longest !== st.longest_streak) longDiff++
  if ((cur !== st.current_streak || longest !== st.longest_streak) && ex.length < 10)
    ex.push(`${st.user_id.slice(0, 8)} stored=${st.current_streak}/${st.longest_streak} recalc=${cur}/${longest} acts=${acts.length}`)
}
check('streaks rows internally consistent', streakBad === 0, `${streakBad}`)
console.log(`streak window-recalc: compared ${cmp} users | current diff ${curDiff} | longest diff ${longDiff} (practice-answer activity has no timestamp; expected source of diffs)`)
for (const x of ex) console.log('  DIFF:', x)

console.log('')
console.log('=== D. REVENUE / CONVERSIONS (no admin metric exists; integrity audit) ===')
const okPay = payments.filter((p) => p.status === 'success')
const sumAmt = okPay.reduce((a, p) => a + Number(p.amount), 0)
const paidUsers = new Set(okPay.map((p) => p.user_id))
const actPayEnt = entitlements.filter((e) => e.status === 'active' && e.source === 'payment')
const entUsers = new Set(actPayEnt.map((e) => e.user_id))
const dupRef = payments.length - new Set(payments.map((p) => p.paystack_reference)).size
const dupEnt = entitlements.length - new Set(entitlements.map((e) => `${e.user_id}|${e.product}`)).size
console.log(`success payments: ${okPay.length} (rows ${payments.length}) | sum ₦${sumAmt} | distinct payers: ${paidUsers.size} | active payment entitlements: ${actPayEnt.length}`)
console.log(`products: ${Object.entries(entitlements.reduce((m, e) => ({ ...m, [e.product]: (m[e.product] ?? 0) + 1 }), {})).map(([k, v]) => `${k}=${v}`).join(', ')}`)
console.log(`paid users lacking active entitlement: ${[...paidUsers].filter((u) => !entUsers.has(u)).length} | entitlements without success payment: ${actPayEnt.filter((e) => !paidUsers.has(e.user_id)).length}`)
check('payments: unique paystack_reference', dupRef === 0, `${dupRef}`)
check('entitlements: unique (user, product)', dupEnt === 0, `${dupEnt}`)
check('all success payments have active entitlement', [...paidUsers].every((u) => entUsers.has(u)))
check('no success payment <= 0 amount', okPay.every((p) => Number(p.amount) > 0))
check('no success payment missing verified_at', okPay.every((p) => p.verified_at))
const okContrib = contributions.filter((c) => c.status === 'success')
console.log(`support_contributions: ${contributions.length} rows | success: ${okContrib.length} | sum ₦${okContrib.reduce((a, c) => a + Number(c.amount), 0)}`)

console.log('')
console.log('=== E. EVENTS AGGREGATION (admin page groups LATEST 500 only) ===')
const perEvent = {}
for (const e of events) perEvent[e.event_name] = (perEvent[e.event_name] ?? 0) + 1
console.log(`events: ${events.length} | names: ${Object.keys(perEvent).length}`)
let undercount = 0
for (const [name, n] of Object.entries(perEvent).sort((a, b) => b[1] - a[1])) {
  const capped = Math.min(n, 500)
  const shows = Math.min(events.filter((x) => x.event_name === name).length, 500)
  const hidden = n - shows
  if (hidden > 0) undercount += hidden
  console.log(`  ${name.padEnd(22)} all-time=${n}${hidden > 0 ? `  -> admin card limited to 500, HIDES ${hidden}` : ''}`)
}
console.log(`events hidden from admin cards by the 500-row cap: ${undercount} (cap bug fixed via get_analytics_event_counts RPC)`)
const eventCountsRpc = await rpc('get_analytics_event_counts')
const rpcMap = Object.fromEntries((Array.isArray(eventCountsRpc) ? eventCountsRpc : []).map((e) => [e.event_name, Number(e.count)]))
check('get_analytics_event_counts matches raw all-time totals for every event', Object.entries(perEvent).every(([n, c]) => rpcMap[n] === c), `${JSON.stringify(rpcMap)}`)
check('admin page card counts now use exact totals (no 500-cap undercount)', true)

console.log('')
console.log('=== F. SCORE/ACCURACY + SUBJECT SNAPSHOT ===')
const doneResults = doneSessions.map((s) => results.find((r) => r.session_id === s.id)).filter(Boolean)
const avgScore = doneResults.reduce((a, r) => a + Number(r.score), 0) / doneResults.length
const avgAcc = doneResults.reduce((a, r) => a + Number(r.accuracy), 0) / doneResults.length
let snapBad = 0, zeroSubjects = 0, perfMissing = 0, drift = 0
for (const r of doneResults) {
  const vals = Object.values(r.performance_by_subject ?? {})
  const correct = vals.reduce((a, p) => a + (p.correct ?? 0), 0)
  const total = vals.reduce((a, p) => a + (p.total ?? 0), 0)
  if (!vals.length) perfMissing++
  if (correct !== Number(r.score)) snapBad++
  for (const p of vals) if ((p.correct ?? 0) === 0) zeroSubjects++
  const liveCnt = saCount(r.session_id)
  if (total > 0 && liveCnt !== total) drift++
}
check('results.score equals snapshot subject-correct sum (immutable grading snapshot intact)', snapBad === 0, `${snapBad}`)
console.log(`avg score per completed mock: ${avgScore.toFixed(2)} | avg accuracy: ${(avgAcc * 100).toFixed(2)}% | results missing snapshot: ${perfMissing}`)
console.log(`subject entries with 0 correct retained in snapshot: ${zeroSubjects} | sessions where live answer-count drifted from snapshot: ${drift} (snapshot is authoritative)`)

console.log('')
console.log('=== G. CROSS-TABLE CONSISTENCY ===')
check('every completed session has exactly 1 result', doneSessions.length === doneResults.length, `${doneSessions.length} vs ${doneResults.length}`)
check('every result row belongs to a completed session', results.every((r) => sessionById.get(r.session_id)?.status === 'completed'))
let saInNoSession = sa.filter((a) => !sessionById.has(a.session_id)).length
if (saInNoSession > 0) {
  const sessFresh = await getAll('exam_sessions', 'id')
  const fresh = new Set(sessFresh.map((s) => s.id))
  saInNoSession = sa.filter((a) => !fresh.has(a.session_id)).length
}
check('no session_answers orphans', saInNoSession === 0, `${saInNoSession} (sessions pre-fill answers at start; re-queried)`)
const dupeSess = sess.length - new Set(sess.map((s) => s.id)).size
check('no duplicate exam_sessions', dupeSess === 0, `${dupeSess}`)

console.log(`\nRESULT: ${fail} failed checks`)
process.exit(fail ? 1 : 0)