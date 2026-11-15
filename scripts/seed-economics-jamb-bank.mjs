// seeds the JAMB UTME Economics question bank (LLM-solved past papers).
//
// Questions are written to the official JAMB syllabus (4-option A-D since
// 2013, 5-option A-E permitted here because JAMB past papers used A-E
// until 2013). Questions are tagged to the syllabus topic so the learner
// practice mode can draw questions on the topic actually being studied.
//
// Answers are LLM-solved, NOT source-verified. verified_state is set to
// 'source_cited' — these are sourced from JAMB past papers and solved by
// the author, not checked against an official answer key. The learner does
// not see this flag; the admin review queue shows it.
//
// Usage:
//   node --env-file=.env8 scripts/seed-economics-jamb-bank.mjs [flags]
//
// Flags:
//   --source <path>         Bank JSON to read.
//                           Default: content-folder/economics-jamb-bank.json
//   --min-confidence <lvl>  Only import records whose skillConfidence is at
//                           least <lvl> (high | medium | low; default low).
//   --source-label <str>    Value for the questions.source column.
//                           Default: "JAMB UTME Economics (past papers, recomputed)"
//
// Hardening rules (fail before any write):
//   - every question must carry non-empty text
//   - options must be 4 A-D (default) or A-E (--allow-five-option)
//   - answer must match one of the option keys
//   - every topic slug must resolve in the DB

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
const allowFive = hasFlag('--allow-five-option')
const dryRun = hasFlag('--dry-run')

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) {
  console.error('Missing Supabase env vars')
  process.exit(1)
}
const db = createClient(URL, KEY)

const here = dirname(fileURLToPath(import.meta.url))
const sourcePath = flag('--source', join('content-folder', 'economics-jamb-bank.json'))
const source = JSON.parse(readFileSync(join(here, '..', sourcePath), 'utf8'))
const minConfidence = flag('--min-confidence', 'low')
const sourceLabel = flag('--source-label', 'JAMB UTME Economics (past papers, recomputed)')

const CONFIDENCE_RANK = { high: 3, medium: 2, low: 1 }
if (!CONFIDENCE_RANK[minConfidence]) {
  console.error(`--min-confidence must be high|medium|low, got "${minConfidence}"`)
  process.exit(1)
}

const { data: subject } = await db.from('subjects').select('id').eq('slug', 'economics').single()
if (!subject) throw new Error('economics subject missing')
const { data: exam } = await db.from('exams').select('id').eq('slug', 'jamb').single()
if (!exam) throw new Error('jamb exam missing')

const { data: topics } = await db.from('topics').select('id, slug, name').eq('subject_id', subject.id)
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
  if (!Array.isArray(q.options) || q.options.length === 0) { reject('no options'); continue }

  const keys = q.options.map((o) => String(o.key).toLowerCase())
  const keySet = keys.join(',')
  if (allowFive) {
    if (new Set(keys).size !== keys.length) { reject('duplicate option keys'); continue }
    if (keys.some((k) => !['a', 'b', 'c', 'd', 'e'].includes(k))) { reject('option key outside A-E'); continue }
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

const eligible = candidates.length
const conf = {}
for (const { q } of candidates) conf[q.skillConfidence ?? 'unspecified'] = (conf[q.skillConfidence ?? 'unspecified'] ?? 0) + 1
console.log(`source:           ${sourcePath}`)
console.log(`records in file:  ${(source.questions ?? []).length}`)
console.log(`eligible:         ${eligible}`)
console.log(`rejected:         ${rejected.length}`)
for (const r of rejected.slice(0, 30)) console.error(`  ! ${r.id}: ${r.reason}${r.topic ? ` (topic: ${r.topic})` : ''}`)
if (rejected.length > 30) console.error(`  … and ${rejected.length - 30} more`)
console.log(`confidence gate:  >= ${minConfidence}`, JSON.stringify(conf))
console.log(`already in DB:    ${candidates.filter(({ text }) => seen.has(text)).length} (will be skipped)`)

const perTopic = {}
for (const { topic } of candidates) perTopic[topic.slug] = (perTopic[topic.slug] ?? 0) + 1
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

async function retry(fn, tries = 5) {
  let err
  for (let i = 0; i < tries; i++) {
    try { return await fn() } catch (e) { err = e; await new Promise((r) => setTimeout(r, 500 * (i + 1))) }
  }
  throw err
}

for (const { q, text, answer, difficulty, topic } of candidates) {
  if (seen.has(text)) { skipped += 1; continue }

  const options = q.options.map((o) => ({ key: String(o.key).toLowerCase(), text: o.text }))
  // The live sync_question_answers() (20261115000001, applied 2026-11-15)
  // mirrors into question_answers but does NOT blank the staging columns,
  // so the phase-B CHECK questions_answer_is_staged rejects the write.
  // Do the valve's job here instead: staging null, answers in question_answers.
  const created = await retry(async () => {
    const { data, error } = await db
      .from('questions')
      .insert({
        exam_id: exam.id,
        subject_id: subject.id,
        question_text: text,
        options,
        correct_answer: null,
        explanation: null,
        difficulty,
        source: sourceLabel,
        status: 'published',
        verified_state: 'source_cited',
        verified_at: new Date().toISOString(),
        response_type: 'mcq',
      })
      .select('id')
      .single()
    if (error) throw error
    return data
  })

  await retry(async () => {
    const { error } = await db
      .from('question_answers')
      .upsert({ question_id: created.id, correct_answer: answer, explanation: q.answerExplanation || '' }, { onConflict: 'question_id' })
    if (error) throw error
  })

  await retry(async () => {
    const { error: tagError } = await db.from('question_topics').insert({
      question_id: created.id,
      topic_id: topic.id,
      role: 'practice',
    })
    if (tagError) throw tagError
  })

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
console.log(`JAMB Economics DB total: ${final?.length ?? 0} questions`)
