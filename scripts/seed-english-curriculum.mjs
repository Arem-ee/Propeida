// Seeds the Use of English curriculum spine.
//
// Creates one topic per JAMB syllabus sub-item, attaches the published
// lessons that already exist to their topic, and creates draft lesson rows
// for the topics whose content is authored in later phases.
//
// Idempotent: safe to re-run. Never overwrites lesson content.
//
// Usage: node --env-file=.env scripts/seed-english-curriculum.mjs

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
const curriculumSrc = readFileSync(join(here, '..', 'lib', 'notes', 'content', 'english-curriculum.ts'), 'utf8')

// The curriculum lives in TypeScript so the app can import it. This script
// reads the same file and evaluates just the data, so there is one source of
// truth rather than a copy in a script.
const start = curriculumSrc.indexOf('export const CURRICULUM')
const end = curriculumSrc.indexOf('export const SECTION_TITLES')
const body = curriculumSrc
  .slice(start, end)
  .replace('export const CURRICULUM: CurriculumTopic[] =', 'const CURRICULUM =')
const CURRICULUM = new Function(`${body}; return CURRICULUM`)()

const { data: subject, error: subjectError } = await db
  .from('subjects')
  .select('id, slug')
  .eq('slug', 'english')
  .single()
if (subjectError || !subject) throw new Error('english subject missing')
console.log(`subject english = ${subject.id}`)

// ── 1. Topics ─────────────────────────────────────────────────────────────
const topicRows = CURRICULUM.map((t) => ({
  subject_id: subject.id,
  slug: t.slug,
  name: t.name,
  description: t.description,
  sort_order: t.order,
  section_key: t.section,
  section_title: t.sectionTitle,
  published: true,
}))

const { data: existingTopics } = await db
  .from('topics')
  .select('id, slug')
  .eq('subject_id', subject.id)
const topicIdBySlug = new Map((existingTopics ?? []).map((t) => [t.slug, t.id]))

for (const row of topicRows) {
  if (topicIdBySlug.has(row.slug)) {
    const { error } = await db
      .from('topics')
      .update({
        name: row.name,
        description: row.description,
        sort_order: row.sort_order,
        section_key: row.section_key,
        section_title: row.section_title,
        published: true,
      })
      .eq('id', topicIdBySlug.get(row.slug))
    if (error) throw new Error(`update topic ${row.slug}: ${error.message}`)
  } else {
    const { data, error } = await db.from('topics').insert(row).select('id').single()
    if (error) throw new Error(`insert topic ${row.slug}: ${error.message}`)
    topicIdBySlug.set(row.slug, data.id)
  }
}
console.log(`topics: ${topicRows.length} in the curriculum, ${topicIdBySlug.size} in the database`)

// ── 2. Lessons ────────────────────────────────────────────────────────────
// A published lesson already teaching a topic keeps its slug and content and
// gains its curriculum position. A topic with no lesson yet gets a draft
// row: visible to authors, invisible to learners until the content lands.
const { data: existingLessons } = await db
  .from('lessons')
  .select('id, slug, status, topic_id, sort_order')
  .eq('subject_id', subject.id)
const lessonBySlug = new Map((existingLessons ?? []).map((l) => [l.slug, l]))

let linked = 0
let drafted = 0
const unmapped = []

for (const t of CURRICULUM) {
  const topicId = topicIdBySlug.get(t.slug)
  const slug = t.existingLesson ?? t.slug
  const existing = lessonBySlug.get(slug)

  if (existing) {
    const { error } = await db
      .from('lessons')
      .update({ topic_id: topicId, sort_order: t.order })
      .eq('id', existing.id)
    if (error) throw new Error(`link lesson ${slug}: ${error.message}`)
    linked += 1
    continue
  }

  const { error } = await db.from('lessons').insert({
    subject_id: subject.id,
    topic_id: topicId,
    slug: t.slug,
    title: t.name,
    objective: t.syllabusObjective,
    estimated_minutes: t.estimatedMinutes,
    sort_order: t.order,
    status: 'draft',
    source_ref: `jamb-utme-use-of-english#${t.syllabusItem}`,
  })
  if (error) throw new Error(`create draft lesson ${t.slug}: ${error.message}`)
  drafted += 1
}

// ── 3. Prerequisites ──────────────────────────────────────────────────────
// A learner who keeps failing one topic gets routed to the topic that
// caused it, so the chain has to exist before the content does.
let prereqCount = 0
for (const t of CURRICULUM) {
  for (const preSlug of t.prerequisites ?? []) {
    const topicId = topicIdBySlug.get(t.slug)
    const preId = topicIdBySlug.get(preSlug)
    if (!topicId || !preId) {
      console.error(`  ! ${t.slug} requires unknown topic ${preSlug}`)
      continue
    }
    const { data: existing } = await db
      .from('topic_prerequisites')
      .select('topic_id')
      .eq('topic_id', topicId)
      .eq('prerequisite_topic_id', preId)
      .maybeSingle()
    if (existing) continue
    const { error } = await db.from('topic_prerequisites').insert({
      topic_id: topicId,
      prerequisite_topic_id: preId,
    })
    if (error) throw new Error(`prerequisite ${t.slug} -> ${preSlug}: ${error.message}`)
    prereqCount += 1
  }
}
console.log(`prerequisites: ${prereqCount} added`)

// ── 4. Orphan check ───────────────────────────────────────────────────────
// A published lesson with no topic would vanish from the curriculum map.
for (const l of existingLessons ?? []) {
  if (!l.topic_id) {
    const topic = CURRICULUM.find((t) => t.existingLesson === l.slug)
    unmapped.push(l.slug)
    if (!topic) {
      console.error(`  ! published lesson "${l.slug}" has no topic — needs a home`)
    }
  }
}

console.log(`lessons: ${linked} linked, ${drafted} drafted`)
if (unmapped.length) console.log(`  unmapped published lessons: ${unmapped.join(', ')}`)

// ── 5. Report ─────────────────────────────────────────────────────────────
const { data: finalTopics } = await db
  .from('topics')
  .select('slug, name, section_key, sort_order')
  .eq('subject_id', subject.id)
  .order('sort_order')
const { data: finalLessons } = await db
  .from('lessons')
  .select('slug, status, topic_id, sort_order')
  .eq('subject_id', subject.id)
  .order('sort_order')

const bySection = {}
for (const t of finalTopics ?? []) {
  bySection[t.section_key] = (bySection[t.section_key] ?? 0) + 1
}
console.log('\ncurriculum:')
for (const key of ['A', 'B', 'C']) {
  const titles = (finalTopics ?? []).filter((t) => t.section_key === key)
  console.log(`  SECTION ${key}: ${titles.length} topics — ${titles[0]?.section_title ?? ''}`)
}
const published = (finalLessons ?? []).filter((l) => l.status === 'published').length
console.log(`\nlessons: ${published} published, ${(finalLessons ?? []).length - published} draft`)
console.log('done')
