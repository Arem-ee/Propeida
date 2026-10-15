// Applies a decisions file with pre-flight verification (ids exist as
// drafts + live text byte-identical to the triage dump). Any drift aborts.
// Usage: node --env-file=.env scripts/apply-decisions.mjs <decisions.json> <dump.json>

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) {
  console.error('Missing Supabase env vars')
  process.exit(1)
}
const db = createClient(URL, KEY)

const [, , decisionsPath, dumpPath] = process.argv
if (!decisionsPath || !dumpPath) {
  console.error('Usage: apply-decisions.mjs <decisions.json> <dump.json>')
  process.exit(1)
}
const decisions = JSON.parse(readFileSync(decisionsPath, 'utf8'))
const dump = JSON.parse(readFileSync(dumpPath, 'utf8'))
const dumpById = new Map(dump.map((r) => [r.id, r.question_text]))

// Pre-flight: all ids exist, all drafts, and live text is byte-identical
// to the dump the triage was done from. Any drift aborts the run.
const ids = decisions.map((d) => d.id)
const { data: rows, error: readErr } = await db
  .from('questions')
  .select('id, question_text, options, status')
  .in('id', ids)
if (readErr) throw readErr
if (!rows || rows.length !== ids.length) {
  const found = new Set((rows ?? []).map((r) => r.id))
  throw new Error(`pre-flight: missing ids: ${ids.filter((i) => !found.has(i)).join(', ')}`)
}
const byId = new Map(rows.map((r) => [r.id, r]))
for (const [id, r] of byId) {
  if (r.status !== 'draft') throw new Error(`pre-flight: ${id} is not a draft`)
  const dumped = dumpById.get(id)
  if (dumped === undefined) throw new Error(`pre-flight: ${id} not in triage dump`)
  if (dumped !== r.question_text) throw new Error(`pre-flight: ${id} text drifted since triage`)
}
console.log(`pre-flight ok: ${rows.length} draft rows verified byte-identical to triage dump`)

let nExp = 0
let nRep = 0
let nFlag = 0
let nDel = 0
const delIds = []

for (const d of decisions) {
  const row = byId.get(d.id)
  if (d.action === 'delete') {
    delIds.push(d.id)
    continue
  }
  if (d.action === 'flag') {
    const notes = [row.review_note ?? null, d.note].filter(Boolean).join(' | ')
    const { error } = await db.from('questions').update({ review_note: notes }).eq('id', d.id)
    if (error) throw new Error(`flag ${d.id}: ${error.message}`)
    nFlag++
    continue
  }
  if (d.action === 'explain') {
    const notes = [row.review_note ?? null, d.note].filter(Boolean).join(' | ') || null
    const { error } = await db
      .from('questions')
      .update({ explanation: d.explanation, review_note: notes })
      .eq('id', d.id)
    if (error) throw new Error(`explain ${d.id}: ${error.message}`)
    nExp++
    continue
  }
  if (d.action === 'repair') {
    const patch = {}
    if (d.stem) patch.question_text = d.stem
    if (d.options) {
      const want = d.options
      patch.options = (row.options ?? []).map((o) => {
        const k = (o.key ?? '').toUpperCase()
        if (want[k.toLowerCase()] !== undefined) return { ...o, text: want[k.toLowerCase()] }
        return o
      })
    }
    const notes = [row.review_note ?? null, 'AI-solving: repaired from fragments — verify wording against source', d.note]
      .filter(Boolean)
      .join(' | ')
    patch.review_note = notes
    if (d.explanation) patch.explanation = d.explanation
    const { error } = await db.from('questions').update(patch).eq('id', d.id)
    if (error) throw new Error(`repair ${d.id}: ${error.message}`)
    nRep++
    continue
  }
  throw new Error(`unknown action: ${d.action}`)
}

if (delIds.length > 0) {
  const { error } = await db.from('questions').delete().in('id', delIds)
  if (error) throw new Error(`delete: ${error.message}`)
  nDel = delIds.length
}

console.log(`explained: ${nExp} | repaired: ${nRep} | flagged: ${nFlag} | deleted: ${nDel}`)
