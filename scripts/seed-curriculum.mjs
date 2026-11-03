// Seeds one subject's curriculum file into Supabase.
//
// Usage:
//   node --env-file=.env scripts/seed-curriculum.mjs government
//   node --env-file=.env scripts/seed-curriculum.mjs content-folder/biology-curriculum.json
//   node --env-file=.env scripts/seed-curriculum.mjs government --dry-run
//
// The file shape is the one used by content-folder/government-curriculum.json:
//   { subject, source, topics: [{ slug, name, section, order, description,
//     syllabus_ref? }], lessons: [{ slug, topic?, title, objective,
//     estimatedMinutes?, blocks }] }
//
// Topics are matched by `syllabus_ref` first (so an authored topic lands on the
// spine row even when the slug differs), then by slug. A topic is published
// only when this file supplies a lesson for it, or when the row is already
// published, or when the topic sets `published: true` explicitly.
//
// Lessons are matched by (subject, slug), linked to their topic, and their
// blocks are replaced so re-running after an edit never duplicates them.
// Reviewer/source refs are preserved when the row already has them.

import { createClient } from '@supabase/supabase-js'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, isAbsolute, join, resolve } from 'node:path'

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const target = args.find((a) => !a.startsWith('--'))
if (!target) {
  console.error('Usage: node scripts/seed-curriculum.mjs <subject|file.json> [--dry-run]')
  process.exit(1)
}

const file = target.endsWith('.json')
  ? isAbsolute(target)
    ? target
    : resolve(target)
  : join('content-folder', `${target}-curriculum.json`)
if (!existsSync(file)) {
  console.error(`Curriculum file not found: ${file}`)
  process.exit(1)
}

const source = JSON.parse(readFileSync(file, 'utf8'))
if (!source.subject) throw new Error(`${file} has no "subject"`)

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) {
  console.error('Missing Supabase env vars')
  process.exit(1)
}
const db = createClient(URL, KEY)

