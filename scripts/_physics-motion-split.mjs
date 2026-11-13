// Inserts the five child topics of the split Physics A.3 "Motion" spine row
// and shifts the legacy unpublished spine rows A.4+ by five slots so the
// children occupy orders 5-9. Follows the Biology convention: split children
// are flat rows sharing the parent's syllabus_ref ('A.3'); the parent keeps
// its IBASS items/objectives, children are blank spines until authored.
//
// Safe to re-run: children are matched by slug; renumber only happens when
// the legacy A.4 row is still at sort_order 5.
//
// Usage: node --env-file=.env scripts/_physics-motion-split.mjs
//        node --env-file=.env scripts/_physics-motion-split.mjs --dry-run

import { createClient } from '@supabase/supabase-js'
import { writeFileSync, readFileSync } from 'node:fs'
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

const CHILDREN = [
  { slug: 'impulse-and-momentum', name: 'Impulse and Momentum', sort: 5 },
  { slug: 'linear-motion-and-suvat', name: 'Linear Motion and the Equations of Motion', sort: 6 },
  { slug: 'projectile-motion', name: 'Projectile Motion', sort: 7 },
  { slug: 'circular-motion', name: 'Circular Motion', sort: 8 },
  { slug: 'simple-harmonic-motion', name: 'Simple Harmonic Motion', sort: 9 },
]

const bySlug = new Map(topics.map((t) => [t.slug, t]))
const parent = bySlug.get('motion')
if (!parent) throw new Error('motion spine row missing')

// Renumber legacy spine rows A.4+ by +5 (skip when already shifted).
const needsShift = (topics.find((t) => t.slug === 'gravitational-field') ?? {}).sort_order === 5
const renumber = topics
  .filter((t) => t.sort_order >= 5 && !CHILDREN.some((c) => c.slug === t.slug))

if (dryRun) {
  console.log('would rename motion -> Motion (was ") Motion"):', parent.name)
  if (needsShift) console.log('would shift', renumber.length, 'spine rows by +5')
  else console.log('spine rows already shifted (skip)')
  for (const c of CHILDREN) console.log('would insert topic', c.slug, 'at', c.sort)
  process.exit(0)
}

// 1. Fix the parser artefact on the parent row.
if (parent.name !== 'Motion') {
  const { error } = await db.from('topics').update({ name: 'Motion' }).eq('id', parent.id)
  if (error) throw new Error(error.message)
  console.log('renamed parent topic to Motion')
}

// 2. Shift legacy rows down.
if (needsShift) {
  const seed = tmpdir()
  writeFileSync(join(seed, 'phys-renumber-backup.json'), JSON.stringify(renumber, null, 2))
  // update from the highest sort_order downwards so intermediate states stay ordered
  for (const row of [...renumber].sort((a, b) => b.sort_order - a.sort_order)) {
    const { error } = await db.from('topics').update({ sort_order: row.sort_order + 5 }).eq('id', row.id)
    if (error) throw new Error(`renumber ${row.slug}: ${error.message}`)
  }
  console.log('shifted', renumber.length, 'spine rows by +5 (backup in', join(seed, 'phys-renumber-backup.json'), ')')
} else {
  console.log('spine rows already shifted (skip)')
}

// 3. Insert the child topics (unpublished until their lessons seed).
for (const c of CHILDREN) {
  if (bySlug.has(c.slug)) { console.log('child exists, skip:', c.slug); continue }
  const { error } = await db.from('topics').insert({
    subject_id: subject.id,
    slug: c.slug,
    name: c.name,
    section_key: 'A',
    section_title: 'Core',
    sort_order: c.sort,
    published: false,
    syllabus_ref: 'A.3',
    syllabus_items: [],
    objectives: [],
  })
  if (error) throw new Error(`insert ${c.slug}: ${error.message}`)
  console.log('inserted child topic', c.slug, 'at', c.sort)
}
console.log('done')
