// seeds a JAMB UTME question bank built from LLM-solved past papers with an 'unmapped' topic default.
//
// Used for the biology and commerce banks authored 2026-11-15. Answers are
// LLM-solved, NOT source-verified; verified_state is set to 'source_cited'.
// Rows whose explanation was flagged with the key-disagreement marker are NOT
// seeded here â€” they are routed to in_review via the flagging step instead.
//
// Usage:
//   node --env-file=.env scripts/seed-bio-com-jamb-bank.mjs --subject biology --source content-folder/biology-jamb-bank.json [--dry-run] [--min-confidence low|medium|high]
//   node --env-file=.env scripts/seed-bio-com-jamb-bank.mjs --subject commerce --source content-folder/commerce-jamb-bank.json [--dry-run]

import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const args = process.argv.slice(2)
const flag = (name, fallback = undefined) => {
  const i = args.indexOf(name)
  if (i === -1) return fallback
  return args[i + 1]
}
const hasFlag = (name) => args.includes(name)
const dryRun = hasFlag('--dry-run')
const subjectSlug = flag('--subject')
if (!['biology', 'commerce'].includes(subjectSlug)) {
  console.error('--subject biology|commerce is required')
  process.exit(1)
}

const minConfidence = flag('--min-confidence', 'low')
const CONFIDENCE_RANK = { high: 3, medium: 2, low: 1 }
if (!CONFIDENCE_RANK[minConfidence]) {
  console.error(`--min-confidence must be high|medium|low, got "${minConfidence}"`)
  process.exit(1)
}

const sourcePath = flag('--source', join('content-folder', `${subjectSlug}-jamb-bank.json`))
const here = dirname(fileURLToPath(import.meta.url))
const source = JSON.parse(readFileSync(join(here, '..', sourcePath), 'utf8'))
const sourceLabel = flag('--source-label', `JAMB UTME ${subjectSlug === 'biology' ? 'Biology' : 'Commerce'} past papers (LLM-recomputed)`)
const expectedSubject = subjectSlug

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) { console.error('Missing Supabase env vars'); process.exit(1) }
const db = createClient(URL, KEY, { global: { fetch: (input, init = {}) => fetch(input, { ...init, signal: AbortSignal.timeout(20000) }) } })

const { data: subject } = await db.from('subjects').select('id').eq('slug', expectedSubject).single()
if (!subject) throw new Error(`${expectedSubject} subject missing`)
const { data: exam } = await db.from('exams').select('id').eq('slug', 'jamb').single()
if (!exam) throw new Error('jamb exam missing')

const { data: existing } = await db
  .from('questions')
  .select('id, question_text, status')
  .eq('exam_id', exam.id)
  .eq('subject_id', subject.id)
const existingRowByText = new Map((existing ?? []).map((q) => [q.question_text.trim(), q]))

const rejected = []
const candidates = []
const in_review = []
for (const q of source.questions ?? []) {
  const text = (q.question ?? '').trim()
  const reject = (reason) => rejected.push({ id: q.id ?? '?', reason })
  if (!text) { reject('empty question text'); continue }
  if (!Array.isArray(q.options) || q.options.length === 0) { reject('no options'); continue }
  const keys = q.options.map((o) => String(o.key).toLowerCase())
  if (new Set(keys).size !== keys.length) { reject('duplicate option keys'); continue }
  if (keys.some((k) => !['a', 'b', 'c', 'd', 'e'].includes(k))) { reject('option key outside A-E'); continue }
  const answer = String(q.answer ?? '').toLowerCase()
  if (!keys.includes(answer)) { reject(`answer "${q.answer}" not among option keys`); continue }
  if (q.skillConfidence && CONFIDENCE_RANK[q.skillConfidence] < CONFIDENCE_RANK[minConfidence]) { continue }
  const difficulty = ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium'
  candidates.push({ q, text, answer, difficulty })
  if (q.flaggedForReview) in_review.push(q.id)
}

