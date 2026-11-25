// Promote section checks into free-recall cards (Active Recall v2, Phase 1).
// Dry run by default; --apply writes to prod with the service role.
//
// Source rule: one card per published lesson text block whose content.check is
// a valid SectionCheck (question, options[], in-range answer index).
//   front = check.question verbatim (NO options -> free recall, not recognition)
//   back  = correct option text + why + steps/walkthrough rendered as plain text
//   hint  = a non-answer distractor only when no why exists
//   source = 'check-derived'
// Idempotency: (lesson_id, front) is already a unique index on recall_cards.

import { createClient } from '@supabase/supabase-js'

const apply = process.argv.includes('--apply')
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { global: { fetch: (input, init = {}) => fetch(input, { ...init, signal: AbortSignal.timeout(25000) }) } },
)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
async function withRetry(label, fn) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fn()
      if (res?.error) throw new Error(res.error.message ?? JSON.stringify(res.error))
      return res
    } catch (err) {
      if (attempt === 4) { console.error(`${label} failed after 4 attempts: ${err.message}`); return null }
      await sleep(attempt * 800)
    }
  }
  return null
}
async function batchIn(label, ids, fetchBatch) {
  const out = []
  for (let i = 0; i < ids.length; i += 50) {
    const res = await withRetry(`${label} batch ${i / 50 + 1}`, () => fetchBatch(ids.slice(i, i + 50)))
    if (res?.data) out.push(...res.data)
  }
  return out
}

const FIGURE_REF = /\b(the diagram|the figure|the table|the graph|shown above|shown below|above diagram|below diagram|from the graph|in the graph)\b/i

function renderBack(check) {
  const parts = []
  const correct = String(check.options?.[check.answer] ?? '').trim()
  if (correct) parts.push(`Answer: ${correct}`)
  if (typeof check.why === 'string' && check.why.trim()) parts.push(check.why.trim())

  const walk = check.walkthrough
  if (walk && typeof walk === 'object') {
    if (typeof walk.summaryVerdict === 'string' && walk.summaryVerdict.trim()) parts.push(walk.summaryVerdict.trim())
    for (const s of (Array.isArray(walk.steps) ? walk.steps : [])) {
      const line = `${s.stepNumber ?? '?'}. ${s.title ?? ''}${s.explanation ? ': ' + s.explanation : ''}`.trim()
      if (line.length > 2) parts.push(line)
      for (const w of (Array.isArray(s.workings) ? s.workings : [])) if (String(w).trim()) parts.push(String(w).trim())
    }
    if (typeof walk.takeawayRule === 'string' && walk.takeawayRule.trim()) parts.push(walk.takeawayRule.trim())
  } else if (Array.isArray(check.steps)) {
    for (const [i, s] of check.steps.entries()) {
      const line = `${i + 1}. ${s.operation ?? ''}${s.reason ? ' (' + s.reason + ')' : ''}${s.result ? ' -> ' + s.result : ''}`.trim()
      if (line.length > 2) parts.push(line)
    }
  }
  return parts.join('\n').trim()
}

function derive(lesson, block) {
  const check = block.content?.check
  if (!check || typeof check !== 'object') return null
  const question = String(check.question ?? '').trim()
  const options = Array.isArray(check.options) ? check.options.map((o) => String(o ?? '').trim()) : []
  const answer = check.answer
  if (!question || options.length < 2 || !Number.isInteger(answer) || answer < 0 || answer >= options.length) return null
  if (!options[answer]) return null
  if (FIGURE_REF.test(question)) return { skip: 'figure-dependent', question }
  const back = renderBack(check)
  if (!back) return { skip: 'empty-back', question }
  const hasWhy = typeof check.why === 'string' && check.why.trim().length > 0
  const hint = !hasWhy
    ? options.find((o, i) => i !== answer && o) ?? null
    : null
  return {
    card: {
      subject_id: lesson.id ? lesson.subject_id : null,
      topic_id: lesson.topic_id ?? null,
      exam_id: lesson.exam_id ?? null,
      lesson_id: lesson.id,
      front: question,
      back,
      hint: hint ? `Think about: ${hint}` : null,
      source: 'check-derived',
      published: true,
    },
    blockId: block.id,
  }
}

console.log(apply ? '=== APPLY MODE ===' : '=== DRY RUN (pass --apply to write) ===')

