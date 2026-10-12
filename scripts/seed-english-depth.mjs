// Seeds English depth blocks: 2 evidence-tapped passages, 4 minimal pairs,
// 2 sentence rebuilds, 2 reflections.
//
// Evidence offsets are COMPUTED from substrings (never hand-counted): each
// question declares evidenceStrings[], resolved to {paragraph,start,end} via
// indexOf at seed time. The script aborts if any substring is not found.
//
// Usage: node --env-file=.env scripts/seed-english-depth.mjs

import { createClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) {
  console.error('Missing Supabase env vars')
  process.exit(1)
}
const db = createClient(URL, KEY)

function span(paragraphs, paragraph, substring) {
  const text = paragraphs[paragraph]
  const start = text.indexOf(substring)
  if (start === -1) throw new Error(`Evidence substring not found: "${substring}"`)
  return { paragraph, start, end: start + substring.length }
}

const P1 = [
  'For many years, the residents of Kolo Creek depended entirely on a single hand-dug well. When the well ran dry each March, women and children walked over four kilometres to the next village to fetch water. The village council met several times to discuss the problem, but every meeting ended the same way: there was no money for a borehole.',
  'Everything changed when a team of engineers visited the community as part of a rural water scheme. They tested the soil, sank a borehole near the primary school, and trained three young people to maintain the pump. Within a year, cases of water-borne illness reported at the health centre fell by more than half, and school attendance rose because children no longer spent their mornings fetching water.',
  'The chairman of the council later admitted that the community had grown used to managing scarcity instead of solving it. “We treated the shortage as fate,” he said, “when it was only a problem waiting for a plan.” The borehole did not just bring water; it changed what the village believed was possible.',
]

const P2 = [
  'The rain had been falling since dawn, drumming steadily on the zinc roof of the bus park. Passengers huddled under the narrow shed, watching the road turn slowly into a brown river. A hawker moved among them, balancing her tray with practised ease, calling out prices that nobody answered. Yet there was no grumbling; strangers shared umbrellas, and a boy laughed as his paper boat spun away down the gutter.',
  'When the downpour finally eased, the driver clapped his hands and shouted that the journey would continue. People climbed aboard with damp clothes and good humour, as though the delay had been a small festival rather than an inconvenience. There is a patience in such moments that no timetable can teach.',
]

const passages = [
  {
    lesson: 'comprehension-tips',
    content: {
      title: 'Kolo Creek',
      purpose: 'what changed the village — and what the chairman really means',
      paragraphs: P1,
      questions: [
        {
          question: 'In paragraph 1, “there was no money for a borehole” shows that the council’s failure was mainly one of',
          skill: 'inference',
          options: [
            { key: 'A', text: 'resources, not awareness' },
            { key: 'B', text: 'interest in the villagers’ welfare' },
            { key: 'C', text: 'technical knowledge about wells' },
            { key: 'D', text: 'cooperation with neighbouring villages' },
          ],
          answer: 'A',
          explanation:
            'The council met “several times to discuss the problem” — they knew about it. What stopped them was money, not ignorance or indifference.',
          evidenceStrings: [
            { paragraph: 0, text: 'The village council met several times to discuss the problem' },
            { paragraph: 0, text: 'there was no money for a borehole' },
          ],
        },
        {
          question: 'The word “fate” as used by the chairman in paragraph 3 is closest in meaning to',
          skill: 'vocabulary in context',
          options: [
            { key: 'A', text: 'a sudden disaster' },
            { key: 'B', text: 'something unavoidable' },
            { key: 'C', text: 'a government policy' },
            { key: 'D', text: 'a religious duty' },
          ],
          answer: 'B',
          explanation:
            'He contrasts “fate” with “a problem waiting for a plan” — the village had treated the shortage as something that could not be changed, when it could.',
          evidenceStrings: [
            { paragraph: 2, text: 'grown used to managing scarcity instead of solving it' },
            { paragraph: 2, text: 'when it was only a problem waiting for a plan' },
          ],
        },
      ],
    },
  },
  {
    lesson: 'comprehension-tips',
    content: {
      title: 'Rain at the Bus Park',
      purpose: 'the mood of the waiting passengers — and what the writer admires',
      paragraphs: P2,
      questions: [
        {
          question: 'The writer’s attitude towards the stranded passengers is best described as',
          skill: 'tone',
          options: [
            { key: 'A', text: 'admiring' },
            { key: 'B', text: 'pitying' },
            { key: 'C', text: 'critical' },
            { key: 'D', text: 'indifferent' },
          ],
          answer: 'A',
          explanation:
            'Clues: “no grumbling”, “good humour”, “as though the delay had been a small festival”, and the closing praise of “a patience … no timetable can teach”.',
          evidenceStrings: [
            { paragraph: 0, text: 'Yet there was no grumbling' },
            { paragraph: 1, text: 'There is a patience in such moments that no timetable can teach' },
          ],
        },
      ],
    },
  },
]

