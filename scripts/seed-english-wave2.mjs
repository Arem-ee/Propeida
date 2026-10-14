// English depth wave 2: 3 passages (argumentative, instructional, literary)
// + 6 minimal pairs (articles, prepositions, sequence of tenses,
// subjunctive, dangling participle, question tags).
// Evidence offsets computed from substrings; aborts if any is missing.
// Usage: node --env-file=.env scripts/seed-english-wave2.mjs

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

const P3 = [
  'Every examination season brings the same proposal: shut down social media until the last paper is written. Its supporters argue that leaked questions and coordinated cheating spread through phones faster than any invigilator can respond. They point to cancelled results and withheld scripts as proof that the examination system is bleeding, and they insist that a temporary blackout is a small price for credibility.',
  'The proposal sounds decisive, but it mistakes the channel for the cause. Questions leak because printing and distribution chains are compromised long before candidates open an app; cheating centres operate with or without a network signal. A shutdown would punish millions of innocent users — traders, patients, emergency responders — while the syndicates simply switch to offline methods they used for decades.',
  'The honest fix is narrower and harder: secure the printing presses, rotate question sets, and prosecute the officials who sell them. A society that reaches for a blackout every time it faces malpractice is confessing that it cannot police its own gates. The phone did not break the examination; the gatekeepers did.',
]

const P4 = [
  'To make a simple water filter, you need a clean plastic bottle, gravel, sand, charcoal, and cotton wool. First, cut off the bottom of the bottle and turn it upside down so the neck points downwards. Place a layer of cotton wool in the neck to stop fine particles escaping, then add crushed charcoal to remove odour and taste. Above the charcoal, pour a thick layer of fine sand, and finish with a layer of gravel to trap the largest impurities.',
  'Pour the dirty water slowly through the wide opening and collect what drips from the neck. The water will look clearer, but it is not yet safe: boiling it for at least five minutes destroys the germs that filtering cannot remove. A filter clarifies; only heat sterilises. Anyone who drinks the filtered water without boiling it has completed only half the task.',
]

const P5 = [
  'The market did not close so much as dissolve. Lanterns bloomed one by one above the stalls while the last daylight thinned into a violet haze, and the bargaining — fierce at noon — softened into banter. A woman folded her remaining peppers into a basin with the tenderness of someone putting children to bed, and the scent of roasting corn drifted through the lanes like a rumour.',
  'Alaba lingered at the gate, unwilling to break the spell. The day had taken his money, his patience, and very nearly his temper, yet standing there in the blue dusk he felt oddly repaid. Some places do not merely sell you things, he thought; they return you to yourself, slightly mended.',
]

const passages = [
  {
    content: {
      title: 'The Blackout Proposal',
      purpose: 'whether the writer supports the shutdown — and where he places the blame',
      paragraphs: P3,
      questions: [
        {
          question: 'The writer’s position on the social media shutdown is that it is',
          skill: 'main idea',
          options: [
            { key: 'A', text: 'necessary and overdue' },
            { key: 'B', text: 'a punishment of the innocent that misses the cause' },
            { key: 'C', text: 'the only way to stop cheating centres' },
            { key: 'D', text: 'unfair only to traders and patients' },
          ],
          answer: 'B',
          explanation:
            'Paragraph 2 calls it punishing “millions of innocent users” while syndicates “switch to offline methods”; paragraph 3 demands securing presses instead. The writer opposes it because it misses the cause.',
          evidenceStrings: [
            { paragraph: 1, text: 'it mistakes the channel for the cause' },
            { paragraph: 1, text: 'punish millions of innocent users' },
          ],
        },
        {
          question: '“It cannot police its own gates” (paragraph 3) implies that the authorities are',
          skill: 'inference',
          options: [
            { key: 'A', text: 'understaffed at examination halls' },
            { key: 'B', text: 'unable to control the officials within their own system' },
            { key: 'C', text: 'opposed to technology in examinations' },
            { key: 'D', text: 'unaware of how questions leak' },
          ],
          answer: 'B',
          explanation:
            'The sentence follows the call to “prosecute the officials who sell” papers and closes with “the gatekeepers did” break the exam — the failure is internal, not technical.',
          evidenceStrings: [
            { paragraph: 2, text: 'prosecute the officials who sell them' },
            { paragraph: 2, text: 'the gatekeepers did' },
          ],
        },
      ],
    },
  },
  {
    content: {
      title: 'The Water Filter',
      purpose: 'the correct order of the layers — and what filtering alone cannot do',
      paragraphs: P4,
      questions: [
        {
          question: 'According to the passage, the charcoal layer comes',
          skill: 'sequence',
          options: [
            { key: 'A', text: 'directly above the cotton wool' },
            { key: 'B', text: 'between the sand and the gravel' },
            { key: 'C', text: 'at the very top of the bottle' },
            { key: 'D', text: 'below the bottle neck' },
          ],
          answer: 'A',
          explanation:
            'Order from the neck upward: cotton wool, then charcoal (“add crushed charcoal”), then sand, then gravel. Charcoal sits directly above the cotton wool.',
          evidenceStrings: [
            { paragraph: 0, text: 'Place a layer of cotton wool in the neck' },
            { paragraph: 0, text: 'then add crushed charcoal' },
          ],
        },
        {
          question: '“Only heat sterilises” means that filtering',
          skill: 'inference',
          options: [
            { key: 'A', text: 'is a waste of time' },
            { key: 'B', text: 'removes germs but not dirt' },
            { key: 'C', text: 'makes water clear but not germ-free' },
            { key: 'D', text: 'should be done after boiling' },
          ],
          answer: 'C',
          explanation:
            'The passage says filtered water “will look clearer, but it is not yet safe” and must be boiled — filtering clarifies appearance; boiling kills germs.',
          evidenceStrings: [
            { paragraph: 1, text: 'The water will look clearer, but it is not yet safe' },
            { paragraph: 1, text: 'A filter clarifies; only heat sterilises' },
          ],
        },
      ],
    },
  },
  {
    content: {
      title: 'Blue Dusk',
      purpose: 'the mood of the closing market — and what Alaba takes home',
      paragraphs: P5,
      questions: [
        {
          question: 'The dominant mood of the passage is one of',
          skill: 'tone',
          options: [
            { key: 'A', text: 'anger at the day’s losses' },
            { key: 'B', text: 'gentle, reconciled calm' },
            { key: 'C', text: 'anxiety about the coming night' },
            { key: 'D', text: 'mockery of market life' },
          ],
          answer: 'B',
          explanation:
            'Despite the day taking “his money, his patience, and very nearly his temper”, Alaba feels “oddly repaid” and “slightly mended” — loss resolved into calm, not anger or fear.',
          evidenceStrings: [
            { paragraph: 1, text: 'he felt oddly repaid' },
            { paragraph: 1, text: 'they return you to yourself, slightly mended' },
          ],
        },
      ],
    },
  },
]

