// Inspect the live English question bank.
import { createClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const db = createClient(URL, KEY)

const { data: subject } = await db.from('subjects').select('id').eq('slug', 'english').single()
const { data: exams } = await db.from('exams').select('id, slug, name').order('slug')
console.log('exams:')
for (const e of exams ?? []) console.log('  ', e.slug, '|', e.name)

const { data: qs, error } = await db
  .from('questions')
  .select('id, exam_id, response_type, source, difficulty, question_text, options')
  .eq('subject_id', subject.id)
  .limit(2000)
if (error) throw error

console.log(`\nenglish questions: ${qs.length}`)

const byExam = {}
const byType = {}
const byDiff = {}
const bySource = {}
for (const q of qs) {
  byExam[q.exam_id] = (byExam[q.exam_id] ?? 0) + 1
  byType[q.response_type ?? 'mcq'] = (byType[q.response_type ?? 'mcq'] ?? 0) + 1
  byDiff[q.difficulty] = (byDiff[q.difficulty] ?? 0) + 1
  bySource[q.source ?? 'none'] = (bySource[q.source ?? 'none'] ?? 0) + 1
}
const examName = Object.fromEntries((exams ?? []).map((e) => [e.id, e.slug]))
console.log('\nby exam:')
for (const [id, n] of Object.entries(byExam)) console.log(`  ${examName[id] ?? id}: ${n}`)
console.log('\nby response_type:', JSON.stringify(byType))
console.log('by difficulty:', JSON.stringify(byDiff))
console.log('by source:', JSON.stringify(bySource))

const withTopic = qs.filter((q) => null).length
console.log('\nquestions with topic_id:', withTopic)

console.log('\nsample:')
for (const q of qs.slice(0, 8)) {
  console.log(`  [${examName[q.exam_id]}] ${q.question_text.slice(0, 120)}`)
}

