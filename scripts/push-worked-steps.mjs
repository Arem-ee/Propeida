// Push worked-steps explanations from the bank into question_answers (live DB),
// with bounded concurrency. Idempotent: re-running overwrites the
// worked-steps JSON with the same content.
//
// When to run: AFTER the code that renders worked-steps explanations
// (lib/lessons.ts parseExplanation + practice/lesson feedback wiring) is
// deployed — origin/main before that renders the raw JSON in the feedback UI.
//
//   node --env-file=.env scripts/push-worked-steps.mjs           # dry-run (no writes)
//   node --env-file=.env scripts/push-worked-steps.mjs --apply   # write
import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

const APPLY = process.argv.includes('--apply')

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) { console.error('Missing env vars'); process.exit(1) }
const db = createClient(URL, KEY)

const source = JSON.parse(readFileSync('content-folder/chemistry-jamb-bank.json', 'utf8'))
const targets = source.questions.filter(q => q.answerExplanationFormat === 'worked-steps-v1')

const { data: subject } = await db.from('subjects').select('id').eq('slug', 'chemistry').single()
const chemId = subject.id
const { data: exam } = await db.from('exams').select('id').eq('slug', 'jamb').single()
const examId = exam.id

const results = []
let cursor = 0
const CONCURRENCY = 8

async function worker() {
  while (cursor < targets.length) {
    const i = cursor++
    const q = targets[i]
    const qText = (q.question || '').trim()
    try {
      const { data: rows, error: lookupErr } = await db
        .from('questions')
        .select('id')
        .eq('exam_id', examId)
        .eq('subject_id', chemId)
        .eq('question_text', qText)
      if (lookupErr) { results.push({ id: q.id, ok: false, why: 'lookup: ' + lookupErr.message }); continue }
      if (!rows || rows.length === 0) { results.push({ id: q.id, ok: false, why: 'no DB row' }); continue }

      if (APPLY) {
        const { error: updateErr } = await db
          .from('question_answers')
          .update({ explanation: q.answerExplanation })
          .eq('question_id', rows[0].id)
        if (updateErr) { results.push({ id: q.id, ok: false, why: 'update: ' + updateErr.message }); continue }
        results.push({ id: q.id, ok: true })
      } else {
        const { data: ans } = await db
          .from('question_answers')
          .select('explanation')
          .eq('question_id', rows[0].id)
          .maybeSingle()
        results.push({ id: q.id, ok: true, alreadySteps: ans?.explanation?.trim().startsWith('{') ?? false })
      }
    } catch (e) {
      results.push({ id: q.id, ok: false, why: String(e) })
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()))

const ok = results.filter(r => r.ok)
const failed = results.filter(r => !r.ok)
console.log(APPLY ? 'applied:' : 'checked:', ok.length, '| failed/no-DB-row:', failed.length)
const missing = failed.filter(r => r.why === 'no DB row').map(r => r.id)
console.log('no DB row (unusable, never seeded):', missing.join(', ') || 'none')
for (const r of failed.filter(r => r.why !== 'no DB row')) console.log('FAIL', r.id, r.why)
if (!APPLY) {
  console.log('rows still holding prose explanations:', ok.filter(r => !r.alreadySteps).length)
}
