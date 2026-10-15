// Ingest parsed JAMB JSON into questions as DRAFTS (never published).
// Only rows with 4 options + matched key + no figure need are inserted.
// Auto-flags go into review_note so reviewers know what to check.
// Skips exact-text duplicates already in the bank.
//
// Usage: node --env-file=.env scripts/jamb-ingest.mjs <parsed.json> <subject-slug>

import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync } from 'node:fs'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) {
  console.error('Missing Supabase env vars')
  process.exit(1)
}
const db = createClient(URL, KEY)

const [, , jsonPath, subjectSlug] = process.argv
if (!jsonPath || !subjectSlug) {
  console.error('Usage: jamb-ingest.mjs <parsed.json> <subject-slug>')
  process.exit(1)
}

const rows = JSON.parse(readFileSync(jsonPath, 'utf8'))

const { data: exam } = await db.from('exams').select('id').eq('slug', 'jamb').single()
if (!exam) throw new Error('jamb exam missing')
const { data: subject } = await db.from('subjects').select('id').eq('slug', subjectSlug).single()
if (!subject) throw new Error(`subject missing: ${subjectSlug}`)

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()

// Strict gate: only rows that parse as exactly one question with an
// unambiguous key reach the bank. Fused fragments are rejected, never
// guessed — a wrong key teaches a falsehood. Returns {reject, flags}:
// rejects stay out, flags travel in review_note for the human.
function strictClean(r) {
  const reject = []
  const flags = []
  const prefixMatch = r.text.match(/^(\[Use the data below\]\n.*?\n\[Question\]\n|\[Based on: [^\]]+\]\n)?/s)
  const prefix = prefixMatch ? prefixMatch[1] ?? '' : ''
  const stem = r.text.slice(prefix.length)
  if (/[�]/.test(prefix)) flags.push('context header has unreadable characters — verify set text/data')
  if (/\[Based on: [^\]]*[,;:]$/.test(prefix)) flags.push('set-text binding looks truncated — verify')
  if (stem.length < 25) reject.push('stem too short — likely a fragment')
  if (/(^|\s)\d{1,3}\.\s/.test(stem)) reject.push('fused question number inside stem')
  if (/[�]/.test(stem)) reject.push('unreadable characters from the PDF')
  for (const k of ['A', 'B', 'C', 'D', 'E']) {
    const o = (r.options[k] ?? '').trim()
    if (!o) {
      if (k !== 'E') reject.push(`option ${k} missing`)
      continue
    }
    if (/(^|\s)\d{1,3}\.\s/.test(o)) reject.push(`fused number inside option ${k}`)
    if (/\.\s+[A-Z][a-z]/.test(o)) reject.push(`option ${k} runs into neighbouring text`)
  }
  return { reject, flags }
}

function flagsFor(r) {
  const flags = []
  if (r.text.startsWith('[Use the data')) flags.push('shared data table prepended — verify boundary')
  if (r.recovered) flags.push('contains recovered orphan text — verify block boundary')
  return flags
}

let inserted = 0
let skippedDup = 0
let skippedIncomplete = 0
let rejected = 0
const rejectReasons = {}
const rejectPile = []
const seenNumbers = new Map()
const insertedIds = []

// Fresh re-ingest per subject: remove this subject's drafts first so
// rejected rows from an earlier loose pass leave no residue. Published
// rows are never touched.
{
  const { data: existing } = await db
    .from('questions')
    .select('id')
    .eq('exam_id', exam.id)
    .eq('subject_id', subject.id)
    .eq('status', 'draft')
  if (existing && existing.length > 0) {
    await db.from('questions').delete().in('id', existing.map((r) => r.id))
    console.log(`cleared ${existing.length} prior drafts for re-ingest`)
  }
}

for (const r of rows) {
  if (r.orphan) {
    rejected++
    rejectReasons['orphan block — recover by hand'] = (rejectReasons['orphan block — recover by hand'] ?? 0) + 1
    rejectPile.push({ ...r, reject_reasons: ['orphan block — recover by hand'] })
    continue
  }
  // Duplicate (year, number) with different stems: at most one can own
  // the key. Never guess — hand rescue decides.
  const twinKey = `${r.year}::${r.number}`
  if (seenNumbers.has(twinKey) && seenNumbers.get(twinKey) !== r.text) {
    rejected++
    rejectReasons['duplicate number, different stem — verify key'] = (rejectReasons['duplicate number, different stem — verify key'] ?? 0) + 1
    rejectPile.push({ ...r, reject_reasons: ['duplicate number, different stem — verify key'] })
    continue
  }
  seenNumbers.set(twinKey, r.text);
  if (!r.answer || !['A', 'B', 'C', 'D', 'E'].includes(r.answer)) {
    skippedIncomplete++
    continue
  }
  if (!['A', 'B', 'C', 'D'].every((k) => (r.options[k] ?? '').trim())) {
    skippedIncomplete++
    continue
  }
  if (r.needs_figure) {
    skippedIncomplete++
    continue
  }

  const present = ['A', 'B', 'C', 'D', 'E'].filter((k) => (r.options[k] ?? '').trim())
  const options = present.map((k) => ({ key: k.toLowerCase(), text: r.options[k].trim() }))
  const answer = r.answer.toLowerCase()

  // Exact-text dedupe against the live JAMB bank for this subject.
  const { data: dup } = await db
    .from('questions')
    .select('id')
    .eq('exam_id', exam.id)
    .eq('subject_id', subject.id)
    .eq('question_text', r.text.trim())
    .limit(1)
  if (dup && dup.length > 0) {
    skippedDup++
    continue
  }

  const { reject: reasons, flags: cleanFlags } = strictClean(r)
  if (reasons.length > 0) {
    rejected++
    for (const reason of reasons) {
      rejectReasons[reason] = (rejectReasons[reason] ?? 0) + 1
    }
    rejectPile.push({ ...r, reject_reasons: reasons })
    continue
  }

  const flags = [...cleanFlags, ...flagsFor(r)]
  const { data: created, error } = await db
    .from('questions')
    .insert({
      exam_id: exam.id,
      subject_id: subject.id,
      question_text: r.text.trim(),
      options,
      correct_answer: answer,
      explanation: '', // none in source PDFs — reviewer writes it at verification
      difficulty: 'medium', // neutral default; reviewer grades at verification
      source: `JAMB ${r.year} (${r.source})`,
      status: 'draft',
      verified_state: 'unverified',
      review_note: flags.length > 0 ? `Auto-parse flags: ${flags.join('; ')}` : null,
    })
    .select('id')
    .single()
  if (error) throw new Error(`insert failed: ${error.message}`)
  inserted++
  insertedIds.push(created.id)
}

console.log(`inserted drafts: ${inserted} | rejected fused: ${rejected} | skipped dup: ${skippedDup} | skipped incomplete/keyless/figure: ${skippedIncomplete}`)
console.log('reject reasons:', JSON.stringify(rejectReasons, null, 1))
if (rejectPile.length > 0) {
  const pilePath = `content-folder/_parsed/_rejected-${subjectSlug}.json`
  writeFileSync(pilePath, JSON.stringify(rejectPile, null, 1))
  console.log(`reject pile (${rejectPile.length}) → ${pilePath} — rescue by hand, never auto-ingest`)
}
