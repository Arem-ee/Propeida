/**
 * Lesson enhancements: the pedagogy that turns a note (Teach material)
 * into a full lesson contract. Keyed by RevisionNote id. Lessons without
 * an entry here still run diagnostic → teach → independent; authored
 * worked examples and supported prompts unlock the full contract.
 *
 * Authoring rules (Sweller/Mayer): one idea per example, each step names
 * its operation AND reason, every step hides its result behind a
 * prediction prompt (generation before presentation).
 */

export interface WorkedStep {
  operation: string
  reason: string
  result: string
  predictPrompt: string
  /**
   * Optional instructional visual, rendered with the result.
   * Must expose the step's relationship (docs: label, don't decorate).
   * { kind: 'number-line', props: { min, max, points[{value,label,color?}], step? } }
   * { kind: 'fraction-bars', props: { fractions[{numerator,denominator,color?,label?}] } }
   * { kind: 'balance', props: { left[string], right[string], tilt? } }
   * { kind: 'plane', props: { points[{x,y,label?,color?}], range? } }
   */
  visual?: { kind: 'number-line' | 'fraction-bars' | 'balance' | 'plane'; props: Record<string, unknown> } | null
}

export interface WorkedExample {
  problem: string
  steps: WorkedStep[]
}

export interface SupportedPrompt {
  question: string
  hints: string[]
}

export interface LessonEnhancement {
  noteId: string
  workedExamples?: WorkedExample[]
  supported?: SupportedPrompt
  vocabulary?: WordCard[]
}

/** Deliberate vocabulary (adolescent-literacy evidence): plain definition,
 *  contrast word, and sentence use — reviewed in varied contexts. */
export interface WordCard {
  word: string
  definition: string
  contrast: string
  sentence: string
}

const ENHANCEMENTS: Record<string, LessonEnhancement> = {
  'mathematics-quadratic-equations': {
    noteId: 'mathematics-quadratic-equations',
    workedExamples: [{
      problem: 'Solve x² − 5x + 6 = 0 by factorization.',
      steps: [
        {
          operation: 'Write the equation in standard form',
          reason: 'Factorization needs the form ax² + bx + c = 0 before anything else.',
          result: 'x² − 5x + 6 = 0 — already in standard form.',
          predictPrompt: 'Two numbers multiply to +6 and add to −5. What are they?',
        },
        {
          operation: 'Find the number pair',
          reason: 'Product positive (+6) with negative sum (−5) means both numbers are negative.',
          result: '−2 and −3, because (−2) × (−3) = +6 and (−2) + (−3) = −5.',
          predictPrompt: 'How do those two numbers become brackets?',
        },
        {
          operation: 'Write the factors',
          reason: 'Each number pairs with x inside its own bracket.',
          result: '(x − 2)(x − 3) = 0.',
          predictPrompt: 'A product equals zero. What does each bracket tell you?',
        },
        {
          operation: 'Solve each bracket',
          reason: 'A product is zero when at least one factor is zero.',
          result: 'x − 2 = 0 gives x = 2; x − 3 = 0 gives x = 3.',
          predictPrompt: 'How would you convince yourself these are right?',
        },
        {
          operation: 'Check by substitution',
          reason: 'Putting each value back proves the solution instead of assuming it.',
          result: '4 − 10 + 6 = 0 ✓ and 9 − 15 + 6 = 0 ✓. Both hold.',
          predictPrompt: '',
        },
      ],
    }],
    supported: {
      question: 'Now you try with scaffolding: solve x² − 7x + 12 = 0 by factorization.',
      hints: [
        'What two numbers multiply to +12 and add to −7?',
        'Write the two brackets first — then solve each one separately.',
        'Still stuck? Both numbers are negative. Check by substituting back.',
      ],
    },
  },
}

export function getEnhancement(noteId: string): LessonEnhancement | null {
  return ENHANCEMENTS[noteId] ?? null
}

