// Ingest stage-3 solutions as drafts. Answers AND explanations are
// AI-supplied: every row enters unverified with an AI-solved review note,
// so the human review queue must verify both before anything publishes.
// Runs the same strict gate (fused rows never enter, even solved).
// Usage: node --env-file=.env scripts/stage3-ingest.mjs <solutions.json> <subject-slug>

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) {
  console.error('Missing Supabase env vars')
  process.exit(1)
}
const db = createClient(URL, KEY)

const [, , jsonPath, subjectSlug] = process.argv
const rows = JSON.parse(readFileSync(jsonPath, 'utf8'))

const { data: exam } = await db.from('exams').select('id').eq('slug', 'jamb').single()
const { data: subject } = await db.from('subjects').select('id').eq('slug', subjectSlug).single()
if (!exam || !subject) throw new Error('exam/subject missing')

const normOpt = (o) => (o ?? '').trim()
let inserted = 0
let rejected = 0
let skippedDup = 0

for (const r of rows) {
  const keys = ['A', 'B', 'C', 'D'].every((k) => normOpt(r.options[k]))
  const fused =
    /(^|\s)\d{1,3}\.\s/.test(r.text) ||
    ['A', 'B', 'C', 'D'].some((k) => /(^|\s)\d{1,3}\.\s/.test(normOpt(r.options[k]))) ||
    ['A', 'B', 'C', 'D'].some((k) => /\.\s+[A-Z][a-z]/.test(normOpt(r.options[k])))
  if (!keys || fused || !r.answer || !r.explanation) {
    rejected++
    continue
  }
  const options = ['A', 'B', 'C', 'D', 'E']
    .filter((k) => normOpt(r.options[k]))
    .map((k) => ({ key: k.toLowerCase(), text: normOpt(r.options[k]) }))

  const { data: dup } = await db
    .from('questions')
    .select('id')
    .eq('exam_id', exam.id)
    .eq('subject_id', subject.id)
    .eq('question_text', r.text)
    .limit(1)
  if (dup && dup.length > 0) {
    skippedDup++
    continue
  }

  const { error } = await db.from('questions').insert({
    exam_id: exam.id,
    subject_id: subject.id,
    question_text: r.text,
    options,
    correct_answer: r.answer.toLowerCase(),
    explanation: r.explanation,
    difficulty: 'medium',
    source: `JAMB ${r.year} (${r.source})`,
    status: 'draft',
    verified_state: 'unverified',
    review_note: r.note,
  })
  if (error) throw new Error(`insert failed: ${error.message}`)
  inserted++
}

console.log(`inserted: ${inserted} | rejected: ${rejected} | dups: ${skippedDup}`)
