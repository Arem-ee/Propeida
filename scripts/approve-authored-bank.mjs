// Approves and publishes an authored question bank after human review.
//
// This is the second half of scripts/seed-authored-bank.mjs: the seeder
// creates draft/unverified rows, a human reads the review sheet, then this
// script stamps human_verified, writes the append-only review trail, and
// publishes. It refuses to run without --approve so a mistyped command cannot
// publish unreviewed content.
//
// Pre-flight protects the claim "checked by hand":
//   - every bank question must exist in the live draft bank, matched by exact
//     text (drift or a missing row aborts the whole run);
//   - every row must still be draft/unverified;
//   - the stored answer key must equal the bank's key.
//
// Usage:
//   node --env-file=.env scripts/approve-authored-bank.mjs \
//     content-folder/maths-jamb-bank.json --approve \
//     --reviewer arem.dehv@gmail.com \
//     --note "Owner approved after reviewing the key/explanation sheet."

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const args = process.argv.slice(2)

function flag(name) {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}
const approved = args.includes('--approve')
const positional = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'))
const bankArg = positional[0]
const reviewerEmail = flag('reviewer') ?? 'arem.dehv@gmail.com'
const note =
  flag('note') ??
  'Owner approved after reviewing the answer key and explanation for every item.'

if (!bankArg) {
  console.error('Usage: approve-authored-bank.mjs <bank.json> --approve [--reviewer email] [--note text]')
  process.exit(1)
}
if (!approved) {
  console.error('Refusing to publish without --approve (human sign-off is required).')
  process.exit(1)
}

const bankPath = resolve(root, bankArg)
const source = JSON.parse(readFileSync(bankPath, 'utf8'))
if (!source.subject) throw new Error('bank is missing "subject"')
if (!Array.isArray(source.questions) || source.questions.length === 0) {
  throw new Error('bank is missing a non-empty "questions" array')
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) {
  console.error('Missing Supabase env vars')
  process.exit(1)
}
const db = createClient(URL, KEY)

const { data: subject } = await db
  .from('subjects')
  .select('id, name')
  .eq('slug', source.subject)
  .single()
if (!subject) throw new Error(`subject "${source.subject}" not found`)

const { data: exam } = await db
  .from('exams')
  .select('id')
  .eq('slug', source.exam ?? 'jamb')
  .single()
if (!exam) throw new Error(`exam "${source.exam ?? 'jamb'}" not found`)

const { data: userList, error: usersError } = await db.auth.admin.listUsers({
  page: 1,
  perPage: 1000,
})
if (usersError) throw new Error(`load users: ${usersError.message}`)
const reviewerUser = userList.users.find((u) => u.email === reviewerEmail)
if (!reviewerUser) throw new Error(`reviewer "${reviewerEmail}" not found`)

const { data: reviewer, error: reviewerError } = await db
  .from('profiles')
  .select('id, is_admin')
  .eq('id', reviewerUser.id)
  .single()
if (reviewerError || !reviewer) throw new Error(`profile for "${reviewerEmail}" not found`)
if (!reviewer.is_admin) throw new Error(`reviewer "${reviewerEmail}" is not an admin`)

const texts = source.questions.map((q) => q.question.trim())
const { data: rows, error: rowsError } = await db
  .from('questions')
  .select('id, question_text, status, verified_state')
  .eq('exam_id', exam.id)
  .eq('subject_id', subject.id)
  .in('question_text', texts)
if (rowsError) throw new Error(`load bank rows: ${rowsError.message}`)

const byText = new Map((rows ?? []).map((r) => [r.question_text.trim(), r]))
const missing = texts.filter((t) => !byText.has(t))
if (missing.length > 0) {
  console.error(`Pre-flight failed: ${missing.length} bank question(s) are not in the database.`)
  for (const m of missing.slice(0, 10)) console.error(`  - ${m.slice(0, 90)}`)
  console.error('Run seed-authored-bank.mjs first; nothing was published.')
  process.exit(1)
}

const wrongState = []
for (const text of texts) {
  const row = byText.get(text)
  if (row.status !== 'draft' || row.verified_state !== 'unverified') {
    wrongState.push(`${row.id} (${row.status}/${row.verified_state}) ${text.slice(0, 60)}`)
  }
}
if (wrongState.length > 0) {
  console.error('Pre-flight failed: some rows are not draft/unverified.')
  for (const w of wrongState) console.error(`  - ${w}`)
  console.error('Nothing was published.')
  process.exit(1)
}

// Answer-key drift check: the key about to go live must be the reviewed key.
const ids = texts.map((t) => byText.get(t).id)
const { data: answers, error: answerError } = await db
  .from('question_answers')
  .select('question_id, correct_answer')
  .in('question_id', ids)
if (answerError) throw new Error(`load answers: ${answerError.message}`)
const answerById = new Map((answers ?? []).map((a) => [a.question_id, a.correct_answer]))
const keyMismatch = source.questions.filter((q) => {
  const row = byText.get(q.question.trim())
  return answerById.get(row.id) !== q.answer
})
if (keyMismatch.length > 0) {
  console.error('Pre-flight failed: stored answer keys differ from the reviewed bank.')
  for (const q of keyMismatch) console.error(`  - ${q.question.slice(0, 80)}`)
  console.error('Nothing was published.')
  process.exit(1)
}

console.log(
  `Pre-flight ok: ${ids.length} draft(s), all unverified, keys match ${bankPath}\n`,
)

const now = new Date().toISOString()
let published = 0

for (const text of texts) {
  const row = byText.get(text)
  const { error: updateError } = await db
    .from('questions')
    .update({
      status: 'published',
      verified_state: 'human_verified',
      verified_by: reviewer.id,
      verified_at: now,
      review_note: note,
    })
    .eq('id', row.id)
  if (updateError) throw new Error(`publish ${row.id}: ${updateError.message}`)

  const { error: reviewError } = await db.from('question_reviews').insert({
    question_id: row.id,
    reviewer: reviewer.id,
    verified_state: 'human_verified',
    note,
  })
  if (reviewError) throw new Error(`review trail ${row.id}: ${reviewError.message}`)

  published += 1
}

const { data: after } = await db
  .from('questions')
  .select('status, verified_state')
  .in('id', ids)
const pub = (after ?? []).filter((q) => q.status === 'published').length
const verified = (after ?? []).filter((q) => q.verified_state === 'human_verified').length

console.log(`published: ${published}`)
console.log(`verified:  ${verified}`)
console.log(`now live:  ${pub}/${ids.length}`)
console.log(`reviewer:  ${reviewerEmail}`)
console.log(`note:      ${note}`)
