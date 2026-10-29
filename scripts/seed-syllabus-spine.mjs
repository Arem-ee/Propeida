// Seeds the JAMB curriculum spine from the extracted syllabus tree.
//
// Source: content-folder/jamb-syllabus/structured/<key>.json, produced by
// tools/export-structured.py. Each syllabus section becomes section_key /
// section_title, each syllabus topic becomes a topic row, and the syllabus
// notes and objectives are stored on the topic for coverage auditing.
//
// The four subjects that already have an authored spine (English, Mathematics,
// Government, Economics) are reported but not rewritten: their topics were
// hand-built and carry published lessons. Reconcile those separately.
//
// New topics are seeded unpublished. A topic goes live when its first lesson
// is published, so students never see an empty curriculum row.
//
// Idempotent: topics are matched by (subject, slug) and updated in place.
//
// Usage:
//   node --env-file=.env scripts/seed-syllabus-spine.mjs
//   node --env-file=.env scripts/seed-syllabus-spine.mjs --dry-run
//   node --env-file=.env scripts/seed-syllabus-spine.mjs --only biology,chemistry

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const syllabusDir = join(root, 'content-folder', 'jamb-syllabus', 'structured')

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const onlyFlag = args.indexOf('--only')
const only = onlyFlag >= 0 ? new Set(args[onlyFlag + 1].split(',')) : null

// Syllabus key -> subject slug in the database. Two names differ from the
// syllabus file name.
const SUBJECT_SLUG = {
  'agricultural-science': 'agricultural-science',
  arabic: 'arabic',
  art: 'art',
  biology: 'biology',
  chemistry: 'chemistry',
  'christian-religious-studies': 'christian-religious-studies',
  commerce: 'commerce',
  'computer-studies': 'computer-studies',
  economics: 'economics',
  english: 'english',
  french: 'french',
  geography: 'geography',
  government: 'government',
  hausa: 'hausa',
  history: 'history',
  'home-economics': 'home-economics',
  igbo: 'igbo',
  'islamic-studies': 'islamic-studies',
  'literature-in-english': 'literature',
  mathematics: 'mathematics',
  music: 'music',
  'physical-and-health-education': 'physical-and-health-education',
  physics: 'physics',
  'principles-of-accounts': 'accounting',
  yoruba: 'yoruba',
}

// Already hand-built, with published lessons. Do not overwrite.
const AUTHORED = new Set(['english', 'mathematics', 'government', 'economics'])

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error('Missing Supabase env vars')
const db = createClient(url, key)

const { data: jamb, error: examError } = await db
  .from('exams')
  .select('id')
  .eq('slug', 'jamb')
  .single()
if (examError || !jamb) throw new Error('jamb exam missing')

const files = readdirSync(syllabusDir)
  .filter((f) => f.endsWith('.json') && !f.startsWith('_'))
  .sort()

let subjectCount = 0
let insertCount = 0
let updateCount = 0
let itemCount = 0
let objectiveCount = 0
const skipped = []
const gaps = []

/** Missing topic numbers inside a section: the clearest sign the parse dropped rows. */
function numberGaps(topics) {
  const numbers = topics
    .map((t) => {
      const match = /^(\d+)/.exec(String(t.number))
      return match ? Number(match[1]) : null
    })
    .filter((n) => Number.isInteger(n))
  if (numbers.length < 2) return []
  const present = new Set(numbers)
  const missing = []
  for (let i = Math.min(...numbers); i <= Math.max(...numbers); i += 1) {
    if (!present.has(i)) missing.push(i)
  }
  return missing
}

