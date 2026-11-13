// Expands the Physics mechanics spine leg A.4-A.11 into one-concept topics,
// following the Biology convention (split children are flat rows sharing the
// parent's syllabus_ref; the parent keeps its IBASS items/objectives).
//
// Splits:
//   A.5 equilibrium-of-forces -> + moments-and-stability
//   A.7 work-energy-and-power  -> + energy-and-society + photoelectric-and-photovoltaic
//   A.10 pressure              -> + pressure-in-liquids
//
// Renumber: legacy rows from A.8 onward shift by +4 so the new children sit
// contiguously after their parents.
//
// Usage: node --env-file=.env scripts/_physics-mechanics-split.mjs [--dry-run]

import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) { console.error('Missing Supabase env vars'); process.exit(1) }
if (!URL.includes('yaglpxybwmmpzbzgixkr.supabase.co')) { console.error(`Unexpected Supabase host: ${URL}`); process.exit(1) }
const dryRun = process.argv.includes('--dry-run')

const db = createClient(URL, KEY, { auth: { persistSession: false } })
const { data: subject, error: subjectError } = await db
  .from('subjects')
  .select('id')
  .eq('slug', 'physics')
  .single()
if (subjectError || !subject) throw new Error('physics subject not found')

const { data: topics, error: topicsError } = await db
  .from('topics')
  .select('id, slug, name, sort_order, published, syllabus_ref')
  .eq('subject_id', subject.id)
  .order('sort_order')
if (topicsError) throw new Error(topicsError.message)

const bySlug = new Map(topics.map((t) => [t.slug, t]))

const CHILDREN = [
  { slug: 'moments-and-stability', name: 'Moments of Forces and Stability', parent: 'equilibrium-of-forces', ref: 'A.5' },
  { slug: 'energy-and-society', name: 'Energy and the Needs of Society', parent: 'work-energy-and-power', ref: 'A.7' },
  { slug: 'photoelectric-and-photovoltaic', name: 'The Photoelectric Effect and Photovoltaic Cells', parent: 'work-energy-and-power', ref: 'A.7' },
  { slug: 'pressure-in-liquids', name: 'Pressure in Liquids', parent: 'pressure', ref: 'A.10' },
]

// Child positions: right after their parents in syllabus order.
const PARENT_ORDER = new Map([...bySlug].map(([slug, t]) => [slug, t.sort_order]))
const assignment = []
let cursor = 0
for (const t of topics) {
  // skip children already inserted (re-run safety)
  if (CHILDREN.some((c) => c.slug === t.slug)) continue
  assignment.push({ row: t, sort: 0 })
}
// build desired order: walk legacy rows in current order; after each parent
// parent's children are appended, then continue.
const desired = []
for (const t of topics) {
  if (CHILDREN.some((c) => c.slug === t.slug)) continue // already present in DB, skip reorder anchor
  desired.push({ slug: t.slug, id: t.id })
  const parentChildren = CHILDREN.filter((c) => c.parent === t.slug)
  // children are missing unless already in the DB; append them as new rows
  // (if already present they will be placed by this same walk competing slugs)
  for (const c of parentChildren) desired.push({ slug: c.slug, id: null })
}
for (const c of CHILDREN) {
  if (bySlug.has(c.slug)) continue
  if (!desired.some((d) => d.slug === c.slug)) {
    // child whose parent did not appear in the walk (should not happen); append at end
    desired.push({ slug: c.slug, id: null })
  }
}
const newAssignments = []
desired.forEach((d, i) => newAssignments.push({ slug: d.slug, id: d.id, sort: i + 1 }))
const shiftNeeded = newAssignments.every(
  (a) => {
    const existing = bySlug.get(a.slug)
    return existing ? existing.sort_order === a.sort : true
  },
) === false

if (dryRun) {
  console.log('reorder map (slug -> new order):')
  for (const a of newAssignments) console.log(String(a.sort).padStart(2), a.slug)
  process.exit(0)
}

// Back up the current orders before renumbering.
writeFileSync(
  join(tmpdir(), 'phys-mechanics-backup.json'),
  JSON.stringify(topics.map((t) => ({ id: t.id, slug: t.slug, sort_order: t.sort_order })), null, 2),
)

// Insert missing children with a temporary order until renumbered.
for (const c of CHILDREN) {
  if (bySlug.has(c.slug)) { console.log('child exists, skip:', c.slug); continue }
  const { error } = await db.from('topics').insert({
    subject_id: subject.id,
    slug: c.slug,
    name: c.name,
    section_key: 'A',
    section_title: 'Core',
    sort_order: 900 + Math.floor(Math.random() * 90) + 10, // placeholder, renumbered below
    published: false,
    syllabus_ref: c.ref,
    syllabus_items: [],
    objectives: [],
  })
  if (error) throw new Error(`insert ${c.slug}: ${error.message}`)
  console.log('inserted child topic', c.slug)
}

// Renumber all rows to the desired sequence.
for (const a of newAssignments) {
  const { error } = await db.from('topics').update({ sort_order: a.sort }).eq('subject_id', subject.id).eq('slug', a.slug)
  if (error) throw new Error(`renumber ${a.slug}: ${error.message}`)
}
console.log('renumbered', newAssignments.length, 'topics; backup in', join(tmpdir(), 'phys-mechanics-backup.json'))
