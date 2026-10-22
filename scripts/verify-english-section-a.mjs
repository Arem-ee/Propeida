// Verify the Section A lessons: block counts, passage shapes, and that
// every stored evidence span still lands inside a sentence of its passage.
import { createClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const db = createClient(URL, KEY)

const SLUGS = [
  'passage-description',
  'passage-narration',
  'passage-exposition',
  'passage-argumentation',
  'summary-writing',
  'cloze-test-technique',
]

const { data: subject } = await db.from('subjects').select('id').eq('slug', 'english').single()

function splitSentences(text) {
  const out = []
  const re = /[^.!?]+[.!?]+["”']?/g
  let m
  while ((m = re.exec(text)) !== null) {
    out.push({ start: m.index, end: m.index + m[0].length })
  }
  return out
}

let problems = 0
for (const slug of SLUGS) {
  const { data: lesson } = await db
    .from('lessons')
    .select('id, slug, title, status, objective, estimated_minutes, sort_order')
    .eq('subject_id', subject.id)
    .eq('slug', slug)
    .single()
  if (!lesson) {
    console.log(`MISSING ${slug}`)
    problems += 1
    continue
  }

  const { data: blocks } = await db
    .from('lesson_blocks')
    .select('position, block_type, content')
    .eq('lesson_id', lesson.id)
    .order('position')

  const types = {}
  let qCount = 0
  let badEvidence = 0
  const missingText = []

  for (const b of blocks ?? []) {
    types[b.block_type] = (types[b.block_type] ?? 0) + 1
    if (b.block_type === 'text') {
      const c = b.content
      if (!c.heading) missingText.push(`text@${b.position} no heading`)
      if (!Array.isArray(c.paragraphs) || c.paragraphs.length === 0)
        missingText.push(`text@${b.position} no paragraphs`)
      if (!Array.isArray(c.bullets) || c.bullets.length === 0)
        missingText.push(`text@${b.position} no bullets`)
    }
    if (b.block_type === 'passage') {
      const c = b.content
      qCount += c.questions.length
      for (const q of c.questions) {
        for (const ev of q.evidence) {
          const para = c.paragraphs[ev.paragraph]
          if (para === undefined) {
            badEvidence += 1
            continue
          }
          const sents = splitSentences(para)
          const hits = sents.filter((s) => s.start < ev.end && ev.start < s.end)
          if (hits.length === 0) badEvidence += 1
        }
      }
    }
    if (b.block_type === 'worked_example') {
      const steps = b.content.steps ?? []
      if (steps.length === 0) missingText.push(`worked_example@${b.position} no steps`)
      for (const s of steps) {
        if (!s.operation || !s.reason || !s.result)
          missingText.push(`worked_example@${b.position} step missing a field`)
      }
    }
    if (b.block_type === 'guided_question') {
      if (!b.content.question) missingText.push(`guided_question@${b.position} no question`)
      if (!Array.isArray(b.content.hints) || b.content.hints.length === 0)
        missingText.push(`guided_question@${b.position} no hints`)
    }
  }

  const problemsHere = badEvidence + missingText.length
  problems += problemsHere
  console.log(
    `${slug.padEnd(26)} ${lesson.status.padEnd(10)} blocks=${String(blocks?.length ?? 0).padStart(2)} ` +
      `q=${String(qCount).padStart(2)} evidence_bad=${badEvidence} issues=${missingText.length} ` +
      `order=${lesson.sort_order}`,
  )
  console.log(`   types: ${JSON.stringify(types)}`)
  for (const m of missingText) console.log(`   ! ${m}`)
}

console.log(problems === 0 ? '\nALL OK' : `\n${problems} problems`)
