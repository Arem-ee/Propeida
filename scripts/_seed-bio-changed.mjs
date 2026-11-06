// Targeted, retry-safe reseed for the authored Biology curriculum.
//
// Compares every lesson in content-folder/biology-curriculum.json with the
// matching Supabase row and only rewrites lessons whose metadata or blocks
// differ. Safe to re-run after a transient fetch failure.
//
// Usage: node --env-file=.env scripts/_seed-bio-changed.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) {
  console.error('Missing Supabase env vars')
  process.exit(1)
}
if (!URL.includes('yaglpxybwmmpzbzgixkr.supabase.co')) {
  console.error(`Unexpected Supabase host: ${URL}`)
  process.exit(1)
}

const db = createClient(URL, KEY, { auth: { persistSession: false } })
const source = JSON.parse(readFileSync(process.argv[2] || 'content-folder/biology-curriculum.json', 'utf8'))

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function retry(label, fn, attempts = 6) {
  let lastError
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const result = await fn()
      if (result?.error) throw new Error(result.error.message)
      return result
    } catch (error) {
      lastError = error
      if (attempt === attempts) break
      const wait = 800 * 2 ** (attempt - 1)
      console.log(`  retry ${attempt}/${attempts - 1} ${label}: ${error.message} (wait ${wait}ms)`)
      await delay(wait)
    }
  }
  throw new Error(`${label}: ${lastError?.message ?? lastError}`)
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable)
  if (value && typeof value === 'object') {
    const out = {}
    for (const key of Object.keys(value).sort()) out[key] = stable(value[key])
    return out
  }
  return value
}
const fingerprint = (value) => JSON.stringify(stable(value))

const { data: subject, error: subjectError } = await retry('load subject', () =>
  db.from('subjects').select('id, slug').eq('slug', source.subject).single(),
)
if (subjectError || !subject) throw new Error('biology subject missing')

const { data: topics } = await retry('load topics', () =>
  db.from('topics').select('id, slug, published, sort_order').eq('subject_id', subject.id),
)
const topicBySlug = new Map((topics ?? []).map((t) => [t.slug, t]))

const { data: lessons } = await retry('load lessons', () =>
  db.from('lessons').select('id, slug').eq('subject_id', subject.id),
)
const lessonBySlug = new Map((lessons ?? []).map((l) => [l.slug, l]))

// Fetch blocks in pages so we never rely on the default 1000-row cap.
const lessonIds = new Set((lessons ?? []).map((l) => l.id))
const blocksByLesson = new Map()
for (let from = 0; ; from += 1000) {
  const { data, error } = await retry(`load blocks ${from}`, () =>
    db
      .from('lesson_blocks')
      .select('lesson_id, position, block_type, content')
      .order('lesson_id')
      .order('position')
      .range(from, from + 999),
  )
  if (error) throw new Error(error.message)
  for (const row of data ?? []) {
    if (!lessonIds.has(row.lesson_id)) continue
    const list = blocksByLesson.get(row.lesson_id) ?? []
    list.push(row)
    blocksByLesson.set(row.lesson_id, list)
  }
  if ((data ?? []).length < 1000) break
}

const publishTopic = async (slug, topic) => {
  if (topic.published) return topic
  console.log(`  publish topic ${slug}`)
  await retry(`publish topic ${slug}`, () =>
    db.from('topics').update({ published: true }).eq('id', topic.id),
  )
  return { ...topic, published: true }
}

let changedLessons = 0
let unchangedLessons = 0
let blocksWritten = 0
const changedSlugs = []

for (const lesson of source.lessons ?? []) {
  const topicSlug = lesson.topic ?? lesson.slug
  const topic = topicBySlug.get(topicSlug)
  if (!topic) throw new Error(`lesson ${lesson.slug} has no topic row (${topicSlug})`)
  const liveTopic = await publishTopic(topicSlug, topic)

  const existing = lessonBySlug.get(lesson.slug)
  const desiredBlocks = (lesson.blocks ?? []).map((block, position) => ({
    position,
    block_type: block.type,
    content: block.content,
  }))
  const currentBlocks = (blocksByLesson.get(existing?.id) ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((block) => ({
      position: block.position,
      block_type: block.block_type,
      content: block.content,
    }))

  const metadata = {
    topic_id: liveTopic.id,
    title: lesson.title,
    objective: lesson.objective,
    estimated_minutes: lesson.estimatedMinutes ?? 10,
    sort_order: source.topics?.find((t) => t.slug === topicSlug)?.order ?? liveTopic.sort_order ?? null,
    status: 'published',
  }

  const blocksMatch = fingerprint(desiredBlocks) === fingerprint(currentBlocks)
  if (existing && blocksMatch) {
    unchangedLessons += 1
    continue
  }

  changedLessons += 1
  changedSlugs.push(lesson.slug)

  let lessonId = existing?.id
  if (existing) {
    await retry(`update lesson ${lesson.slug}`, () =>
      db.from('lessons').update(metadata).eq('id', lessonId),
    )
  } else {
    const { data } = await retry(`insert lesson ${lesson.slug}`, () =>
      db
        .from('lessons')
        .insert({
          ...metadata,
          subject_id: subject.id,
          slug: lesson.slug,
          reviewer: source.reviewer ?? `${source.subject}-curriculum`,
          source_ref: source.sourceRef ?? `jamb-utme-${source.subject}#authored`,
        })
        .select('id')
        .single(),
    )
    lessonId = data.id
  }

  const rows = desiredBlocks.map((block) => ({ ...block, lesson_id: lessonId }))
  await retry(`clear blocks ${lesson.slug}`, () =>
    db.from('lesson_blocks').delete().eq('lesson_id', lessonId),
  )
  await retry(`insert blocks ${lesson.slug}`, () => db.from('lesson_blocks').insert(rows))
  blocksWritten += rows.length
  console.log(`  ~ ${lesson.slug} (${rows.length} blocks)`)
}

console.log(
  `\nchanged ${changedLessons} lessons, unchanged ${unchangedLessons}, ${blocksWritten} blocks rewritten`,
)
console.log(changedSlugs.join(', '))
