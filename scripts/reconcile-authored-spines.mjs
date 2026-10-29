// Completes the four authored JAMB spines against the official syllabus.
//
// English, Mathematics, Government and Economics were hand-built before the
// syllabus extractor existed, so their topic rows cover only part of each
// syllabus. This script keeps those rows (and their published lessons and
// questions) and:
//
//   1. attaches each authored topic to the syllabus section it belongs to;
//   2. adds every syllabus topic that has no authored equivalent as an
//      unpublished row, so coverage is complete without showing empty topics.
//
// Mapped topics keep their name and published state. New rows are always
// published=false and carry the syllabus notes/objectives for authoring.
//
// Usage:
//   node --env-file=.env scripts/reconcile-authored-spines.mjs --dry-run
//   node --env-file=.env scripts/reconcile-authored-spines.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const syllabusDir = join(root, 'content-folder', 'jamb-syllabus', 'structured')
const dryRun = process.argv.includes('--dry-run')

// Authored topic slug -> syllabus reference. A reference can own more than one
// authored topic (surds + indices both sit under "Indices, Logarithms and
// Surds").
const REF_MAP = {
  mathematics: {
    'I.3': ['surds', 'indices'],
    'II.1': ['quadratic-equations'],
    'III.5': ['trigonometry'],
    'V.5': ['probability'],
  },
  government: {
    'A.1': ['definition-scope-government'],
    'A.2': ['basic-concepts'],
    'A.3': ['forms-systems-government'],
    'A.4': ['arms-of-government'],
    'A.5': ['structures-of-governance'],
    'A.7': ['political-ideologies'],
    'A.8': ['constitution-rule-of-law'],
    'A.11': ['citizenship'],
    'A.13': ['political-parties-elections'],
    'B.1': ['pre-colonial-colonial-administration'],
    'B.9': ['nigerian-federalism-military-rule'],
    'C.1': ['foreign-policy-international-organisations'],
  },
  economics: {
    'A.1': ['basic-concepts'],
    'A.4': ['demand-and-supply'],
    'A.5': ['consumer-behaviour'],
    'A.8': ['production-and-costs'],
    'A.10': ['market-structures'],
    'A.11': ['national-income'],
    'A.12': ['money-and-inflation'],
    'A.13': ['financial-institutions'],
    'A.14': ['public-finance'],
    'A.16': ['agriculture-and-industry'],
    'A.19': ['business-organisations'],
    'A.20': ['population'],
    'A.21': ['international-trade'],
  },
}

// English's syllabus is three skill domains with many sub-points. The authored
// topics are the detailed sub-points, so they become the rows for each domain.
const ENGLISH = [
  {
    key: 'comprehension-and-summary',
    title: 'Comprehension and Summary',
    letter: 'A',
    ref: 'A',
    slugs: [
      'comprehension-question-skills',
      'summary-writing',
      'passage-description',
      'passage-narration',
      'passage-exposition',
      'passage-argumentation',
    ],
  },
  {
    key: 'lexis-and-structure',
    title: 'Lexis and Structure',
    letter: 'B',
    ref: 'B',
    slugs: [
      'cloze-test-technique',
      'synonyms',
      'antonyms',
      'clause-and-sentence-patterns',
      'word-classes-and-functions',
      'mood-tense-and-aspect',
      'number-agreement-and-concord',
      'degrees-of-comparison',
      'question-tags',
      'mechanics-spelling-and-punctuation',
      'ordinary-figurative-idiomatic-usage',
    ],
  },
  {
    key: 'oral-forms',
    title: 'Oral Forms',
    letter: 'C',
    ref: 'C',
    slugs: [
      'vowels-monothongs-diphthongs-triphthongs',
      'consonants-and-clusters',
      'rhymes-and-homophones',
      'word-stress',
      'emphatic-stress',
    ],
  },
]

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'topic'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error('Missing Supabase env vars')
const db = createClient(url, key)

const { data: subjects, error: subjectError } = await db
  .from('subjects')
  .select('id,slug')
  .in('slug', ['english', 'mathematics', 'government', 'economics'])
if (subjectError) throw new Error(subjectError.message)
const subjectBySlug = new Map(subjects.map((s) => [s.slug, s]))

const report = []

