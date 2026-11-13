// Validates content-folder/maths-jamb-bank-extension.json before any import.
// Exits non-zero on any defect. Writes nothing.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const read = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'))

const curriculum = read('content-folder/mathematics-curriculum.json')
const base = read('content-folder/maths-jamb-bank.json')
const ext = read('content-folder/maths-jamb-bank-extension.json')

const curriculumSlugs = new Set(curriculum.topics.map((t) => t.slug))
const baseTopics = new Set(base.questions.map((q) => q.topic))
const baseTexts = new Set(base.questions.map((q) => q.question.trim()))

const defects = []
const perTopic = {}
const perDifficulty = { easy: 0, medium: 0, hard: 0 }
const seen = new Set()

for (const [i, q] of ext.questions.entries()) {
  const at = `questions[${i}] (${q.topic})`
  const fail = (msg) => defects.push(`${at}: ${msg}`)

  if (!q.question || !q.question.trim()) fail('empty question text')
  if (!q.explanation || !q.explanation.trim()) fail('empty explanation')
  if (!['easy', 'medium', 'hard'].includes(q.difficulty)) fail(`bad difficulty "${q.difficulty}"`)
  if (!curriculumSlugs.has(q.topic)) fail(`topic "${q.topic}" not in mathematics-curriculum.json`)
  if (baseTopics.has(q.topic)) fail(`topic "${q.topic}" already covered by maths-jamb-bank.json — extension must be disjoint`)

  const keys = (q.options ?? []).map((o) => String(o.key).toLowerCase())
  if (keys.length !== 4 || keys.join(',') !== 'a,b,c,d') fail(`option keys not exactly a,b,c,d (got ${keys.join(',') || 'none'})`)
  const texts = (q.options ?? []).map((o) => String(o.text).trim())
  if (new Set(texts).size !== texts.length) fail('duplicate option texts')
  if (texts.some((t) => !t)) fail('empty option text')

  const answer = String(q.answer ?? '').toLowerCase()
  if (!['a', 'b', 'c', 'd'].includes(answer)) fail(`answer "${q.answer}" not a-d`)
  else if (!keys.includes(answer)) fail(`answer "${answer}" not among option keys`)

  const text = (q.question ?? '').trim()
  if (seen.has(text)) fail('duplicate question text within extension')
  seen.add(text)
  if (baseTexts.has(text)) fail('question text duplicates maths-jamb-bank.json')

  perTopic[q.topic] = (perTopic[q.topic] ?? 0) + 1
  perDifficulty[q.difficulty] = (perDifficulty[q.difficulty] ?? 0) + 1
}

console.log(`extension questions: ${ext.questions.length}`)
console.log(`topics covered:      ${Object.keys(perTopic).length}`)
console.log('per topic:')
for (const [slug, n] of Object.entries(perTopic).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(3)}  ${slug}`)
}
console.log(`difficulty: easy ${perDifficulty.easy} / medium ${perDifficulty.medium} / hard ${perDifficulty.hard}`)

const uncovered = [...curriculumSlugs].filter((s) => !perTopic[s] && !baseTopics.has(s))
if (uncovered.length > 0) {
  console.log(`\nNOT covered by base bank or extension (${uncovered.length}):`)
  for (const s of uncovered) console.log(`  - ${s}`)
} else {
  console.log('\nAll curriculum topics are covered by base bank + extension.')
}

if (defects.length > 0) {
  console.error(`\n${defects.length} DEFECT(S):`)
  for (const d of defects) console.error(`  ! ${d}`)
  process.exit(1)
}
console.log('\nformat check: OK')
