// Verify the English curriculum spine: topics, sections, lesson links, and
// any published lesson or topic that has no home.
import { createClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const db = createClient(URL, KEY)

const { data: subject } = await db.from('subjects').select('id').eq('slug', 'english').single()

const { data: topics } = await db
  .from('topics')
  .select('id, slug, name, sort_order, section_key, section_title, published')
  .eq('subject_id', subject.id)
  .order('sort_order', { ascending: true })

const { data: lessons } = await db
  .from('lessons')
  .select('id, slug, title, status, topic_id, sort_order')
  .eq('subject_id', subject.id)
  .order('sort_order', { ascending: true })

const lessonByTopic = new Map()
for (const l of lessons ?? []) if (l.topic_id) lessonByTopic.set(l.topic_id, l)

console.log(`topics: ${topics.length}   lessons: ${lessons.length}\n`)
console.log('SECTION | #  | topic slug                        | lesson (status)')
console.log('-'.repeat(78))
for (const t of topics ?? []) {
  const l = lessonByTopic.get(t.id)
  console.log(
    `${(t.section_key ?? '-').padEnd(7)} | ${String(t.sort_order).padStart(2)} | ` +
      `${t.slug.padEnd(32)} | ${l ? `${l.slug} (${l.status})` : '— none —'}`,
  )
}

const curriculumSlugs = new Set(
  (topics ?? []).filter((t) => t.section_key).map((t) => t.slug),
)
const stray = (topics ?? []).filter((t) => !t.section_key)
console.log('\ntopics outside the syllabus spine:')
if (stray.length === 0) console.log('  none')
for (const t of stray) {
  const l = lessonByTopic.get(t.id)
  console.log(`  ${t.slug} (order ${t.sort_order}) → lesson: ${l ? l.slug : 'none'}`)
}

const orphanLessons = (lessons ?? []).filter((l) => !l.topic_id)
console.log('\nlessons with no topic:')
if (orphanLessons.length === 0) console.log('  none')
for (const l of orphanLessons) console.log(`  ${l.slug} (${l.status})`)

const published = (lessons ?? []).filter((l) => l.status === 'published')
console.log(`\npublished lessons: ${published.length}`)
for (const l of published) {
  const t = (topics ?? []).find((x) => x.id === l.topic_id)
  console.log(`  ${l.slug.padEnd(30)} → ${t ? `${t.section_key} · ${t.slug}` : 'NO TOPIC'}`)
}
