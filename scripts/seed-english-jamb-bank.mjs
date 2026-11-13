// Seeds the JAMB UTME Use of English question bank.
//
// Questions are written to the official JAMB syllabus (4 options, A-D, as
// JAMB has used since 2013) and tagged to the curriculum topic each one
// tests, so the lesson micro-check can draw a question about the topic the
// learner is actually on.
//
// The answer key goes into questions.correct_answer; the sync trigger
// mirrors it into question_answers, which the learner role cannot read.
//
// Idempotent: a question with the same text is not inserted twice.
//
// Usage:
//   node --env-file=.env scripts/seed-english-jamb-bank.mjs [flags]
//
// Flags:
//   --source <path>         Bank JSON to read.
//                           Default: content-folder/english-jamb-bank.json
//   --min-confidence <lvl>  Only import records whose skillConfidence is at
//                           least <lvl> (high | medium | low; default low).
//                           Records with no skillConfidence field (the
//                           published bank) always pass.
//   --allow-five-option     Accept 5-option A-E records (pre-2013 format).
//                           Default: reject them. JAMB format since 2013 is
//                           4 options A-D; pre-2013 normalisation is not
//                           attempted without key evidence.
//   --source-label <str>    Value for the questions.source column.
//                           Default: "JAMB UTME syllabus (authored)".
//   --dry-run               Validate and report against the DB without
//                           writing anything.
//
// Hardening rules (fail before any write):
//   - every question must carry non-empty text and explanation;
//   - options must be 4 A-D (unless --allow-five-option), unique keys;
//   - answer must match one of the option keys;
//   - difficulty must be easy | medium | hard (defaults to medium);
//   - every topic slug must resolve in the DB — unmapped slugs abort the
//     whole run (they indicate curriculum drift, not bad questions).

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const args = process.argv.slice(2)
function flag(name, fallback = undefined) {
  const i = args.indexOf(name)
  if (i === -1) return fallback
  return args[i + 1]
}
const hasFlag = (name) => args.includes(name)

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) {
  console.error('Missing Supabase env vars')
  process.exit(1)
}
const db = createClient(URL, KEY)

const here = dirname(fileURLToPath(import.meta.url))
const sourcePath = flag('--source', join('content-folder', 'english-jamb-bank.json'))
const source = JSON.parse(readFileSync(join(here, '..', sourcePath), 'utf8'))
const minConfidence = flag('--min-confidence', 'low')
const allowFiveOption = hasFlag('--allow-five-option')
const dryRun = hasFlag('--dry-run')
const sourceLabel = flag('--source-label', 'JAMB UTME syllabus (authored)')

const CONFIDENCE_RANK = { high: 3, medium: 2, low: 1 }
if (!CONFIDENCE_RANK[minConfidence]) {
  console.error(`--min-confidence must be high|medium|low, got "${minConfidence}"`)
  process.exit(1)
}

const { data: subject } = await db.from('subjects').select('id').eq('slug', 'english').single()
if (!subject) throw new Error('english subject missing')
const { data: exam } = await db.from('exams').select('id').eq('slug', 'jamb').single()
if (!exam) throw new Error('jamb exam missing')

const { data: topics } = await db
  .from('topics')
  .select('id, slug, name')
  .eq('subject_id', subject.id)
const topicBySlug = new Map((topics ?? []).map((t) => [t.slug, t]))

const { data: existing } = await db
  .from('questions')
  .select('question_text')
  .eq('exam_id', exam.id)
  .eq('subject_id', subject.id)
const seen = new Set((existing ?? []).map((q) => q.question_text.trim()))

// ---------- validate everything before writing anything ----------

const rejected = []
const candidates = []
for (const q of source.questions ?? []) {
  const text = (q.question ?? '').trim()
  const reject = (reason) => rejected.push({ id: q.id ?? '?', reason, topic: q.topic })

  if (!text) { reject('empty question text'); continue }
  if (!q.explanation || !q.explanation.trim()) { reject('empty explanation'); continue }
  if (!Array.isArray(q.options) || q.options.length === 0) { reject('no options'); continue }

  const keys = q.options.map((o) => String(o.key).toLowerCase())
  const keySet = keys.join(',')
  if (allowFiveOption) {
    if (new Set(keys).size !== keys.length) { reject('duplicate option keys'); continue }
    if (keys.some((k) => !['a', 'b', 'c', 'd', 'e'].includes(k))) { reject('option key outside a-e'); continue }
  } else {
    if (keys.length !== 4 || keySet !== 'a,b,c,d') { reject(`not 4 A-D options (keys: ${keySet})`); continue }
  }

  const answer = String(q.answer ?? '').toLowerCase()
  if (!keys.includes(answer)) { reject(`answer "${q.answer}" not among option keys`); continue }

  if (q.skillConfidence && CONFIDENCE_RANK[q.skillConfidence] < CONFIDENCE_RANK[minConfidence]) {
    continue // filtered out by confidence gate — not a defect
  }

  const difficulty = ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium'
  const topic = topicBySlug.get(q.topic)
  if (!topic) { reject(`unknown topic slug "${q.topic}"`); continue }

  candidates.push({ q, text, answer, difficulty, topic })
}