const EXTRA_ENHANCEMENTS: Record<string, LessonEnhancement> = {
  'mathematics-surds': {
    noteId: 'mathematics-surds',
    workedExamples: [{
      problem: 'Simplify √50 − √18.',
      steps: [
        {
          operation: 'Split each surd into a perfect square times the remainder',
          reason: 'Only lowest-form surds reveal whether terms can combine.',
          result: '√50 = √(25 × 2) = 5√2; √18 = √(9 × 2) = 3√2.',
          predictPrompt: 'Both are now "something × √2". What happens next?',
        },
        {
          operation: 'Combine the like surds',
          reason: 'Like surds add and subtract exactly like like terms.',
          result: '5√2 − 3√2 = 2√2.',
          predictPrompt: 'How would you convince yourself 2√2 is final?',
        },
        {
          operation: 'Check by squaring back',
          reason: 'Squaring reverses every simplification step.',
          result: '(2√2)² = 4 × 2 = 8; and (√50 − √18)² = 50 − 2√900 + 18 = 68 − 60 = 8 ✓.',
          predictPrompt: '',
        },
      ],
    }],
    supported: {
      question: 'Now you try with scaffolding: simplify √75 + √27 − √12.',
      hints: [
        'Split each: look for 25, 9, and 4 hiding inside.',
        'Convert all three to "something × √3" first.',
        'Combine: 5 + 3 − 2 of √3 gives…?',
      ],
    },
  },
  'mathematics-indices': {
    noteId: 'mathematics-indices',
    workedExamples: [{
      problem: 'Evaluate 32^(2/5) without a calculator.',
      steps: [
        {
          operation: 'Split the fractional power into root-then-power',
          reason: 'a^(m/n) = (ⁿ√a)ᵐ — roots first keeps the numbers small.',
          result: '32^(2/5) = (⁵√32)².',
          predictPrompt: 'What whole number, raised to 5, gives 32?',
        },
        {
          operation: 'Take the root',
          reason: '2⁵ = 32, so ⁵√32 = 2.',
          result: '(2)² remains.',
          predictPrompt: 'Finish it.',
        },
        {
          operation: 'Apply the remaining power',
          reason: 'The outer square was waiting the whole time.',
          result: '2² = 4.',
          predictPrompt: '',
        },
      ],
    }],
    supported: {
      question: 'Now you try with scaffolding: evaluate 16^(3/4).',
      hints: [
        'Split it: root first — which root does /4 mean?',
        '⁴√16 = 2. What power is still waiting?',
        'Compute 2³.',
      ],
    },
  },
  'mathematics-trigonometry': {
    noteId: 'mathematics-trigonometry',
    workedExamples: [{
      problem: 'If sin θ = 3/5 and θ is acute, find cos θ.',
      steps: [
        {
          operation: 'Draw the right-angled triangle and label it',
          reason: 'sin θ = opposite/hypotenuse, so opposite = 3, hypotenuse = 5.',
          result: 'A triangle with vertical side 3, slant side 5, unknown base.',
          predictPrompt: 'Which rule finds the missing side?',
        },
        {
          operation: 'Apply Pythagoras for the adjacent side',
          reason: 'Adjacent² = hypotenuse² − opposite².',
          result: 'Adjacent² = 25 − 9 = 16, so adjacent = 4.',
          predictPrompt: 'Which ratio gives cos θ?',
        },
        {
          operation: 'Read off cos θ = adjacent/hypotenuse',
          reason: 'SOHCAHTOA: cosine pairs adjacent with hypotenuse.',
          result: 'cos θ = 4/5.',
          predictPrompt: '',
        },
      ],
    }],
    supported: {
      question: 'Now you try with scaffolding: if cos θ = 12/13 (θ acute), find sin θ.',
      hints: [
        'Draw it: which sides do 12 and 13 label?',
        'Pythagoras for the missing side: 13² − 12² = ?',
        'sin θ = opposite/hypotenuse — read it off.',
      ],
    },
  },
  'mathematics-probability': {
    noteId: 'mathematics-probability',
    workedExamples: [{
      problem: 'A bag holds 3 red and 2 blue balls. Two are drawn one after another without replacement. Find P(both red).',
      steps: [
        {
          operation: 'Write the first-draw probability',
          reason: 'Favourable over total: 3 red out of 5 balls.',
          result: 'P(first red) = 3/5.',
          predictPrompt: 'After one red leaves the bag, what changes?',
        },
        {
          operation: 'Adjust for the second draw without replacement',
          reason: 'One red and one ball are gone: 2 red out of 4 remain.',
          result: 'P(second red | first red) = 2/4 = 1/2.',
          predictPrompt: 'How do sequential probabilities combine?',
        },
        {
          operation: 'Multiply along the chain',
          reason: '"First AND second" means multiply the conditional probabilities.',
          result: '3/5 × 1/2 = 3/10.',
          predictPrompt: '',
        },
      ],
    }],
    supported: {
      question: 'Now you try with scaffolding: a box has 4 green and 6 yellow pens. Two drawn without replacement — P(both green)?',
      hints: [
        'First draw: how many green out of how many total?',
        'After one green leaves, recount both numbers.',
        'Multiply the two fractions and simplify.',
      ],
    },
  },
  'english-vocabulary-and-idioms': {
    noteId: 'english-vocabulary-and-idioms',
    vocabulary: [
      { word: 'Ameliorate', definition: 'To make something bad better.', contrast: 'Aggravate', sentence: 'The new drainage did much to ameliorate the flooding.' },
      { word: 'Prodigal', definition: 'Recklessly wasteful with money or resources.', contrast: 'Frugal', sentence: 'His prodigal spending emptied the account in a term.' },
      { word: 'Rigid', definition: 'Stiff; unwilling to bend or change.', contrast: 'Flexible', sentence: 'The rigid timetable left no room for revision.' },
      { word: 'Heretic', definition: 'One who holds opinions against accepted doctrine.', contrast: 'Orthodox', sentence: 'They called him a heretic for questioning the old method.' },
      { word: 'Meticulous', definition: 'Showing great care for detail.', contrast: 'Careless', sentence: 'Her meticulous notes made revision effortless.' },
      { word: 'Candid', definition: 'Open and sincere in speech.', contrast: 'Evasive', sentence: 'Be candid about which topics confuse you.' },
      { word: 'Ambiguous', definition: 'Open to more than one interpretation.', contrast: 'Explicit', sentence: 'The ambiguous question cost candidates marks.' },
      { word: 'Curtail', definition: 'To cut short or reduce.', contrast: 'Extend', sentence: 'Poor timing curtailed his mock attempt.' },
    ],
  },
}

for (const [key, value] of Object.entries(EXTRA_ENHANCEMENTS)) {
  ENHANCEMENTS[key] = value
}