for (const file of files) {
  const data = JSON.parse(readFileSync(join(syllabusDir, file), 'utf8'))
  const slug = SUBJECT_SLUG[data.key]
  if (!slug) throw new Error(`no subject mapping for ${data.key}`)
  if (only && !only.has(data.key)) continue

  if (AUTHORED.has(slug)) {
    skipped.push({ subject: data.subject, topics: data.sections.reduce((n, s) => n + s.topics.length, 0) })
    continue
  }

  subjectCount += 1

  let subjectId
  const { data: existingSubject } = await db.from('subjects').select('id').eq('slug', slug).maybeSingle()
  if (existingSubject) {
    subjectId = existingSubject.id
  } else {
    if (dryRun) {
      console.log(`[dry] create subject ${slug} (${data.subject})`)
      subjectId = null
    } else {
      const { data: inserted, error } = await db
        .from('subjects')
        .insert({ slug, name: data.subject })
        .select('id')
        .single()
      if (error) throw new Error(`insert subject ${slug}: ${error.message}`)
      subjectId = inserted.id
      console.log(`created subject ${slug}`)
    }
  }

  if (subjectId) {
    const { data: link } = await db
      .from('exam_subjects')
      .select('subject_id')
      .eq('exam_id', jamb.id)
      .eq('subject_id', subjectId)
      .maybeSingle()
    if (!link && !dryRun) {
      const { error } = await db
        .from('exam_subjects')
        .insert({ exam_id: jamb.id, subject_id: subjectId })
      if (error) throw new Error(`link ${slug} to jamb: ${error.message}`)
    }
  }

  const existingTopics = subjectId
    ? (await db.from('topics').select('id, slug').eq('subject_id', subjectId)).data ?? []
    : []
  const bySlug = new Map(existingTopics.map((t) => [t.slug, t.id]))

  let order = 0
  let subjectInserted = 0
  let subjectUpdated = 0
  let subjectItems = 0
  let subjectObjectives = 0

  for (const section of data.sections) {
    const missing = numberGaps(section.topics)
    if (missing.length) gaps.push({ subject: data.subject, section: section.letter, missing })
    for (const topic of section.topics) {
      order += 1
      subjectItems += topic.items.length
      subjectObjectives += topic.objectives.length

      const row = {
        subject_id: subjectId,
        slug: topic.slug,
        name: topic.title,
        sort_order: order,
        published: false,
        section_key: section.key,
        section_title: section.title,
        syllabus_ref: `${section.letter}.${topic.number}`,
        syllabus_items: topic.items,
        objectives: topic.objectives,
      }

      if (bySlug.has(topic.slug)) {
        subjectUpdated += 1
        if (!dryRun) {
          const { error } = await db.from('topics').update(row).eq('id', bySlug.get(topic.slug))
          if (error) throw new Error(`update topic ${slug}/${topic.slug}: ${error.message}`)
        }
      } else {
        subjectInserted += 1
        if (dryRun) {
          if (subjectInserted <= 3) console.log(`[dry] ${slug}: ${section.letter}.${topic.number} ${topic.title}`)
        } else {
          const { error } = await db.from('topics').insert(row)
          if (error) throw new Error(`insert topic ${slug}/${topic.slug}: ${error.message}`)
        }
      }
    }
  }

  insertCount += subjectInserted
  updateCount += subjectUpdated
  itemCount += subjectItems
  objectiveCount += subjectObjectives

  console.log(
    `${data.subject.padEnd(32)} sections=${String(data.sections.length).padStart(2)} ` +
      `topics=${String(subjectInserted + subjectUpdated).padStart(3)} ` +
      `(new ${subjectInserted}, updated ${subjectUpdated}) ` +
      `items=${subjectItems} objectives=${subjectObjectives}`,
  )
}

console.log(
  `\n${dryRun ? '[dry run] ' : ''}subjects=${subjectCount} topics=${insertCount + updateCount} ` +
    `(new ${insertCount}, updated ${updateCount}) items=${itemCount} objectives=${objectiveCount}`,
)
if (skipped.length) {
  console.log('\nSkipped authored spines (reconcile separately):')
  for (const s of skipped) console.log(`  ${s.subject}: ${s.topics} syllabus topics`)
}
if (gaps.length) {
  console.log('\nParser gaps (topic numbers missing inside a section):')
  for (const g of gaps) console.log(`  ${g.subject} ${g.section}: missing ${g.missing.join(', ')}`)
}
