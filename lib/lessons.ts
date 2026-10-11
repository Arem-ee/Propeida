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
  workedExample?: WorkedExample
  supported?: SupportedPrompt
}

const ENHANCEMENTS: Record<string, LessonEnhancement> = {
  'mathematics-quadratic-equations': {
    noteId: 'mathematics-quadratic-equations',
    workedExample: {
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
    },
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
