// Push authored explanations for published economics rows with empty explanations.
// Two id spaces:
//  - legible batches (01-04-out): ids are question_answers.question_id UUIDs
//  - orphan batches (01-03-out): ids are bank ids (econ-YYYY-qNN) → question_id via content-folder/_work/economics-empty-orphan-match.json
// Disputed-key rows go to in_review with a review_note.
// Usage: node --env-file=.env scripts/push-econ-explanations.mjs            (dry run)
//        node --env-file=.env scripts/push-econ-explanations.mjs --apply    (execute)
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

const apply = process.argv.includes('--apply')
const fetchWithTimeout = (input, init = {}) => fetch(input, { ...init, signal: AbortSignal.timeout(20000) })
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { global: { fetch: fetchWithTimeout } })

const sleep = (ms) => new Promise(r => setTimeout(r, ms))
async function withRetry(label, fn) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fn()
      if (res?.error) throw new Error(res.error.message ?? JSON.stringify(res.error))
      return res
    } catch (err) {
      if (attempt === 3) { console.error(`${label} failed after 3 attempts: ${err.message}`); return null }
      console.warn(`${label} attempt ${attempt} failed: ${err.message}; retrying`)
      await sleep(attempt * 750)
    }
  }
}
// PostgREST .in() with 130 uuids ≈ 4.7 KB in the query string — too long for the gateway. Chunk into 50s.
async function batchIn(label, ids, fetchBatch) {
  const out = []
  for (let i = 0; i < ids.length; i += 50) {
    const slice = ids.slice(i, i + 50)
    const res = await withRetry(`${label} batch ${i / 50 + 1}`, () => fetchBatch(slice))
    if (res?.data) out.push(...res.data)
    else console.error(`${label} batch ${i / 50 + 1} returned no data`)
  }
  return out
}

// ---- 1. collect explanations from all out files ----
const explanations = new Map() // question_id(uuid) → explanation text
for (const n of ['01', '02', '03', '04']) {
  const f = `content-folder/_work/econ-explain-batch-${n}-out.json`
  for (const e of JSON.parse(readFileSync(f, 'utf8'))) explanations.set(e.id, e.explanation.trim())
}
const orphanMatch = JSON.parse(readFileSync('content-folder/_work/economics-empty-orphan-match.json', 'utf8'))
const bankIdToDbId = new Map(orphanMatch.matched.map(m => [m.bankId, m.dbId]))
let orphanCount = 0
for (const n of ['01', '02', '03']) {
  const f = `content-folder/_work/econ-orphan-explain-${n}-out.json`
  if (!existsSync(f)) { console.log('orphan batch', n, 'not present — skipping'); continue }
  for (const e of JSON.parse(readFileSync(f, 'utf8'))) {
    const dbId = bankIdToDbId.get(e.id)
    if (!dbId) { console.log('NO DB MAPPING for orphan id', e.id); continue }
    explanations.set(dbId, e.explanation.trim())
    orphanCount++
  }
}
console.log('explanations collected:', explanations.size, '(orphan-sourced:', orphanCount, ')')

// ---- 2. collect disputed ids (mix of uuid and bank-id), normalize to uuid with per-id notes ----
const flaggedRaw = JSON.parse(readFileSync('content-folder/_work/economics-flagged-keys.json', 'utf8'))
const batch03NotesPath = 'content-folder/_work/economics-batch03-flag-notes.json'
const batch03Notes = existsSync(batch03NotesPath) ? JSON.parse(readFileSync(batch03NotesPath, 'utf8')) : {}
const disputed = [] // { uuid, note }
for (const id of flaggedRaw) {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-/.test(id)) disputed.push({ uuid: id, note: 'agent flagged: key disagrees with standard economics — needs human review' })
  else {
    const dbId = bankIdToDbId.get(id)
    if (dbId) disputed.push({ uuid: dbId, note: batch03Notes[id] ?? 'agent flagged: key disagrees with standard economics — needs human review' })
    else console.log('disputed id with no DB mapping:', id)
  }
}
console.log('disputed rows to move in_review:', disputed.length)

// ---- 3. sanity: all target rows exist; skip rows that already have a non-empty explanation ----
const targetIds = [...explanations.keys()]
const { data: subject } = await withRetry('subject lookup', () => db.from('subjects').select('id').eq('slug', 'economics').single())
const subjectId = subject.id
const rows = await batchIn('target rows', targetIds, (slice) =>
  db.from('questions').select('id, question_text, status').in('id', slice).eq('subject_id', subjectId))
const found = new Map(rows.map(q => [q.id, q]))
const missing = targetIds.filter(id => !found.has(id))
console.log('target rows found in DB:', found.size, '| missing:', missing.length)
const qa = await batchIn('question_answers rows', targetIds, (slice) =>
  db.from('question_answers').select('question_id, explanation').in('question_id', slice))
const qaByQ = new Map(qa.map(r => [r.question_id, r]))
const stillEmpty = targetIds.filter(id => !((qaByQ.get(id)?.explanation ?? '').trim()))
console.log('already have explanation (will skip):', targetIds.length - stillEmpty.length, '| to update:', stillEmpty.length)

if (!apply) {
  console.log('\nDRY RUN — re-run with --apply to execute.')
  for (const id of stillEmpty.slice(0, 5)) console.log(' question_id', id.slice(0, 8), '←', explanations.get(id).slice(0, 80))
  console.log('in_review will be set on (prefix):', disputed.map(d => d.uuid.slice(0, 8)).join(' '))
  process.exit(0)
}

// ---- concurrency pool: the DB link throttles hard past sequential calls; run ~6 in flight ----
async function pMap(items, concurrency, fn) {
  const results = new Array(items.length)
  let next = 0
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (next < items.length) {
      const i = next++
      results[i] = await fn(items[i], i)
    }
  })
  await Promise.all(workers)
  return results
}

// ---- 4. apply: explanations ----
let updatedExpl = 0
const failures = []
await pMap(stillEmpty, 6, async (id) => {
  const res = await withRetry(`expl ${id.slice(0, 8)}`, () =>
    db.from('question_answers').update({ explanation: explanations.get(id) }).eq('question_id', id).then(r => { if (r.error) throw new Error(r.error.message); return r }))
  if (res) updatedExpl++; else failures.push(id)
})
console.log('explanations written:', updatedExpl, '| failed:', failures.length)

// ---- 5. apply: in_review ----
let statusMoved = 0
const statusFailures = []
await pMap(disputed, 6, async ({ uuid, note }) => {
  const res = await withRetry(`status ${uuid.slice(0, 8)}`, () =>
    db.from('questions').update({ status: 'in_review', review_note: note })
      .eq('id', uuid).eq('subject_id', subjectId)
      .then(r => { if (r.error) throw new Error(r.error.message); return r }))
  if (res) statusMoved++; else statusFailures.push(uuid)
})
console.log('rows moved to in_review:', statusMoved, '| failed:', statusFailures.length)

if (failures.length || statusFailures.length) {
  writeFileSync('content-folder/_work/econ-explanations-failed.json', JSON.stringify({ explanations: failures, inReview: statusFailures }, null, 2))
  console.log('failures written to content-folder/_work/econ-explanations-failed.json')
  process.exit(1)
}
console.log('all applied cleanly.')
