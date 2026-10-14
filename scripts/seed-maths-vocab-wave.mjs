// Authoring sprint waves 2+3: new worked examples (probability with
// replacement, trig angle of elevation — both with visuals) + 2 vocabulary
// cards (phrasal verbs, idioms). New BLOCKS (renderer now serves full
// worked sets and merged word lists — first-only was the blocker).
// Usage: node --env-file=.env scripts/seed-maths-vocab-wave.mjs

import { createClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) {
  console.error('Missing Supabase env vars')
  process.exit(1)
}
const db = createClient(URL, KEY)

async function lessonId(subjectSlug, slug) {
  const { data: s } = await db.from('subjects').select('id').eq('slug', subjectSlug).single()
  const { data } = await db
    .from('lessons')
    .select('id')
    .eq('subject_id', s.id)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  if (!data) throw new Error(`lesson missing: ${slug}`)
  return data.id
}

async function appendBlock(lessonId, type, content) {
  const { data: existing } = await db.from('lesson_blocks').select('id').eq('lesson_id', lessonId)
  const position = existing?.length ?? 0
  const { error } = await db
    .from('lesson_blocks')
    .insert({ lesson_id: lessonId, position, block_type: type, content })
  if (error) throw error
}

const probId = await lessonId('mathematics', 'probability')
await appendBlock(probId, 'worked_example', {
  problem:
    'A bag holds 4 green and 6 yellow balls. One ball is drawn, replaced, then a second is drawn. Find P(both green).',
  steps: [
    {
      operation: 'Write the first-draw probability',
      reason: 'Favourable over total: 4 green out of 10 balls.',
      result: 'P(first green) = 4/10 = 2/5.',
      predictPrompt: 'The ball goes back into the bag. What does the second draw look like?',
      visual: {
        kind: 'fraction-bars',
        props: { fractions: [{ numerator: 2, denominator: 5, label: 'first draw' }] },
      },
    },
    {
      operation: 'Handle the replacement',
      reason: 'Because the ball is replaced, the bag resets — the second draw faces the same 4 out of 10.',
      result: 'P(second green) = 4/10 = 2/5.',
      predictPrompt: 'Two independent stages, and you need both. Add or multiply?',
      visual: {
        kind: 'fraction-bars',
        props: { fractions: [{ numerator: 2, denominator: 5, label: 'second draw' }] },
      },
    },
    {
      operation: 'Multiply for AND',
      reason: '"First AND second" with independent stages means multiply the two probabilities.',
      result: '2/5 × 2/5 = 4/25.',
      predictPrompt: '',
      visual: {
        kind: 'fraction-bars',
        props: {
          fractions: [
            { numerator: 2, denominator: 5, label: 'each draw' },
            { numerator: 4, denominator: 25, label: 'both green' },
          ],
        },
      },
    },
  ],
})
console.log('+ worked_example → probability')

const trigId = await lessonId('mathematics', 'trigonometry')
await appendBlock(trigId, 'worked_example', {
  problem:
    'From 30 m away on level ground, the angle of elevation to the top of a building is 30°. Find the height of the building.',
  steps: [
    {
      operation: 'Name the sides against the angle',
      reason: 'Opposite the 30° angle stands the unknown height; alongside it runs the known 30 m.',
      result: 'opp = h, adj = 30 m — so the ratio that links them is tangent.',
      predictPrompt: 'Which trig ratio links opposite and adjacent?',
      visual: {
        kind: 'plane',
        props: {
          range: 35,
          points: [
            { x: 0, y: 0, label: 'you' },
            { x: 30, y: 0, label: 'base' },
            { x: 30, y: 17.3, label: 'top ≈ 17.3' },
          ],
        },
      },
    },
    {
      operation: 'Write the tangent equation',
      reason: 'tan θ = opposite ÷ adjacent, with θ = 30°.',
      result: 'tan 30° = h / 30.',
      predictPrompt: 'tan 30° has an exact value. What is it?',
    },
    {
      operation: 'Solve with the exact value',
      reason: 'tan 30° = 1/√3 = √3/3, so h = 30 × √3/3.',
      result: 'h = 10√3 ≈ 17.3 m.',
      predictPrompt: '',
    },
  ],
})
console.log('+ worked_example → trigonometry')

const vocabId = await lessonId('english', 'vocabulary-and-idioms')
await appendBlock(vocabId, 'vocabulary_card', {
  words: [
    { word: 'Bring up', definition: 'To raise a topic, or to raise a child.', contrast: 'Not: to carry upstairs.', sentence: 'She brought up the fee increase at the meeting.' },
    { word: 'Put off', definition: 'To postpone, or to discourage.', contrast: 'Not: to place something away.', sentence: 'They put off the trip until the rains ended.' },
    { word: 'Look into', definition: 'To investigate.', contrast: 'Not: to stare inside something.', sentence: 'The panel will look into the missing scripts.' },
    { word: 'Run into', definition: 'To meet by chance, or to collide with.', contrast: 'Not: to enter running.', sentence: 'I ran into my old teacher at the market.' },
    { word: 'Turn down', definition: 'To reject or refuse.', contrast: 'Not: to fold downward.', sentence: 'He turned down the offer because the pay was poor.' },
    { word: 'Break down', definition: 'To stop working (machine), or to lose control emotionally.', contrast: 'Not: to demolish.', sentence: 'The bus broke down halfway to Ilorin.' },
  ],
})
console.log('+ vocabulary_card (phrasal verbs) → vocabulary-and-idioms')

await appendBlock(vocabId, 'vocabulary_card', {
  words: [
    { word: 'Cry over spilt milk', definition: 'To waste regret on what cannot be undone.', contrast: 'Not about actual milk.', sentence: 'Failing once is sad, but crying over spilt milk will not rewrite the script.' },
    { word: 'A blessing in disguise', definition: 'A good thing that first looked like a bad thing.', contrast: 'Not: a hidden religious event.', sentence: 'Missing that bus was a blessing in disguise — it broke down.' },
    { word: 'Hit the nail on the head', definition: 'To say exactly the right thing.', contrast: 'Not about carpentry.', sentence: 'Her summary hit the nail on the head.' },
    { word: 'Let the cat out of the bag', definition: 'To reveal a secret by accident.', contrast: 'Not about pets.', sentence: 'He let the cat out of the bag about the surprise test.' },
    { word: 'Once in a blue moon', definition: 'Very rarely.', contrast: 'Not about the moon changing colour.', sentence: 'They eat out once in a blue moon.' },
    { word: 'Speak of the devil', definition: 'Said when someone you were just discussing appears.', contrast: 'Not about summoning anyone.', sentence: 'Speak of the devil — we were just talking about you!' },
  ],
})
console.log('+ vocabulary_card (idioms) → vocabulary-and-idioms')
console.log('done')
