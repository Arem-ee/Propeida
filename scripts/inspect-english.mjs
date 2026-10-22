// Inspect the live English content state: subject, topics, notes, lessons,
// blocks and questions.
import { createClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const db = createClient(URL, KEY)

const { data: subject } = await db.from('subjects').select('*').eq('slug', 'english').single()
if (!subject) throw new Error('english subject missing')
console.log('subject:', JSON.stringify(subject))

const { data: topics } = await db
  .from('topics')
  .select('id, slug, name, title, order_index')
  .eq('subject_id', subject.id)
  .order('order_index')
console.log(`\ntopics (${topics?.length ?? 0}):`)
for (const t of topics ?? []) console.log('  ', t.slug, '|', t.name ?? t.title)

const { data: lessons } = await db
  .from('lessons')
  .select('id, slug, title, objective, status, version, estimated_minutes, topic_id')
  .eq('subject_id', subject.id)
  .order('slug')
console.log(`\nlessons (${lessons?.length ?? 0}):`)
for (const l of lessons ?? []) {
  const { count } = await db
    .from('lesson_blocks')
    .select('*', { count: 'exact', head: true })
    .eq('lesson_id', l.id)
  console.log(`  [${l.status}] ${l.slug}  blocks=${count}  v${l.version}  "${l.title}"`)
}

const { data: blocks } = await db
  .from('lesson_blocks')
  .select('block_type')
  .in('lesson_id', (lessons ?? []).map((l) => l.id))
const byType = {}
for (const b of blocks ?? []) byType[b.block_type] = (byType[b.block_type] ?? 0) + 1
console.log('\nblocks by type:', JSON.stringify(byType))

const { count: qCount } = await db
  .from('questions')
  .select('*', { count: 'exact', head: true })
  .eq('subject_id', subject.id)
console.log('\nenglish questions:', qCount)

const { data: qs } = await db
  .from('questions')
  .select('id, response_type, source, exam_id, topic_id, stem')
  .eq('subject_id', subject.id)
  .limit(1000)
const grouped = {}
for (const q of qs ?? []) {
  const k = `${q.response_type ?? 'mcq'} | ${q.source ?? 'none'}`
  grouped[k] = (grouped[k] ?? 0) + 1
}
console.log('questions by response_type|source:', JSON.stringify(grouped, null, 2))

console.log('\nsample stems:')
for (const q of (qs ?? []).slice(0, 6)) console.log('  -', (q.stem ?? '').slice(0, 110))
