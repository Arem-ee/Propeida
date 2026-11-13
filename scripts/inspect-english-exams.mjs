// What exams include English, and what does the JAMB exam expect of it?
import { createClient } from '@supabase/supabase-js'

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const { data: subject } = await db.from('subjects').select('id, slug, name').eq('slug', 'english').single()
const { data: exams } = await db.from('exams').select('id, slug, name').order('slug')

console.log('=== exams that include English ===')
const { data: links } = await db.from('exam_subjects').select('exam_id, subject_id')
for (const e of exams ?? []) {
  const has = (links ?? []).some((l) => l.exam_id === e.id && l.subject_id === subject.id)
  const { count } = await db
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('exam_id', e.id)
    .eq('subject_id', subject.id)
    .eq('status', 'published')
  console.log(`  ${has ? 'YES' : ' no'}  ${e.slug.padEnd(20)} english questions: ${count ?? 0}`)
}

console.log('\n=== the jamb exam config ===')
for (const table of ['exam_configs', 'exam_sections', 'exam_config']) {
  const { data } = await db.from(table).select('*').limit(50)
  if (data && data.length) {
    console.log(`\n${table}:`)
    for (const row of data) console.log('  ', JSON.stringify(row))
  }
}

console.log('\n=== exam-related tables ===')
for (const t of ['exams', 'exam_subjects', 'exam_config', 'exam_configs', 'exam_question_pool', 'mock_exam_config']) {
  const { data, error } = await db.from(t).select('*').limit(60)
  if (error) {
    console.log(`  ${t}: ${error.message.slice(0, 60)}`)
    continue
  }
  console.log(`\n${t} (${data.length}):`)
  for (const row of data) console.log('  ', JSON.stringify(row).slice(0, 220))
}
