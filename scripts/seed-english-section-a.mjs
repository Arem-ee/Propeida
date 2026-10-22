// Seeds the Use of English Section A lessons (JAMB: Comprehension and Summary).
//
// Writes one lesson per syllabus topic in content-folder/english-section-a.json:
// text sections, exam tip, worked example, guided question, an
// evidence-tapped passage and a reflection.
//
// Evidence offsets are COMPUTED from substrings, never hand-counted: each
// question declares evidenceStrings[], resolved to {paragraph,start,end} by
// indexOf at seed time. The script aborts if any substring is missing, so a
// passage edit can never leave a question pointing at the wrong sentence.
//
// Idempotent: a lesson that already has blocks is left alone.
//
// Usage: node --env-file=.env scripts/seed-english-section-a.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) {
  console.error('Missing Supabase env vars')
  process.exit(1)
}
const db = createClient(URL, KEY)

const here = dirname(fileURLToPath(import.meta.url))
const source = JSON.parse(
  readFileSync(join(here, '..', 'content-folder', 'english-section-a.json'), 'utf8'),
)

/** Resolve a declared substring to character offsets in its paragraph. */
function span(paragraphs, paragraph, substring) {
  const text = paragraphs[paragraph]
  if (text === undefined) throw new Error(`No paragraph ${paragraph} in passage`)
  const start = text.indexOf(substring)
  if (start === -1) {
    throw new Error(`Evidence substring not found in paragraph ${paragraph}: "${substring}"`)
  }
  return { paragraph, start, end: start + substring.length }
}

/** Turn a declared block into the shape the app stores. */
function buildBlock(block) {
  if (block.type === 'passage') {
    const c = block.content
    const questions = c.questions.map((q) => ({
      question: q.question,
      skill: q.skill,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation,
      evidence: q.evidenceStrings.map((e) => span(c.paragraphs, e.paragraph, e.text)),
    }))
    return { block_type: 'passage', content: { ...c, questions } }
  }
  return { block_type: block.type, content: block.content }
}

const { data: subject, error: subjectError } = await db
  .from('subjects')
  .select('id')
  .eq('slug', 'english')
  .single()
if (subjectError || !subject) throw new Error('english subject missing')

let created = 0
let blocksWritten = 0
let questions = 0

for (const lesson of source.lessons) {
  const { data: row, error } = await db
    .from('lessons')
    .select('id, status')
    .eq('subject_id', subject.id)
    .eq('slug', lesson.slug)
    .single()
  if (error || !row) throw new Error(`lesson missing: ${lesson.slug} (seed the curriculum first)`)

  const { count: existing } = await db
    .from('lesson_blocks')
    .select('*', { count: 'exact', head: true })
    .eq('lesson_id', row.id)
  if ((existing ?? 0) > 0) {
    console.log(`= ${lesson.slug} (${existing} blocks, untouched)`)
    continue
  }

  const blocks = lesson.blocks.map(buildBlock)
  const { error: insertError } = await db
    .from('lesson_blocks')
    .insert(blocks.map((b, i) => ({ lesson_id: row.id, position: i, ...b })))
  if (insertError) throw new Error(`insert blocks ${lesson.slug}: ${insertError.message}`)

  blocksWritten += blocks.length
  created += 1
  questions += lesson.blocks
    .filter((b) => b.type === 'passage')
    .reduce((n, b) => n + b.content.questions.length, 0)

  console.log(`+ ${lesson.slug} (${blocks.length} blocks)`)
}

// Publish: the content is complete and checked, so these lessons are ready
// for learners. The curriculum seed created them as drafts.
for (const lesson of source.lessons) {
  const { data, error } = await db
    .from('lessons')
    .update({ status: 'published', reviewer: 'curriculum-phase-2' })
    .eq('subject_id', subject.id)
    .eq('slug', lesson.slug)
    .select('slug, status')
    .single()
  if (error) throw new Error(`publish ${lesson.slug}: ${error.message}`)
  console.log(`✓ published ${data.slug}`)
}

console.log(
  `\ndone: ${created} lessons written, ${blocksWritten} blocks, ${questions} passage questions`,
)
