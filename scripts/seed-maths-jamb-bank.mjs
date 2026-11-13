// Seeds the JAMB UTME Mathematics question bank.
//
// Same contract as seed-english-jamb-bank.mjs: questions are tagged to the
// curriculum topic each one tests and the answer key lives in
// questions.correct_answer (mirrored by trigger into question_answers).
//
// Idempotent: a question with the same text is not inserted twice.
//
// Usage:
//   node --env-file=.env scripts/seed-maths-jamb-bank.mjs [flags]
//
// Flags:
//   --source <path>   Bank JSON to read.
//                     Default: content-folder/maths-jamb-bank.json
//   --source-label <str>  Value for the questions.source column.
//                     Default: "JAMB UTME syllabus (authored)".
//   --dry-run         Validate and report against the DB without writing.
//
// Hardening rules (fail before any write): the extension passes
// scripts/check-maths-jamb-bank-extension.mjs first; every question must be
// 4 options A-D, every topic slug must resolve in the DB.
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
const sourcePath = flag('--source', join('content-folder', 'maths-jamb-bank.json'))
const source = JSON.parse(readFileSync(join(here, '..', sourcePath), 'utf8'))
const dryRun = hasFlag('--dry-run')
const sourceLabel = flag('--source-label', 'JAMB UTME syllabus (authored)')

const { data: subject } = await db.from('subjects').select('id').eq('slug', 'mathematics').single()
if (!subject) throw new Error('mathematics subject missing')
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

const defects = []
const candidates = []
for (const [i, q] of (source.questions ?? []).entries()) {
  const at = `questions[${i}] (${q.topic})`
  const fail = (msg) => defects.push(`${at}: ${msg}`)

  const text = (q.question ?? '').trim()
  if (!text) fail('empty question text')
  if (!q.explanation || !q.explanation.trim()) fail('empty explanation')

  const keys = (q.options ?? []).map((o) => String(o.key).toLowerCase())
  if (keys.length !== 4 || keys.join(',') !== 'a,b,c,d') fail(`option keys not exactly a,b,c,d (got ${keys.join(',') || 'none'})`)
  const answer = String(q.answer ?? '').toLowerCase()
  if (!keys.includes(answer)) fail(`answer "${q.answer}" not among option keys`)
  if (!['easy', 'medium', 'hard'].includes(q.difficulty)) fail(`bad difficulty "${q.difficulty}"`)

  const topic = topicBySlug.get(q.topic)
  if (!topic) fail(`unknown topic slug "${q.topic}"`)

  if (defects.length === 0 || topic) {
    candidates.push({ q, text, answer, topic })
  }
}

const fatal = defects.filter((d) => d.includes('unknown topic'))
if (fatal.length > 0) {
  console.error(`\nABORTING — ${fatal.length} record(s) reference topic slugs not in the DB:`)
  for (const d of fatal.slice(0, 20)) console.error(`  ${d}`)
  process.exit(1)
}

if (defects.length > 0) {
  console.error(`\n${defects.length} defect(s) found — refusing to write:`)
  for (const d of defects.slice(0, 30)) console.error(`  ! ${d}`)
  process.exit(1)
}

const perTopic = {}
for (const { topic } of candidates) perTopic[topic.slug] = (perTopic[topic.slug] ?? 0) + 1

console.log(`source:           ${sourcePath}`)
console.log(`records in file:  ${(source.questions ?? []).length}`)
console.log(`eligible:         ${candidates.length}`)
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

for (const { q, text, answer, topic } of candidates) {
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
      difficulty: q.difficulty,
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
console.log(`JAMB Mathematics bank: ${final?.length ?? 0} questions total`)