const pairs = [
  {
    content: {
      pair: ['She plays piano very well.', 'She plays the piano very well.'],
      correctIndex: 1,
      rule: 'Instruments take the definite article: play the piano, the guitar, the drums. Drop it only for the activity in general (“Piano is fun”).',
      counterexample: 'He plays the guitar — but: Guitar music filled the hall (general, no article).',
    },
  },
  {
    content: {
      pair: ['The meeting is on Monday morning at 10 o’clock.', 'The meeting is in Monday morning at 10 o’clock.'],
      correctIndex: 0,
      rule: 'Time ladder: at for clock times (at 10), on for days and dated mornings (on Monday, on Monday morning), in for months/years/periods (in June, in the morning).',
      counterexample: 'On Monday morning at 10 — never “in Monday”. But: in the morning (no day named).',
    },
  },
  {
    content: {
      pair: ['She said she will come tomorrow.', 'She said she would come the next day.'],
      correctIndex: 1,
      rule: 'Reported speech steps the tense back: will → would, and the time marker shifts (tomorrow → the next day). The reporting verb “said” is past, so the whole clause follows it.',
      counterexample: 'She says she will come tomorrow (present reporting verb — no shift). She said she would come.',
    },
  },
  {
    content: {
      pair: ['The principal suggested that he goes home.', 'The principal suggested that he go home.'],
      correctIndex: 1,
      rule: 'Suggest, insist, demand, recommend take the base form (subjunctive): no -s, no tense. “Suggested that he go”, never “goes” or “went”.',
      counterexample: 'They insisted that she stay — never “stays”. Test with: The rule demands it be so (not “is”).',
    },
  },
  {
    content: {
      pair: ['Walking home, the rain started suddenly.', 'Walking home, I was caught by sudden rain.'],
      correctIndex: 1,
      rule: 'An opening -ing phrase must describe the subject that follows. Rain cannot walk — attach the phrase to the walker (I), or the sentence dangles.',
      counterexample: 'Exhausted, the team slept (team can be exhausted ✓). Exhausted, the whistle blew (whistle cannot ✗).',
    },
  },
  {
    content: {
      pair: ['You are coming with us, isn’t it?', 'You are coming with us, aren’t you?'],
      correctIndex: 1,
      rule: 'Question tags echo the statement’s auxiliary and subject: are + you → aren’t you. “Isn’t it” answers nothing in this sentence — it is the tag of last resort, not a universal one.',
      counterexample: 'She can swim, can’t she? They left early, didn’t they? (Match auxiliary + pronoun every time.)',
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
  await appendBlocks('comprehension-tips', 'passage', [{ ...p.content, questions }])
}
for (const item of pairs) {
  await appendBlocks('common-grammar-errors', 'minimal_pair', [item.content])
}
console.log('done')