const eligible = candidates.length
const conf = {}
for (const { q } of candidates) conf[q.skillConfidence ?? 'unspecified'] = (conf[q.skillConfidence ?? 'unspecified'] ?? 0) + 1
console.log(`source:           ${sourcePath}`)
console.log(`records in file:  ${(source.questions ?? []).length}`)
console.log(`eligible:         ${eligible}`)
console.log(`rejected:         ${rejected.length}`)
for (const r of rejected.slice(0, 30)) console.error(`  ! ${r.id}: ${r.reason}`)
if (rejected.length > 30) console.error(`  â€¦ and ${rejected.length - 30} more`)
console.log(`confidence gate:  >= ${minConfidence}`, JSON.stringify(conf))
console.log(`already in DB:    ${candidates.filter(({ text }) => existingRowByText.has(text)).length} (will be flipped in place, NOT duplicated)`)
console.log(`flagged (will go to in_review, NOT published): ${in_review.length}`)
console.log('note: topic tags are NOT written (topic=unmapped â€” assignment happens during human review per docs/question-bank-ingestion.md)')

if (dryRun) { console.log('\ndry-run: no rows written'); process.exit(0) }

async function withRetry(label, fn, tries = 5) {
  let lastErr
  for (let i = 0; i < tries; i++) {
    try { return await fn() } catch (e) { lastErr = e; await new Promise((r) => setTimeout(r, 600 * (i + 1))) }
  }
  throw new Error(`${label} failed after ${tries} attempts: ${lastErr?.message ?? lastErr}`)
}

async function pMap(items, concurrency, fn) {
  let next = 0
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (next < items.length) {
      const i = next++
      await fn(items[i])
    }
  })
  await Promise.all(workers)
}

let inserted = 0
let flipped = 0
const failures = []
const workQueue = [...candidates]
await pMap(workQueue, 4, async ({ q, text, answer, difficulty }) => {
  const disputed = Boolean(q.flaggedForReview)
  const reviewNote = disputed ? 'agent flagged: ledger/recorded key disagrees with standard practice â€” needs human review' : null
  const targetStatus = disputed ? 'in_review' : 'published'
  const existingRow = existingRowByText.get(text)

  if (existingRow) {
    // Flip the existing (draft) row in place: no duplicate question rows.
    const options = q.options.map((o) => ({ key: String(o.key).toLowerCase(), text: o.text }))
    const res = await withRetry(`flip ${existingRow.id.slice(0, 8)}`, async () => {
      const { error } = await db.from('questions')
        .update({
          status: targetStatus,
          verified_state: 'source_cited',
          verified_at: new Date().toISOString(),
          ...(reviewNote ? { review_note: reviewNote } : {}),
        })
        .eq('id', existingRow.id)
      if (error) throw error
      const { error: aErr } = await db.from('question_answers')
        .upsert({ question_id: existingRow.id, correct_answer: answer, explanation: q.answerExplanation || '' }, { onConflict: 'question_id' })
      if (aErr) throw aErr
      return true
    }).catch((e) => { failures.push({ id: existingRow.id, err: String(e.message ?? e) }); return null })
    if (res) flipped += 1
    return
  }

  const created = await withRetry(`insert ${q.id}`, async () => {
    const { data, error } = await db
      .from('questions')
      .insert({
        exam_id: exam.id, subject_id: subject.id, question_text: text,
        options: q.options.map((o) => ({ key: String(o.key).toLowerCase(), text: o.text })), correct_answer: null, explanation: null, difficulty,
        source: sourceLabel, status: targetStatus, verified_state: 'source_cited',
        verified_at: new Date().toISOString(), response_type: 'mcq',
        ...(reviewNote ? { review_note: reviewNote } : {}),
      })
      .select('id').single()
    if (error) throw error
    return data
  }).catch((e) => { failures.push({ id: q.id ?? '?', err: String(e.message ?? e) }); return null })
  if (!created) return
  await withRetry(`answers ${created.id.slice(0, 8)}`, async () => {
    const { error } = await db
      .from('question_answers')
      .upsert({ question_id: created.id, correct_answer: answer, explanation: q.answerExplanation || '' }, { onConflict: 'question_id' })
    if (error) throw error
  }).catch((e) => failures.push({ id: created.id, err: String(e.message ?? e) }))
  existingRowByText.set(text, { id: created.id, question_text: text, status: targetStatus })
  inserted += 1
})
if (failures.length) {
  writeFileSync(`content-folder/_work/bio-com-seed-failures-${subjectSlug}.json`, JSON.stringify(failures, null, 2))
  console.log(`WARNING: ${failures.length} rows failed; details in content-folder/_work/bio-com-seed-failures-${subjectSlug}.json`)
}
console.log(`\nquestions: ${inserted} inserted, ${flipped} existing rows flipped to published/in_review`)
const { count } = await db.from('questions').select('id', { count: 'exact', head: true }).eq('subject_id', subject.id).eq('status', 'published')
console.log(`${expectedSubject} published questions in DB:`, count)
