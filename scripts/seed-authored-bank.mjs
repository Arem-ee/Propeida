// Seeds an authored question bank into the database as draft/unverified.
//
// Unlike scripts/jamb-ingest.mjs (which imports parsed past-question dumps),
// this seeder is for banks we write ourselves: it validates every row before
// insert and never publishes. A human reviews the bank first, then marks the
// items human_verified and publishes them through the admin review queue.
//
// The answer key goes into questions.correct_answer; the phase-B trigger moves
// it into question_answers and nulls the public column.
//
// Idempotent: a question with the same text in the same subject/exam is not
// inserted twice.
//
// Usage:
//   node --env-file=.env scripts/seed-authored-bank.mjs content-folder/maths-jamb-bank.json
//   node --env-file=.env scripts/seed-authored-bank.mjs --bank content-folder/maths-jamb-bank.json

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

function bankPathFromArgs() {
  const args = process.argv.slice(2)
  const flag = args.findIndex((a) => a === '--bank')
  const raw = flag >= 0 ? args[flag + 1] : args[0]
  if (!raw) {
    console.error('Usage: node --env-file=.env scripts/seed-authored-bank.mjs <bank.json>')
    process.exit(1)
  }
  return resolve(root, raw)
}

const bankPath = bankPathFromArgs()
const source = JSON.parse(readFileSync(bankPath, 'utf8'))

if (!source.subject) throw new Error('bank is missing "subject"')
if (!Array.isArray(source.questions) || source.questions.length === 0) {
  throw new Error('bank is missing a non-empty "questions" array')
}

// --- Validate before touching the database --------------------------------

const KEY_ORDER = ['a', 'b', 'c', 'd']
const seenText = new Set()
const problems = []

source.questions.forEach((q, i) => {
  const label = `question ${i + 1} (${q.topic ?? 'no topic'})`
  const text = (q.question ?? '').trim()
  const options = q.options ?? []
  const keys = options.map((o) => o.key)

  if (!q.topic) problems.push(`${label}: missing topic`)
  if (!text) problems.push(`${label}: empty question text`)
  if (options.length !== 4) problems.push(`${label}: ${options.length} options, expected 4`)
  if (keys.join('') !== KEY_ORDER.join('')) {
    problems.push(`${label}: option keys "${keys.join('')}", expected "${KEY_ORDER.join('')}"`)
  }
  if (options.some((o) => !(o.text ?? '').trim())) {
    problems.push(`${label}: empty option text`)
  }
  if (!KEY_ORDER.includes(q.answer)) problems.push(`${label}: invalid answer "${q.answer}"`)
  if (!(q.explanation ?? '').trim()) problems.push(`${label}: empty explanation`)
  if (seenText.has(text)) problems.push(`${label}: duplicate question text`)
  seenText.add(text)
})

if (problems.length > 0) {
  console.error(`Bank failed validation (${problems.length} problem(s)):`)
  for (const p of problems) console.error(`  - ${p}`)
  process.exit(1)
}

console.log(`Validated ${source.questions.length} questions in ${bankPath}\n`)

// --- Seed -----------------------------------------------------------------

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) {
  console.error('Missing Supabase env vars')
  process.exit(1)
}
const db = createClient(URL, KEY)

const { data: subject, error: subjectError } = await db
  .from('subjects')
  .select('id, name')
  .eq('slug', source.subject)
  .single()
if (subjectError || !subject) {
  throw new Error(`subject "${source.subject}" not found`)
}

const { data: exam, error: examError } = await db
  .from('exams')
  .select('id')
  .eq('slug', source.exam ?? 'jamb')
  .single()
if (examError || !exam) {
  throw new Error(`exam "${source.exam ?? 'jamb'}" not found`)
}

const { data: topics, error: topicsError } = await db
  .from('topics')
  .select('id, slug')
  .eq('subject_id', subject.id)
if (topicsError) throw new Error(`load topics: ${topicsError.message}`)
const topicBySlug = new Map((topics ?? []).map((t) => [t.slug, t]))

const { data: existing, error: existingError } = await db
  .from('questions')
  .select('question_text')
  .eq('exam_id', exam.id)
  .eq('subject_id', subject.id)
if (existingError) throw new Error(`load existing questions: ${existingError.message}`)
const alreadyThere = new Set((existing ?? []).map((q) => q.question_text.trim()))

let inserted = 0
let skipped = 0
let tagged = 0
const perTopic = {}

for (const q of source.questions) {
  const text = q.question.trim()
  const topic = topicBySlug.get(q.topic)
  if (!topic) {
    throw new Error(`unknown topic "${q.topic}" — seed the curriculum first`)
  }
  if (alreadyThere.has(text)) {
    skipped += 1
    continue
  }

  const { data: created, error } = await db
    .from('questions')
    .insert({
      exam_id: exam.id,
      subject_id: subject.id,
      question_text: text,
      options: q.options.map((o) => ({ key: o.key, text: o.text.trim() })),
      correct_answer: q.answer,
      explanation: q.explanation.trim(),
      difficulty: q.difficulty ?? 'medium',
      source: source.source ?? 'authored',
      status: 'draft',
      verified_state: 'unverified',
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

  alreadyThere.add(text)
  inserted += 1
  tagged += 1
  perTopic[q.topic] = (perTopic[q.topic] ?? 0) + 1
}

console.log(`inserted: ${inserted} draft/unverified question(s)`)
console.log(`skipped:  ${skipped} already present`)
console.log(`tags:     ${tagged} topic link(s)\n`)
for (const [slug, n] of Object.entries(perTopic)) {
  console.log(`  ${String(n).padStart(3)}  ${slug}`)
}

const { data: final } = await db
  .from('questions')
  .select('id, status, verified_state')
  .eq('exam_id', exam.id)
  .eq('subject_id', subject.id)

console.log(
  `\n${subject.name} JAMB bank now: ${final?.length ?? 0} total, ` +
    `${(final ?? []).filter((q) => q.status === 'published').length} published, ` +
    `${(final ?? []).filter((q) => q.status === 'draft').length} draft`,
)