const unmapped = rejected.filter((r) => r.reason.startsWith('unknown topic'))
if (unmapped.length > 0) {
  console.error(`\nABORTING — ${unmapped.length} record(s) reference topic slugs not in the DB:`)
  for (const r of unmapped.slice(0, 20)) console.error(`  ${r.id}: ${r.reason}`)
  process.exit(1)
}

const defective = rejected.length
const perTopic = {}
const perConfidence = {}
for (const { q, topic } of candidates) {
  perTopic[topic.slug] = (perTopic[topic.slug] ?? 0) + 1
  const c = q.skillConfidence ?? 'unspecified'
  perConfidence[c] = (perConfidence[c] ?? 0) + 1
}

console.log(`source:           ${sourcePath}`)
console.log(`records in file:  ${(source.questions ?? []).length}`)
console.log(`eligible:         ${candidates.length}`)
console.log(`rejected:         ${defective}`)
for (const r of rejected.slice(0, 30)) console.error(`  ! ${r.id}: ${r.reason}${r.topic ? ` (topic: ${r.topic})` : ''}`)
if (rejected.length > 30) console.error(`  … and ${rejected.length - 30} more`)
console.log(`confidence gate:  >= ${minConfidence}`, JSON.stringify(perConfidence))
console.log(`five-option:      ${allowFiveOption ? 'allowed' : 'rejected (default)'}`)
console.log(`already in DB:    ${candidates.filter(({ text }) => seen.has(text)).length} (will be skipped)`)
console.log('\nper topic (eligible):')
for (const [slug, n] of Object.entries(perTopic).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(5)}  ${slug}`)
}

if (dryRun) {
  console.log('\ndry-run: no rows written')
  process.exit(0)
}

// ---------- write ----------

let inserted = 0
let skipped = 0
let tagged = 0

for (const { q, text, answer, difficulty, topic } of candidates) {
  if (seen.has(text)) {
    skipped += 1
    continue
  }

  const options = q.options.map((o) => ({ key: String(o.key).toLowerCase(), text: o.text }))
  const { data: created, error } = await db
    .from('questions')
    .insert({
      exam_id: exam.id,
      subject_id: subject.id,
      question_text: text,
      options,
      correct_answer: answer,
      explanation: q.explanation,
      difficulty,
      source: sourceLabel,
      status: 'published',
      verified_state: 'human_verified',
      verified_at: new Date().toISOString(),
      response_type: 'mcq',
    })
    .select('id')
    .single()
  if (error) throw new Error(`insert "${text.slice(0, 50)}": ${error.message}`)

  const { error: tagError } = await db.from('question_topics').insert({
    question_id: created.id,
    topic_id: topic.id,
    role: 'practice',
  })
  if (tagError) throw new Error(`tag "${text.slice(0, 50)}": ${tagError.message}`)

  seen.add(text)
  inserted += 1
  tagged += 1
}

console.log(`\nquestions: ${inserted} inserted, ${skipped} already present`)
console.log(`topic tags: ${tagged} written\n`)

const { data: final } = await db
  .from('questions')
  .select('id, question_text')
  .eq('exam_id', exam.id)
  .eq('subject_id', subject.id)
const { data: finalTags } = await db
  .from('question_topics')
  .select('topic_id')
  .in('question_id', (final ?? []).map((q) => q.id))

console.log(`JAMB English bank: ${final?.length ?? 0} questions, ${finalTags?.length ?? 0} tagged`)
const counts = {}
for (const t of finalTags ?? []) counts[t.topic_id] = (counts[t.topic_id] ?? 0) + 1
const { data: topicList } = await db.from('topics').select('id, slug, name').eq('subject_id', subject.id)
for (const t of topicList ?? []) {
  const n = counts[t.id] ?? 0
  console.log(`  ${String(n).padStart(3)}  ${t.name}`)
}