for (const slug of ['mathematics', 'government', 'economics']) {
  const subject = subjectBySlug.get(slug)
  if (!subject) throw new Error(`missing subject ${slug}`)
  const data = JSON.parse(readFileSync(join(syllabusDir, `${slug}.json`), 'utf8'))
  const { data: existing } = await db
    .from('topics')
    .select('id,slug,name,published,syllabus_ref')
    .eq('subject_id', subject.id)
  const bySlug = new Map(existing.map((t) => [t.slug, t]))
  const usedSlugs = new Set(existing.map((t) => t.slug))
  const mapped = new Set()
  const byRef = new Map()
  for (const topic of existing) {
    if (!topic.syllabus_ref) continue
    const rows = byRef.get(topic.syllabus_ref) ?? []
    rows.push(topic)
    byRef.set(topic.syllabus_ref, rows)
  }

  let order = 0
  let inserted = 0
  let updated = 0
  let refreshed = 0
  let coveredRefs = 0
  const missing = []

  for (const section of data.sections) {
    for (const topic of section.topics) {
      const ref = `${section.letter}.${topic.number}`
      const slugs = REF_MAP[slug]?.[ref] ?? []
      if (slugs.length) coveredRefs += 1
      if (!slugs.length) missing.push(ref)

      const targets = slugs.length ? slugs : [null]
      for (const authoredSlug of targets) {
        order += 1
        const row = {
          subject_id: subject.id,
          section_key: section.key,
          section_title: section.title,
          syllabus_ref: ref,
          syllabus_items: topic.items,
          objectives: topic.objectives,
          sort_order: order,
        }
        if (authoredSlug) {
          const target = bySlug.get(authoredSlug)
          if (!target) throw new Error(`${slug}: mapped topic ${authoredSlug} missing`)
          mapped.add(authoredSlug)
          updated += 1
          if (!dryRun) {
            const { error } = await db
              .from('topics')
              .update({ ...row, published: target.published })
              .eq('id', target.id)
            if (error) throw new Error(`update ${slug}/${authoredSlug}: ${error.message}`)
          }
        } else {
          const existingRow = (byRef.get(ref) ?? []).find(
            (t) => !mapped.has(t.slug),
          )
          if (existingRow) {
            mapped.add(existingRow.slug)
            refreshed += 1
            if (!dryRun) {
              const { error } = await db
                .from('topics')
                .update({ ...row, name: topic.title })
                .eq('id', existingRow.id)
              if (error) throw new Error(`refresh ${slug}/${existingRow.slug}: ${error.message}`)
            }
            continue
          }
          let newSlug = slugify(topic.title)
          let n = 2
          while (usedSlugs.has(newSlug)) {
            newSlug = `${slugify(topic.title)}-${n}`
            n += 1
          }
          usedSlugs.add(newSlug)
          inserted += 1
          if (!dryRun) {
            const { error } = await db.from('topics').insert({
              ...row,
              slug: newSlug,
              name: topic.title,
              published: false,
            })
            if (error) throw new Error(`insert ${slug}/${newSlug}: ${error.message}`)
          }
        }
      }
    }
  }

  const totalRefs = data.sections.reduce((n, s) => n + s.topics.length, 0)
  report.push({
    slug,
    totalRefs,
    coveredRefs,
    inserted,
    updated,
    refreshed,
    unmappedAuthored: existing.filter((t) => !mapped.has(t.slug)).map((t) => t.slug),
    missing,
  })
}

// English: no new rows; attach the existing detailed topics to the three
// syllabus domains.
{
  const subject = subjectBySlug.get('english')
  if (!subject) throw new Error('missing subject english')
  const { data: existing } = await db
    .from('topics')
    .select('id,slug,name,published')
    .eq('subject_id', subject.id)
  const bySlug = new Map(existing.map((t) => [t.slug, t]))
  const mapped = new Set()
  let order = 0
  let updated = 0

  for (const domain of ENGLISH) {
    for (const authoredSlug of domain.slugs) {
      const target = bySlug.get(authoredSlug)
      if (!target) throw new Error(`english: mapped topic ${authoredSlug} missing`)
      order += 1
      mapped.add(authoredSlug)
      updated += 1
      if (!dryRun) {
        const { error } = await db
          .from('topics')
          .update({
            section_key: domain.key,
            section_title: domain.title,
            syllabus_ref: domain.ref,
            sort_order: order,
          })
          .eq('id', target.id)
        if (error) throw new Error(`update english/${authoredSlug}: ${error.message}`)
      }
    }
  }

  report.push({
    slug: 'english',
    totalRefs: ENGLISH.length,
    coveredRefs: ENGLISH.length,
    inserted: 0,
    updated,
    refreshed: 0,
    unmappedAuthored: existing.filter((t) => !mapped.has(t.slug)).map((t) => t.slug),
    missing: [],
  })
}

for (const row of report) {
  console.log(
    `${row.slug.padEnd(12)} syllabus=${String(row.totalRefs).padStart(2)} ` +
      `covered=${String(row.coveredRefs).padStart(2)} new=${String(row.inserted).padStart(2)} ` +
      `refreshed=${String(row.refreshed).padStart(2)} attached=${String(row.updated).padStart(2)}`,
  )
  if (row.missing.length) console.log(`  adding unpublished: ${row.missing.join(', ')}`)
  if (row.unmappedAuthored.length)
    console.log(`  authored rows outside a syllabus ref: ${row.unmappedAuthored.join(', ')}`)
}
console.log(dryRun ? '\n[dry run] no rows written' : '\n[done] authored spines reconciled')
