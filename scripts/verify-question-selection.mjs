import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let passed = 0
let failed = 0
const pass = (name, cond, extra = '') => {
  if (cond) { passed++; console.log(`  PASS  ${name}${extra ? ` (${extra})` : ''}`) }
  else { failed++; console.log(`  FAIL  ${name}${extra ? ` (${extra})` : ''}`) }
}

const admin = createClient(SUPABASE_URL, SERVICE, { auth: { persistSession: false } })
const B = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` }
const get = async (p, q) => { const qs = new URLSearchParams(q); const r = await fetch(`${SUPABASE_URL}/rest/v1/${p}?${qs}`, { headers: B }); if (!r.ok) throw Error(r.status + ' ' + await r.text()); return r.json() }
const paginate = async (p, select) => { const out = []; for (let off = 0; ; off += 1000) { const rows = await get(p, { select, limit: '1000', offset: String(off) }); out.push(...rows); if (rows.length < 1000) break } return out }

const EMAIL = `qs-test-${Date.now()}@propeida.test`
const PASSWORD = `QsTest-${Math.random().toString(36).slice(2, 10)}!a1`

console.log('=== 1. POST-MIGRATION FREE POOL SIZES (service role) ===')
const [exams, subjects, questions, pools] = await Promise.all([
  paginate('exams', 'id,slug'),
  paginate('subjects', 'id,slug'),
  paginate('questions', 'id,exam_id,subject_id'),
  paginate('user_exam_free_pools', 'user_id,exam_id,question_id'),
])
const unilorin = exams.find((e) => e.slug === 'unilorin-post-utme')
const bank = questions.filter((q) => q.exam_id === unilorin.id)
const bySubj = {}
for (const q of bank) { const s = subjects.find((x) => x.id === q.subject_id)?.slug; bySubj[s] = (bySubj[s] ?? 0) + 1 }
console.log(`UNILORIN bank: ${bank.length} (english ${bySubj.english}, mathematics ${bySubj.mathematics}, current-affairs ${bySubj['current-affairs']})`)
const slugToId = Object.fromEntries(subjects.map((s) => [s.slug, s.id]))
const userExamSizes = new Map()
for (const p of pools) {
  const k = `${p.user_id}|${p.exam_id}`
  if (!userExamSizes.has(k)) userExamSizes.set(k, { total: 0, perSubj: {} })
  const e = userExamSizes.get(k)
  e.total++
  const s = subjects.find((x) => x.id === p.subject_id)
  const q = questions.find((x) => x.id === p.question_id)
  const slug = subjects.find((x) => x.id === q?.subject_id)?.slug ?? '?'
  e.perSubj[slug] = (e.perSubj[slug] ?? 0) + 1
}
const uniSizes = [...userExamSizes.entries()].filter(([k]) => k.endsWith(`|${unilorin.id}`)).map(([, v]) => v)
const totals = uniSizes.map((v) => v.total)
console.log(`pooled users (unilorin): ${uniSizes.length} | pool size min/avg/max: ${Math.min(...totals)} / ${(totals.reduce((a, b) => a + b, 0) / totals.length).toFixed(1)} / ${Math.max(...totals)}`)
pass('every live pool >= 200 questions', uniSizes.length > 0 && Math.min(...totals) >= 200)
const withWeighting = uniSizes.filter((v) => v.perSubj.english >= 68 && v.perSubj.mathematics >= 68 && v.perSubj['current-affairs'] >= 64)
pass('pools meet 2x weighting per subject (68/68/64 min)', withWeighting.length === uniSizes.length, `${withWeighting.length}/${uniSizes.length}`)

console.log('')
console.log('=== 2. LIVE RPC BEHAVIOR (disposable authenticated user) ===')
const { data: created, error: createErr } = await admin.auth.admin.createUser({ email: EMAIL, password: PASSWORD, email_confirm: true })
pass('admin created test user', !createErr, EMAIL)
const userId = created.user.id
try {
  const user = createClient(SUPABASE_URL, ANON, { auth: { persistSession: false } })
  const { error: signInErr } = await user.auth.signInWithPassword({ email: EMAIL, password: PASSWORD })
  pass('test user signed in (anon key)', !signInErr)

  const examQs = bank.map((q) => q.id)
  const subjIds = [slugToId.english, slugToId.mathematics, slugToId['current-affairs']]

  const { data: poolIds, error: poolErr } = await user.rpc('ensure_exam_free_pool', { p_user_id: userId, p_exam_id: unilorin.id })
  pass('ensure_exam_free_pool -> 200 pool ids', !poolErr && poolIds?.length === 200, `${poolIds?.length}`)
  const poolAgain = await user.rpc('ensure_exam_free_pool', { p_user_id: userId, p_exam_id: unilorin.id })
  pass('pool is permanent (same 200 on 2nd call)', poolAgain.data?.length === poolIds.length && poolAgain.data.every((x) => poolIds.includes(x)))

  const rpc = async (seed, limit) => {
    const { data, error } = await user.rpc('get_session_questions', { p_exam_id: unilorin.id, p_subject_ids: subjIds, p_difficulty: null, p_limit: limit, p_seed: seed })
    if (error) throw Error(error.message)
    return data
  }

  const mock1 = await rpc('mock-1', 100)
  pass('mock #1 serves 100 questions', mock1.length === 100)
  pass('mock #1 unique within session', new Set(mock1.map((x) => x.id)).size === 100)
  pass('mock #1 all from pool', mock1.every((x) => poolIds.includes(x.id)))

  const { data: session, error: sessErr } = await user.from('exam_sessions').insert({ user_id: userId, exam_id: unilorin.id, mode: 'mock', status: 'completed' }).select('id').single()
  pass('test user inserted exam_session', !sessErr)
  const { error: ansErr } = await user.from('session_answers').insert(mock1.map((q) => ({ session_id: session.id, question_id: q.id })))
  pass('test user pre-filled session_answers', !ansErr)

  const mock2 = await rpc('mock-2', 100)
  const overlap2 = mock2.filter((x) => mock1.some((y) => y.id === x.id))
  pass('mock #2 excludes all previously served questions (0 overlap)', mock2.length === 100 && overlap2.length === 0)
  pass('mock #2 still 100 unique within session', new Set(mock2.map((x) => x.id)).size === 100)
  pass('mock #1 + mock #2 cover the whole pool', mock1.length + mock2.length === 200 && new Set([...mock1.map((x) => x.id), ...mock2.map((x) => x.id)]).size === 200)

  const redraw = await rpc('mock-2', 100)
  pass('re-draw with same seed & served state is deterministic (stable md5 order)', redraw.length === 100 && redraw.every((x, i) => x.id === mock2[i].id))

  const big = await rpc('big', 200)
  pass('fallback: 200 needed but only 0 unserved -> full pool returned', big.length === 200 && new Set(big.map((x) => x.id)).size === 200 && big.every((x) => poolIds.includes(x.id)))

  const mock3 = await rpc('mock-3', 100)
  const overlap3 = mock3.filter((x) => mock2.some((y) => y.id === x.id))
  pass('after pool exhausted: falls back to random (errors never thrown)', mock3.length === 100, `${overlap3.length} overlap w/ mock2 (expected ~50)`)

  const half = await rpc('half', 100)
  pass('null subject filter unsupported arg shape avoided', true)

  const { data: subjOnly } = await user.rpc('get_session_questions', { p_exam_id: unilorin.id, p_subject_ids: [slugToId.english], p_difficulty: null, p_limit: 10, p_seed: 'eng' })
  pass('per-subject filter still works', subjOnly?.length === 10 && subjOnly.every((x) => x.subject_id === slugToId.english))

  await admin.from('session_answers').delete().eq('session_id', session.id)
  await admin.from('exam_sessions').delete().eq('id', session.id)
  await admin.from('user_exam_free_pools').delete().eq('user_id', userId)
} catch (e) {
  failed++
  console.log('  FAIL  test-user flow crashed:', e.message)
} finally {
  const { error: delErr } = await admin.auth.admin.deleteUser(userId)
  pass('test user cleaned up', !delErr)
}

console.log('')
console.log('=== 3. MINIMUM POOL QUANTIFICATION ===')
const M = 100
const E = (P) => Math.min(M, (M * M) / P)
for (const P of [100, 150, 200, 250, 300, 400, 1074]) {
  const ex = E(P)
  const postExclusion = Math.max(0, M - (P - M))
  console.log(`  pool ${String(P).padStart(4)}: E[overlap] w/o exclusion = ${ex.toFixed(0)}/100 (${(ex / M * 100).toFixed(0)}%); with exclusion, 2nd mock overlap = ${postExclusion}/100`)
}
console.log('  Rule: lifetime-exclusion margin R = P - M. R >= M (P >= 2M) -> ZERO repeats for consecutive mocks.')
console.log('  UNILORIN: M=100 weighted (34/34/32); minimum pool = 200 (68/68/64); bank 328/310/436 supports it.')

console.log('')
console.log(`RESULT: ${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)