const sectionKey = (title) =>
  String(title ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const { data: subject, error: subjectError } = await db
  .from('subjects')
  .select('id, slug')
  .eq('slug', source.subject)
  .single()
if (subjectError || !subject) throw new Error(`${source.subject} subject missing`)

// ── Topics ────────────────────────────────────────────────────────────────
const { data: existingTopics, error: topicsError } = await db
  .from('topics')
  .select('id, slug, syllabus_ref, published, sort_order, section_key, section_title')
  .eq('subject_id', subject.id)
if (topicsError) throw new Error(`load topics: ${topicsError.message}`)

// A syllabus reference can map to several topics after a split, so keep the
// rows as a list and only use the reference when it is unambiguous.
const byRef = new Map()
const bySlug = new Map()
for (const row of existingTopics ?? []) {
  if (row.syllabus_ref) {
    const rows = byRef.get(row.syllabus_ref) ?? []
    rows.push(row)
    byRef.set(row.syllabus_ref, rows)
  }
  bySlug.set(row.slug, row)
}

// Source slug → database topic row, so lessons can resolve either way.
const topicRowBySourceSlug = new Map()
const lessons = source.lessons ?? []
const lessonSlugs = new Set(lessons.map((l) => l.topic ?? l.slug))

// A row may be claimed by one source topic per run. Without this, every topic
// sharing a split syllabus reference would update the same row.
const claimedTopicIds = new Set()

let topicsInserted = 0
let topicsUpdated = 0
for (const t of source.topics ?? []) {
  // Slug first: a rename is expressed by keeping the row's slug stable. Fall
  // back to a syllabus reference only when exactly one unclaimed row has it.
  const refRows = (t.syllabus_ref && byRef.get(t.syllabus_ref)) || []
  const freeRefRows = refRows.filter((row) => !claimedTopicIds.has(row.id))
  const existing =
    bySlug.get(t.slug) ?? (freeRefRows.length === 1 ? freeRefRows[0] : undefined)
  const willPublish = Boolean(t.published) || lessonSlugs.has(t.slug) || Boolean(existing?.published)

  const row = {
    subject_id: subject.id,
    name: t.name,
    description: t.description ?? null,
    sort_order: t.order ?? existing?.sort_order ?? null,
    section_key: t.section ? sectionKey(t.section) : (existing?.section_key ?? null),
    section_title: t.section ?? existing?.section_title ?? null,
    published: willPublish,
  }
  if (t.syllabus_ref) row.syllabus_ref = t.syllabus_ref
  if (!existing) row.slug = t.slug

  if (existing) {
    claimedTopicIds.add(existing.id)
    topicRowBySourceSlug.set(t.slug, { ...existing, ...row, id: existing.id, slug: existing.slug })
    if (!dryRun) {
      const { error } = await db.from('topics').update(row).eq('id', existing.id)
      if (error) throw new Error(`update topic ${t.slug}: ${error.message}`)
    }
    topicsUpdated += 1
  } else {
    if (dryRun) {
      topicRowBySourceSlug.set(t.slug, { id: `new:${t.slug}`, slug: t.slug, ...row })
    } else {
      const { data, error } = await db.from('topics').insert(row).select('id, slug').single()
      if (error) throw new Error(`insert topic ${t.slug}: ${error.message}`)
      topicRowBySourceSlug.set(t.slug, { ...row, ...data })
    }
    topicsInserted += 1
  }
}
console.log(
  `topics: ${topicsInserted} insert, ${topicsUpdated} update${dryRun ? ' (dry run)' : ''}`,
)

// ── Lessons ───────────────────────────────────────────────────────────────
if (lessons.length === 0) {
  console.log('lessons: none in the curriculum file — question-bank phase only')
  process.exit(0)
}

const { data: existingLessons, error: lessonsError } = await db
  .from('lessons')
  .select('id, slug, reviewer, source_ref')
  .eq('subject_id', subject.id)
if (lessonsError) throw new Error(`load lessons: ${lessonsError.message}`)
const lessonBySlug = new Map((existingLessons ?? []).map((l) => [l.slug, l]))

let lessonsInserted = 0
let lessonsUpdated = 0
let blocksWritten = 0

for (const lesson of lessons) {
  const topicSlug = lesson.topic ?? lesson.slug
  const topic =
    topicRowBySourceSlug.get(topicSlug) ??
    bySlug.get(topicSlug) ??
    (lesson.syllabus_ref ? byRef.get(lesson.syllabus_ref) : undefined)
  if (!topic) throw new Error(`lesson ${lesson.slug} has no topic (${topicSlug})`)
  if (!lesson.blocks?.length) throw new Error(`lesson ${lesson.slug} has no blocks`)

  // A lesson can be authored against an existing spine row without repeating
  // the topic in this file. Publishing its first lesson makes the topic live.
  if (!topic.published) {
    if (!dryRun) {
      const { error } = await db.from('topics').update({ published: true }).eq('id', topic.id)
      if (error) throw new Error(`publish topic ${topicSlug}: ${error.message}`)
    }
    topic.published = true
    console.log(`  topic ${topicSlug} published by its first lesson`)
  }

  const existing = lessonBySlug.get(lesson.slug)
  const row = {
    subject_id: subject.id,
    topic_id: topic.id,
    slug: lesson.slug,
    title: lesson.title,
    objective: lesson.objective,
    estimated_minutes: lesson.estimatedMinutes ?? 10,
    sort_order:
      source.topics?.find((t) => t.slug === topicSlug)?.order ?? topic.sort_order ?? null,
    status: 'published',
    reviewer: existing?.reviewer ?? source.reviewer ?? `${source.subject}-curriculum`,
    source_ref: existing?.source_ref ?? source.sourceRef ?? `jamb-utme-${source.subject}#authored`,
  }

  let lessonId = existing?.id
  if (existing) {
    if (!dryRun) {
      const { error } = await db.from('lessons').update(row).eq('id', lessonId)
      if (error) throw new Error(`update lesson ${lesson.slug}: ${error.message}`)
    }
    lessonsUpdated += 1
  } else {
    if (dryRun) {
      lessonId = `new:${lesson.slug}`
    } else {
      const { data, error } = await db.from('lessons').insert(row).select('id').single()
      if (error) throw new Error(`insert lesson ${lesson.slug}: ${error.message}`)
      lessonId = data.id
    }
    lessonsInserted += 1
  }

  const blocks = lesson.blocks.map((block, position) => ({
    lesson_id: lessonId,
    position,
    block_type: block.type,
    content: block.content,
  }))
  if (!dryRun) {
    const { error: deleteError } = await db.from('lesson_blocks').delete().eq('lesson_id', lessonId)
    if (deleteError) throw new Error(`clear blocks ${lesson.slug}: ${deleteError.message}`)
    const { error: blockError } = await db.from('lesson_blocks').insert(blocks)
    if (blockError) throw new Error(`insert blocks ${lesson.slug}: ${blockError.message}`)
  }
  blocksWritten += blocks.length
  console.log(`  ${existing ? '~' : '+'} ${lesson.slug} (${blocks.length} blocks)`)
}

console.log(
  `lessons: ${lessonsInserted} insert, ${lessonsUpdated} update, ${blocksWritten} blocks${
    dryRun ? ' (dry run)' : ''
  }`,
)
