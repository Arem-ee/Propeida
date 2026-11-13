// What is actually in the English bank, and what would a JAMB paper need?
import { createClient } from '@supabase/supabase-js'

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const { data: subject } = await db.from('subjects').select('id').eq('slug', 'english').single()

console.log('=== config tables ===')
for (const t of ['exam_config', 'exam_configs', 'exam_sections', 'exam_question_pool', 'mock_exam_config', 'exam_section_config']) {
  const { data, error } = await db.from(t).select('*').limit(5)
  console.log(`  ${t}: ${error ? 'MISSING (' + error.message.slice(0, 40) + ')' : `${data.length} rows`}`)
}

const { data: qs } = await db
  .from('questions')
  .select('id, question_text, options, difficulty, source, response_type')
  .eq('subject_id', subject.id)

console.log(`\n=== ${qs.length} english questions: what do they look like? ===`)

// Classify by the shape of the item, which is what actually matters.
const kinds = {
  'odd-one-out': (t) => /odd one out|odd-one-out/i.test(t),
  'fill-the-blank (single word)': (t) => /_{2,}|\b__________/.test(t),
  'homophone / rhyme pair': (t) => /rhym|homophon|sound/i.test(t),
  'phrase/idiom in a sentence': (t) => /passing a|the .* of the .* is|meaning/i.test(t),
  'passage-based (shared stem)': (t) => /^(passage|read the|according to the)\b/i.test(t),
  'long stem (>200 chars)': (t) => t.length > 200,
}

const counts = {}
for (const q of qs) {
  let matched = false
  for (const [name, fn] of Object.entries(kinds)) {
    if (fn(q.question_text)) {
      counts[name] = (counts[name] ?? 0) + 1
      matched = true
      break
    }
  }
  if (!matched) counts['other short-stem MCQ'] = (counts['other short-stem MCQ'] ?? 0) + 1
}
for (const [k, v] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(v).padStart(4)}  ${k}  (${((v / qs.length) * 100).toFixed(0)}%)`)
}

const lengths = qs.map((q) => q.question_text.length).sort((a, b) => a - b)
console.log(`\n  stem length: median ${lengths[Math.floor(lengths.length / 2)]}, max ${lengths[lengths.length - 1]}`)

console.log('\n=== 12 random stems ===')
for (const q of qs.filter((_, i) => i % 27 === 0).slice(0, 12)) {
  console.log(`  - ${q.question_text.slice(0, 120)}`)
}

console.log('\n=== any passage-style questions at all? ===')
const long = qs.filter((q) => q.question_text.length > 150)
console.log(`  questions with a stem over 150 characters: ${long.length}`)
for (const q of long.slice(0, 5)) console.log(`    * ${q.question_text.slice(0, 150)}`)