const pairs = [
  {
    lesson: 'common-grammar-errors',
    content: {
      pair: ['The list of items are on the desk.', 'The list of items is on the desk.'],
      correctIndex: 1,
      rule: 'The verb agrees with the head noun (list), not with the noun nearest to it (items). Ignore prepositional phrases when finding the subject.',
      counterexample: 'The list of items is on the desk — but: The items on the desk are mine.',
    },
  },
  {
    lesson: 'common-grammar-errors',
    content: {
      pair: ['Neither the teacher nor the students was present.', 'Neither the teacher nor the students were present.'],
      correctIndex: 1,
      rule: 'With neither…nor, the verb agrees with the subject nearer to it — students, so were.',
      counterexample: 'Neither the students nor the teacher was present. (Nearer subject: teacher → was.)',
    },
  },
  {
    lesson: 'common-grammar-errors',
    content: {
      pair: ['He requested for permission to leave.', 'He requested permission to leave.'],
      correctIndex: 1,
      rule: 'Request is transitive here — it takes the object directly. “Request for” only appears in the noun phrase “a request for…”.',
      counterexample: 'She applied for the job (apply needs for), but: She requested an extension (request takes none).',
    },
  },
  {
    lesson: 'common-grammar-errors',
    content: {
      pair: ['The reason he left is because he was tired.', 'The reason he left is that he was tired.'],
      correctIndex: 1,
      rule: '“The reason is…” must be completed with a that-clause, not a because-clause — because already contains the reason, so the sentence repeats itself.',
      counterexample: 'The reason is that the road flooded — never “the reason is because…”.',
    },
  },
]

const rebuilds = [
  {
    lesson: 'common-grammar-errors',
    content: {
      prompt: 'Rebuild this into one correct sentence: “The boy who the teacher praised him passed the examination.”',
      answer: 'The boy whom the teacher praised passed the examination. (Accept: The boy who was praised by the teacher passed.)',
      rule: 'The relative pronoun already stands for the boy — adding “him” gives the clause two objects. One slot, one pronoun.',
    },
  },
  {
    lesson: 'common-grammar-errors',
    content: {
      prompt: 'Rebuild this into one correct sentence: “Hardly the referee had blown the whistle when the crowd rushed onto the pitch.”',
      answer: 'Hardly had the referee blown the whistle when the crowd rushed onto the pitch.',
      rule: 'Hardly/scarcely at the front forces inversion — auxiliary verb before the subject. No inversion, no mark.',
    },
  },
]

const reflections = [
  {
    lesson: 'comprehension-tips',
    content: {
      prompt: 'You just answered with evidence tapped first. On Saturday, will you read the passage first or the questions first — and which sentence from Kolo Creek would you point to as proof your method works?',
      modelResponse:
        'A strong answer names one method (“questions first, so I know what to hunt for”), one reason tied to evidence (“because my taps on the council sentences decided Q1 before I read the options”), and one fallback (“if the passage is narrative like the bus park, I read for mood first”). If your answer has all three, your method is exam-ready; if not, borrow the missing piece.',
    },
  },
  {
    lesson: 'common-grammar-errors',
    content: {
      prompt: 'Which of the four pairs above would still catch you under time pressure — and what one-second check will you run on every underlining that looks like it?',
      modelResponse:
        'A strong answer names the specific trap (“neither…nor distance agreement”), states the check as a physical habit (“cover the phrase between the subject and the verb, then re-read”), and gives the counterexample from memory. That check is your insurance policy on Saturday.',
    },
  },
]

const { data: subject } = await db.from('subjects').select('id').eq('slug', 'english').single()
if (!subject) throw new Error('english subject missing')

async function lessonId(slug) {
  const { data } = await db
    .from('lessons')
    .select('id')
    .eq('subject_id', subject.id)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  if (!data) throw new Error(`lesson missing: ${slug}`)
  return data.id
}

async function appendBlocks(lessonSlug, type, contents) {
  const id = await lessonId(lessonSlug)
  const { data: existing } = await db.from('lesson_blocks').select('id').eq('lesson_id', id)
  const position = existing?.length ?? 0
  const rows = contents.map((content, i) => ({ lesson_id: id, position: position + i, block_type: type, content }))
  const { error } = await db.from('lesson_blocks').insert(rows)
  if (error) throw new Error(`insert ${type} → ${lessonSlug}: ${error.message}`)
  console.log(`+ ${rows.length} ${type} → ${lessonSlug}`)
}

for (const p of passages) {
  const questions = p.content.questions.map((q) => ({
    question: q.question,
    skill: q.skill,
    options: q.options,
    answer: q.answer,
    explanation: q.explanation,
    evidence: q.evidenceStrings.map((e) => span(p.content.paragraphs, e.paragraph, e.text)),
  }))
  await appendBlocks(p.lesson, 'passage', [{ ...p.content, questions }])
}
for (const chunk of [
  ['minimal_pair', pairs],
  ['sentence_rebuild', rebuilds],
  ['reflection', reflections],
]) {
  const [type, items] = chunk
  for (const item of items) {
    await appendBlocks(item.lesson, type, [item.content])
  }
}
console.log('done')