const lessonsRes = await withRetry('fetch lessons', () =>
  db.from('lessons').select('id, subject_id, topic_id, exam_id, slug').eq('status', 'published').limit(2000))
if (!lessonsRes?.data) { console.error('Could not fetch lessons'); process.exit(1) }
const lessons = lessonsRes.data
const lessonById = new Map(lessons.map((l) => [l.id, l]))
console.log('published lessons:', lessons.length)

const blocks = await batchIn(
  'fetch text blocks',
  lessons.map((l) => l.id),
  (ids) => db.from('lesson_blocks').select('id, lesson_id, block_type, content').eq('block_type', 'text').in('lesson_id', ids).limit(1000),
)
console.log('text blocks fetched:', blocks.length)

const candidates = []
const skips = []
const seenCandidate = new Set()
let duplicateCandidates = 0
for (const b of blocks) {
  const lesson = lessonById.get(b.lesson_id)
  if (!lesson) continue
  const d = derive(lesson, b)
  if (!d) continue
  if (d.skip) skips.push({ reason: d.skip, question: d.question.slice(0, 100), lesson: lesson.slug })
  else if (seenCandidate.has(`${d.card.lesson_id}::${d.card.front}`)) duplicateCandidates++
  else { seenCandidate.add(`${d.card.lesson_id}::${d.card.front}`); candidates.push(d) }
}
console.log('candidate cards:', candidates.length, '| skipped:', skips.length, '| duplicate fronts in source:', duplicateCandidates)

const existingRows = await batchIn(
  'fetch existing recall cards',
  candidates.map((c) => c.card.lesson_id),
  (ids) => db.from('recall_cards').select('id, lesson_id, front, source').in('lesson_id', ids).limit(1000),
)
const existing = new Set(existingRows.map((r) => `${r.lesson_id}::${r.front}`))
const fresh = candidates.filter((c) => !existing.has(`${c.card.lesson_id}::${c.card.front}`))
console.log('already present (idempotent):', candidates.length - fresh.length, '| to insert:', fresh.length)

const { data: subjects } = await withRetry('fetch subjects', () => db.from('subjects').select('id, name, slug'))
const subjById = new Map((subjects ?? []).map((s) => [s.id, s]))
const bySubject = {}
for (const c of fresh) {
  const name = subjById.get(c.card.subject_id)?.name ?? 'Unknown'
  bySubject[name] = (bySubject[name] ?? 0) + 1
}
console.log('\nEXPECTED NEW CARDS PER SUBJECT:')
for (const [name, n] of Object.entries(bySubject).sort((a, b) => b[1] - a[1])) console.log(`  ${name.padEnd(28)} ${n}`)

console.log('\nSKIP SAMPLES (figure-dependent / empty back):')
for (const s of skips.slice(0, 12)) console.log(`  [${s.reason}] ${s.lesson}: ${s.question}`)
console.log('\nCARD SAMPLES:')
for (const c of fresh.slice(0, 3)) {
  console.log(`  FRONT: ${c.card.front}`)
  console.log(`  BACK : ${c.card.back.replace(/\n/g, ' | ').slice(0, 220)}`)
}

if (!apply) {
  console.log('\nDry run complete. Nothing written.')
  process.exit(0)
}

let inserted = 0
for (let i = 0; i < fresh.length; i += 40) {
  const slice = fresh.slice(i, i + 40).map((c) => c.card)
  const res = await withRetry(`insert batch ${i / 40 + 1}`, () => db.from('recall_cards').insert(slice))
  if (res) inserted += slice.length
}
console.log(`\nInserted ${inserted} cards.`)

// Verify by re-running the exact check: a second apply must insert zero.
const verifyRows = await batchIn(
  'verify recall cards',
  candidates.map((c) => c.card.lesson_id),
  (ids) => db.from('recall_cards').select('id, lesson_id, front').in('lesson_id', ids).limit(1000),
)
const verifySet = new Set(verifyRows.map((r) => `${r.lesson_id}::${r.front}`))
const stillFresh = candidates.filter((c) => !verifySet.has(`${c.card.lesson_id}::${c.card.front}`))
console.log('post-apply missing:', stillFresh.length, stillFresh.length === 0 ? '(idempotent OK)' : '(CHECK FAILED)')
process.exit(0)
