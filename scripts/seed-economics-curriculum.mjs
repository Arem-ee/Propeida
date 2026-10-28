// Seeds the JAMB Economics curriculum spine, and any authored lessons listed
// in content-folder/economics-curriculum.json.
//
// Topics follow the official JAMB Economics syllabus, grouped into a teaching
// spine that matches the question topics. Lessons are optional: the first
// Economics phase publishes the question bank only, and lessons are added by
// filling the `lessons` array and re-running this script.
//
// Idempotent: topics and lessons are matched by slug and updated; lesson
// blocks are replaced so an edit never duplicates them.
//
// Usage: node --env-file=.env scripts/seed-economics-curriculum.mjs

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
  readFileSync(join(here, '..', 'content-folder', 'economics-curriculum.json'), 'utf8'),
)

const { data: subject, error: subjectError } = await db
  .from('subjects')
  .select('id, slug')
  .eq('slug', source.subject)
  .single()
if (subjectError || !subject) throw new Error(`${source.subject} subject missing`)

// ── Topics ────────────────────────────────────────────────────────────────
const sectionKey = (title) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const { data: existingTopics, error: topicsError } = await db
  .from('topics')
  .select('id, slug')
  .eq('subject_id', subject.id)
if (topicsError) throw new Error(`load topics: ${topicsError.message}`)
const topicIdBySlug = new Map((existingTopics ?? []).map((t) => [t.slug, t.id]))

for (const t of source.topics) {
  const row = {
    subject_id: subject.id,
    slug: t.slug,
    name: t.name,
    description: t.description,
    sort_order: t.order,
    section_key: sectionKey(t.section),
    section_title: t.section,
    published: true,
  }
  if (topicIdBySlug.has(t.slug)) {
    const { error } = await db.from('topics').update(row).eq('id', topicIdBySlug.get(t.slug))
    if (error) throw new Error(`update topic ${t.slug}: ${error.message}`)
  } else {
    const { data, error } = await db.from('topics').insert(row).select('id').single()
    if (error) throw new Error(`insert topic ${t.slug}: ${error.message}`)
    topicIdBySlug.set(t.slug, data.id)
  }
}
console.log(`topics: ${source.topics.length} written`)

// ── Lessons (optional) ────────────────────────────────────────────────────
const lessons = source.lessons ?? []
if (lessons.length === 0) {
  console.log('lessons: none in the curriculum file — question bank phase only')
  process.exit(0)
}

const { data: existingLessons, error: lessonsError } = await db
  .from('lessons')
  .select('id, slug')
  .eq('subject_id', subject.id)
if (lessonsError) throw new Error(`load lessons: ${lessonsError.message}`)
const lessonBySlug = new Map((existingLessons ?? []).map((l) => [l.slug, l]))

let lessonsWritten = 0
let blocksWritten = 0

for (const lesson of lessons) {
  const topicId = topicIdBySlug.get(lesson.topic ?? lesson.slug)
  if (!topicId) throw new Error(`lesson ${lesson.slug} has no topic`)

  const row = {
    subject_id: subject.id,
    topic_id: topicId,
    slug: lesson.slug,
    title: lesson.title,
    objective: lesson.objective,
    estimated_minutes: lesson.estimatedMinutes ?? 10,
    sort_order: source.topics.find((t) => t.slug === (lesson.topic ?? lesson.slug))?.order ?? null,
    status: 'published',
    reviewer: 'economics-phase-1',
    source_ref: 'jamb-utme-economics#authored',
  }

  let lessonId = lessonBySlug.get(lesson.slug)?.id
  if (lessonId) {
    const { error } = await db.from('lessons').update(row).eq('id', lessonId)
    if (error) throw new Error(`update lesson ${lesson.slug}: ${error.message}`)
  } else {
    const { data, error } = await db.from('lessons').insert(row).select('id').single()
    if (error) throw new Error(`insert lesson ${lesson.slug}: ${error.message}`)
    lessonId = data.id
    lessonBySlug.set(lesson.slug, data)
  }

  const { error: deleteError } = await db.from('lesson_blocks').delete().eq('lesson_id', lessonId)
  if (deleteError) throw new Error(`clear blocks ${lesson.slug}: ${deleteError.message}`)

  const rows = lesson.blocks.map((block, position) => ({
    lesson_id: lessonId,
    position,
    block_type: block.type,
    content: block.content,
  }))
  const { error: blockError } = await db.from('lesson_blocks').insert(rows)
  if (blockError) throw new Error(`insert blocks ${lesson.slug}: ${blockError.message}`)

  lessonsWritten += 1
  blocksWritten += rows.length
  console.log(`  + ${lesson.slug} (${rows.length} blocks)`)
}

console.log(`lessons: ${lessonsWritten} published, ${blocksWritten} blocks`)
