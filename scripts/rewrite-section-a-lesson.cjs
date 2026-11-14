// Rewrites the ten blocks of the "Section A Set and Synthesis" lesson in
// the live lessons DB. Plain language, common words, terms defined at
// first use. Check answers/explanations kept but simplified.
// Usage: node --env-file=.env scripts/rewrite-section-a-lesson.cjs
const fs = require('fs')
const { createClient } = require('@supabase/supabase-js')

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
)

const LESSON_ID = 'e6bfa127-01a3-4d5b-bf75-da67881bc8f5'

const blocks = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
const backupPath = process.argv[3] ?? './section-a-backup.json'
fs.writeFileSync(backupPath, JSON.stringify(blocks, null, 2))
console.log('backed up', blocks.length, 'blocks to', backupPath)

const rewritten = [
  // 0 — intro
  {
    position: 0,
    block_type: 'text',
    content: {
      bullets: [],
      heading: 'What Section A is',
      paragraphs: [
        'Section A is the reading part of the English paper. You read short passages and answer questions on them.',
        'It has three parts: one comprehension passage (a short text you read and answer questions on), one cloze passage (a passage with missing words that you fill in — a “cloze” is just a passage with gaps), and ten questions on the one novel everyone was told to read. For 2026, that novel is The Lekki Headmaster by Kabir Alabi Garba.',
        'That is all there is to it. Short passages, one skill: reading carefully.',
      ],
    },
  },
  // 1 — the three parts
  {
    position: 1,
    block_type: 'text',
    content: {
      check: {
        why: 'Section A is made of one comprehension passage, one cloze passage and ten questions on the novel.',
        answer: 1,
        options: [
          'one long passage only',
          'one comprehension passage, one cloze and ten questions on the novel',
          'four short poems on one topic',
          'one legal document with questions',
        ],
        question: 'Which of these makes up Section A?',
      },
      bullets: [
        'Each passage is about 200 words — short enough to read twice.',
        'The topics change all the time — science, history, economics, health — but the skill does not: read quickly, understand deeply.',
        'You are not tested on the subjects. You are tested on reading.',
      ],
      heading: 'What the three parts are',
      takeaway: 'Section A is three short tasks: read a passage, fill in the gaps, answer ten questions on the novel.',
      paragraphs: [
        'Section A is three separate tasks on one paper. They sit together, but they are marked separately.',
        'First, one comprehension passage — about 200 words on a topic such as science, history, economics or health — with questions asking what it says and what it means.',
        'Second, one cloze passage — the same length, but with gaps in it. A cloze has some words removed, and you choose the best word for each gap.',
        'Third, ten questions on the approved novel. “Approved” here means the one novel JAMB picked for the year — The Lekki Headmaster for 2026. Read it. The ten questions never come from anywhere else.',
      ],
    },
  },
  // 2 — coherence
  {
    position: 2,
    block_type: 'text',
    content: {
      check: {
        why: '“Therefore” marks a conclusion that follows from the claims before it.',
        answer: 2,
        options: [
          'an example',
          'a new topic',
          'a conclusion or result',
          'a counterexample',
        ],
        question: 'A paragraph begins “The diet improved; therefore…” What does “therefore” signal?',
      },
      bullets: [
        'Coherence means ideas link so the text flows — one thought leads into the next.',
        'A topic sentence is the first sentence of a paragraph — it names the one thing that paragraph is about.',
        'Signal words show how ideas connect: “however” (a turn), “for example” (support), “therefore” (a conclusion).',
      ],
      heading: 'Good writing links ideas together',
      takeaway: 'Coherence means each idea leads into the next — signal words like however and therefore show how.',
      paragraphs: [
        'Have you ever read a paragraph and felt lost three lines in, even though the words were simple? That happens when ideas do not link. Linking ideas is called coherence — the writing flows, and nothing is a surprise.',
        'A topic sentence is the first sentence of a paragraph — it tells you the one point the paragraph will make. Everything after it should stay on that point.',
        'Writers use signal words to show how ideas connect. “However” means the writer is turning. “For example” means support is coming. “Therefore” and “consequently” mean a conclusion follows.',
        'You do not need big words to show you understand a text. You just need to notice how the writer got from one idea to the next.',
      ],
    },
  },
  // 3 — synthesis
  {
    position: 3,
    block_type: 'text',
    content: {
      check: {
        why: 'Synthesis merges the main claims of several passages, in fresh wording.',
        answer: 1,
        options: [
          'quotes a long line from one passage',
          'merges the main ideas of both passages in fresh words',
          'adds an opinion absent from both passages',
          'retells only the first passage in new words',
        ],
        question: 'Which summary shows synthesis?',
      },
      bullets: [
        'Synthesis means joining ideas from more than one text into one answer.',
        'First find each text’s main claim.',
        'Then write both claims in your own words — never copied.',
        'Keep both sides — drop examples and side details.',
      ],
      heading: 'How to join two passages into one answer',
      takeaway: 'Synthesis means joining the main ideas of more than one passage into one fresh-worded answer.',
      paragraphs: [
        'Imagine two short passages. Passage A praises a school garden project for helping pupils eat better. Passage B warns that the same project costs schools too much money.',
        'Synthesis means joining ideas from more than one text into one answer — it is the joining of ideas. Decide what each passage claims, then put both claims in one statement.',
        'Synthesis always uses your own words. Copying a sentence from either passage is not synthesis; it is copying.',
        'Good synthesis answers are short, fresh and balanced: both voices kept, nothing invented, nothing important dropped.',
      ],
    },
  },
  // 4 — exam tip callout
  {
    position: 4,
    block_type: 'callout',
    content: {
      body: 'Plan Section A as one set, not three separate tasks. Read each passage once, then write one short line naming its main claim before you move on. When the summary comes, you already have your notes. Examiners reward the summary that names the shared idea across texts, not the longest quotation from one.',
      tone: 'tip',
      title: 'How to plan Section A',
    },
  },
  // 5 — worked example
  {
    position: 5,
    block_type: 'worked_example',
    content: {
      steps: [
        {
          reason: 'Go by what each passage is actually claiming, not by its examples. Stay with the text and you cannot be far off. If stuck, underline the one sentence in each passage that states the claim.',
          result: 'A: gardens improve nutrition; B: gardens strain budgets',
          operation: 'Find the main claim of each passage',
          predictPrompt: 'Which two things do you need before you can answer?',
        },
        {
          reason: 'Hold both voices at once. If stuck, write the two claims side by side and circle the word they share.',
          result: 'Nutrition gains and cost pressure are two sides of the same project',
          operation: 'Compare the claims — where do they agree and clash?',
          predictPrompt: 'What would a weak answer do here?',
        },
        {
          reason: 'One sentence, both sides, your own wording. If stuck, join the two claims with “but” and cut everything else.',
          result: 'The garden improves diets but demands careful budgeting from schools',
          operation: 'Merge both claims into one sentence in fresh words',
          predictPrompt: 'How would you check this answer against both passages?',
        },
      ],
      problem: 'Passage A says a school garden improves nutrition; Passage B says it strains budgets. Synthesising a one-sentence summary means…',
    },
  },
  // 6 — guided question (unchanged)
  {
    position: 6,
    block_type: 'guided_question',
    content: {
      hints: [
        'Name the main claim of each passage first.',
        'Keep both voices in the sentence, joined by a contrast link.',
        'Use fresh wording and leave out figures and examples.',
      ],
      question: 'Passage A praises free school meals; Passage B worries about their cost. What should your one-sentence summary do?',
    },
  },
  // 7 — Go deeper: approved reading text
  {
    position: 7,
    block_type: 'text',
    content: {
      bullets: [
        'No special book. The exam passages are the reading text itself',
        'Think with the passages, not just about them',
        'Read twice: once for answers, once for arguments',
      ],
      heading: 'Go deeper: What the approved reading text means',
      paragraphs: [
        'People hear the phrase “approved reading text” and think it names the passages printed in the paper. It does not. It names the one novel JAMB prescribes (chooses) for the year — for 2026, The Lekki Headmaster by Kabir Alabi Garba. You read it before the exam; JAMB then sets ten questions directly from it.',
        'Why does “approved” matter? Because JAMB picks the novel once a year, and all serious practice must come from it. Random practice books will not match its plot, its characters or its themes, and students who skip the novel lose ten marks they could have banked.',
        'The catch is that examiners expect you to think with the passages, not just about them. A candidate who reads only for multiple-choice answers will freeze when asked to discuss one text at length in the summary task.',
        'So read each passage twice: once for answers, once for arguments. Ask yourself after every paragraph: what is this text trying to make me believe? That habit is what Section A rewards.',
        'One last fact. The Section A passages change every year, but the shapes do not: one cloze, one comprehension set, one summary. Learn those three shapes and every set you meet will feel familiar.',
      ],
    },
  },
  // 8 — Go deeper: harder summary
  {
    position: 8,
    block_type: 'text',
    content: {
      bullets: [
        'Name the benefit and the limit in one breath',
        'Benefit + limit = the full picture',
        'Use the “A says X, but B shows Y” frame',
      ],
      heading: 'Go deeper: A harder summary, fully worked',
      paragraphs: [
        'Imagine two short texts. Text A says a mobile clinic visits twelve villages each month and gives vaccines free. Text B says fuel costs, bad roads and broken equipment force the clinic to miss one visit in every four.',
        'A weak summary copies Text A alone and praises the free vaccines. That misses half the picture. Another copies Text B alone and complains about the costs. That misses the other half. The exam sets this exact trap on purpose.',
        'The strong answer names both sides in one relationship: the clinic brings real free healthcare to villages that would otherwise have none, but the service still fails one visit in four because of fuel, roads and broken gear. Benefit and limit, one sentence.',
        'The frame: “Text A is right that X, but Text B shows that Y, so the full picture is Z.” Practise it on any two texts and Section A stops being frightening.',
      ],
    },
  },
  // 9 — Go deeper: traps
  {
    position: 9,
    block_type: 'text',
    content: {
      bullets: [
        'Read the whole set as one connected task',
        'Linking words must do real jobs, not decoration',
        'Every paragraph needs one clear claim',
      ],
      heading: 'Go deeper: The traps inside Section A',
      paragraphs: [
        'Trap one: treating Section A as three separate tasks. The cloze, the comprehension and the summary all belong to the same set of texts. Read the set as a set, or your summary will miss points sitting in the earlier passages.',
        'Trap two: copying without connecting. A paragraph stuffed with “therefore” and “however” is not automatically logical. The examiner wants each linking word to do real work — turning an idea or closing a thought — not just decorate the page.',
        'Trap three: the topic sentence that says nothing. If your paragraph opens with “In conclusion”, followed by no actual claim, the examiner scores zero no matter how nice the next three lines are. Every paragraph must state one clear claim.',
        'Beat the traps like this: read the set as one story, give every paragraph one job, and underline the linking words as you write to check each one earns its place.',
      ],
    },
  },
]

async function main() {
  const byPosition = new Map(rewritten.map((b) => [b.position, b]))
  // sanity check against the live backup
  const live = blocks.sort((a, b) => a.position - b.position)
  if (live.length !== rewritten.length) {
    throw new Error(`Block count mismatch: live ${live.length} vs rewrite ${rewritten.length}`)
  }
  for (const block of live) {
    const next = byPosition.get(block.position)
    if (!next) throw new Error('missing position ' + block.position)
    const { error } = await admin
      .from('lesson_blocks')
      .update({ content: next.content, block_type: next.block_type })
      .eq('id', block.id)
    if (error) throw new Error(`block ${block.position} update failed: ${error.message}`)
    console.log('updated block', block.position, '(' + next.block_type + ')')
  }
  console.log('done —', rewritten.length, 'blocks rewritten')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
