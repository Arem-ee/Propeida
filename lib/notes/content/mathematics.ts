import type { RevisionNote } from '@/lib/notes'

export const mathematicsNotes: RevisionNote[] = [
  {
    id: 'mathematics-surds',
    subject: 'mathematics',
    topic: 'Surds',
    slug: 'surds',
    summary: 'Simplify, rationalise and compare surds — the irrational roots that show up in nearly every paper.',
    practiceTopic: 'surds',
    sections: [
      {
        heading: 'What surds are',
        paragraphs: [
          'A surd is an irrational number left in square-root form. It is "irrational" because it cannot be written as a whole number or a simple fraction — the digits go on forever without repeating.',
        ],
        bullets: [
          'A surd is an irrational square root that stays in root form: √2, √3, √5 (√4 = 2, so it is not a surd).',
          'Surds arise when a square root cannot be written as a whole number.',
          'Common surds you will meet: √2 (≈1.414), √3 (≈1.732), √5 (≈2.236).',
        ],
      },
      {
        heading: 'Simplifying surds',
        paragraphs: [
          'The first move in almost every surd question is to simplify each surd into its lowest form. Look for a factor that is a perfect square and pull it out.',
        ],
        bullets: [
          'Split the number under the root into a factor pair with a clean square: √12 = √(4 × 3) = 2√3.',
          'Only like surds can be added or subtracted: 3√5 + 2√5 = 5√5, but 3√5 + 2√3 stays as it is.',
          'Multiplication: √a × √b = √(ab). Division: √a ÷ √b = √(a/b).',
          'A surd squared returns its number: (√5)² = 5.',
        ],
      },
      {
        heading: 'Rationalising the denominator',
        paragraphs: [
          'A fraction containing a surd in the denominator is not considered simplified. Multiply the top and bottom by something that clears the surd from the bottom — that is rationalising.',
        ],
        bullets: [
          'A fraction is simplified only when its denominator is a whole number.',
          'Single surd: multiply top and bottom by the surd: 1/√3 × √3/√3 = √3/3.',
          'Binomial: multiply by the conjugate (change the sign): 1/(√5 + 1) becomes (√5 − 1)/[(√5)² − 1²] = (√5 − 1)/4.',
          'Remember (√a + b)(√a − b) = a − b².',
        ],
      },
      {
        heading: 'Comparing and equating surds',
        paragraphs: [
          'To compare two surds, square both sides first to remove the roots. To find a missing coefficient of the form (a + b√c)², expand and match the rational and surd parts.',
        ],
        bullets: [
          'To compare, square both sides and compare the values.',
          'To separate the rational and surd parts of (a + b√c)², expand and match coefficients.',
          'Check your answer by squaring back: if you reduced in steps, each step should reverse cleanly.',
        ],
      },
    ],
    examTip:
      'Before answering, always reduce every surd to its simplest form — the answer options in exams are given in lowest terms.',
  },
  {
    id: 'mathematics-indices',
    subject: 'mathematics',
    topic: 'Indices',
    slug: 'indices',
    summary: 'The laws of indices applied to simplification and solving exponential equations quickly.',
    practiceTopic: 'indices',
    sections: [
      {
        heading: 'The laws of indices',
        paragraphs: [
          'Indices (powers) follow a small set of laws. If you apply the power rules every time, simplification problems stop being guesswork.',
        ],
        bullets: [
          'aᵐ × aⁿ = aᵐ⁺ⁿ. Example: 2³ × 2⁴ = 2⁷.',
          'aᵐ ÷ aⁿ = aᵐ⁻ⁿ. Example: 3⁷ ÷ 3² = 3⁵.',
          '(aᵐ)ⁿ = aᵐⁿ. Example: (2²)³ = 2⁶.',
          '(ab)ᵐ = aᵐbᵐ and (a/b)ᵐ = aᵐ/bᵐ.',
          'Any non-zero base to the power zero is 1: a⁰ = 1.',
        ],
      },
      {
        heading: 'Negative and fractional powers',
        paragraphs: [
          'A negative power is a reciprocal, and a fractional power is a root. Combined, they convert roots into ordinary powers so the laws above always apply.',
        ],
        bullets: [
          'Negative: a⁻ᵐ = 1/aᵐ. Example: 3⁻² = 1/9.',
          'Fractional: a^(1/n) = ⁿ√a. Example: 8^(1/3) = 2.',
          'Combined: a^(m/n) = (ⁿ√a)ᵐ. Example: 27^(2/3) = (∛27)² = 3² = 9.',
          'Convert every root into a power of the same base before applying any law.',
        ],
      },
      {
        heading: 'Solving exponential equations',
        paragraphs: [
          'The aim is to get the same base on both sides of the equation, then simply compare the indices to solve for x.',
        ],
        bullets: [
          'Write both sides with the same base, then equate the indices.',
          '4ˣ = 8 → (2²)ˣ = 2³ → 2²ˣ = 2³ → 2x = 3 → x = 3/2.',
          'If the bases cannot be made the same at once, break each term into common base factors.',
          'Watch for equations like 2ˣ · 2ˣ⁺¹ = 32: add the indices first, 2²ˣ⁺¹ = 2⁵.',
        ],
      },
      {
        heading: 'Common traps',
        paragraphs: [
          'Most marks are lost on careless sign and bracket mistakes. Check the two rules below before you select.',
        ],
        bullets: [
          '(a + b)² is not a² + b² — expand fully.',
          'Do not combine unlike terms: aᵐ × bⁿ has no single base, it stays as aᵐbⁿ.',
          'a⁰ = 1 only when a is not zero.',
          'Watch the bracket: 2x² means 2(x²), while (2x)² = 4x².',
        ],
      },
    ],
    examTip: 'Convert every expression to a single base before comparing powers — most index questions only test that one move.',
  },
  {
    id: 'mathematics-quadratic-equations',
    subject: 'mathematics',
    topic: 'Quadratic Equations',
    slug: 'quadratic-equations',
    summary: 'Factorise, complete the square or use the formula to solve ax² + bx + c = 0.',
    practiceTopic: 'quadratic-equations',
    sections: [
      {
        heading: 'The standard form',
        paragraphs: [
          'A quadratic equation has the form ax² + bx + c = 0, where a is not zero. The unknown is squared, so the equation has two roots (solutions) — sometimes the same root twice.',
        ],
        bullets: [
          'A quadratic is of the form ax² + bx + c = 0, where a is not zero.',
          'It has two solutions (roots), sometimes repeated.',
          'When rearranging, bring all terms to one side first: x² + 3x = 10 → x² + 3x − 10 = 0.',
        ],
      },
      {
        heading: 'Factorisation (when it factors cleanly)',
        paragraphs: [
          'For a = 1, find two numbers that multiply to give c and add to give b. That pair goes into two brackets set to zero.',
        ],
        bullets: [
          'Find a number pair that multiplies to c and adds to b (for a = 1).',
          'x² + 3x − 10: pair (5, −2) → (x + 5)(x − 2) = 0 → x = −5 or x = 2.',
          'For a ≠ 1, split the middle term using the pair that multiplies to "a × c".',
        ],
      },
      {
        heading: 'The formula and completing the square',
        paragraphs: [
          'When the quadratic does not factorise cleanly, use the formula or complete the square. The formula always works and is usually fastest in objective questions.',
        ],
        bullets: [
          'Quadratic formula: x = (−b ± √(b² − 4ac)) / 2a.',
          'The discriminant, b² − 4ac, tells the nature of the roots: positive → two distinct real roots; zero → one repeated root; negative → no real roots.',
          'Completing the square rewrites x² + bx as (x + b/2)² − (b/2)², which also gives the vertex of the curve.',
          'Pick the formula when factorisation is not obvious — it always works in MCQs.',
        ],
      },
      {
        heading: 'Sum and product of roots',
        paragraphs: [
          'For the form ax² + bx + c = 0, the sum of the roots is −b/a and the product is c/a. This gives a quick check of your factorisation and a way to build a new equation.',
        ],
        bullets: [
          'Sum of roots = −b/a; product of roots = c/a.',
          'To build a quadratic from its roots: x² − (sum)x + (product) = 0.',
          'Check your solution: in x² + 3x − 10 = 0 the roots (2, −5) sum to −3 = −b/a and multiply to −10 = c.',
        ],
      },
      {
        heading: 'Word problems',
        paragraphs: [
          'Word problems are the same process in disguise: turn the sentence into a quadratic equation with the unknown, solve, then reject answers that cannot work.',
        ],
        bullets: [
          'Translate the sentence into an equation, e.g. "the product of two consecutive integers": x(x + 1) = 132.',
          'Solve, then discard solutions that cannot make sense (negative lengths or ages).',
        ],
      },
    ],
    examTip: 'When a quadratic looks long and ugly, the exam expects factorisation and a quick check of the sum and product of your roots.',
  },
  {
    id: 'mathematics-trigonometry',
    subject: 'mathematics',
    topic: 'Trigonometry',
    slug: 'trigonometry',
    summary: 'Ratios, special angles, identities, and the sine and cosine rules for solving triangles.',
    practiceTopic: 'trigonometry',
    sections: [
      {
        heading: 'Basic ratios (right-angled triangles)',
        paragraphs: [
          'The three basic ratios connect the sides of a right-angled triangle to its angles. Memorise the word SOHCAHTOA and you carry all three at once.',
        ],
        bullets: [
          'SOHCAHTOA: sin θ = opposite/hypotenuse, cos θ = adjacent/hypotenuse, tan θ = opposite/adjacent.',
          'The ratios apply to right-angled triangles unless you switch to the sine or cosine rules.',
        ],
      },
      {
        heading: 'Special angles to memorise',
        paragraphs: [
          'The 30°, 45° and 60° values appear in nearly every paper. Learn the small table and you can answer without a calculator and without stress.',
        ],
        bullets: [
          'sin 30° = ½, sin 45° = √2/2, sin 60° = √3/2.',
          'cos 30° = √3/2, cos 45° = √2/2, cos 60° = ½.',
          'tan 30° = 1/√3, tan 45° = 1, tan 60° = √3.',
          'tan θ = sin θ / cos θ, so tan 45° = (√2/2)/(√2/2) = 1.',
        ],
      },
      {
        heading: 'Identities',
        paragraphs: [
          'The identity sin²θ + cos²θ = 1 is true for every angle. It lets you simplify long trig expressions and find missing values.',
        ],
        bullets: [
          'sin²θ + cos²θ = 1 regardless of θ.',
          'Dividing through by cos²θ gives tan²θ + 1 = sec²θ.',
          'Use identities to simplify surprises in longer questions.',
        ],
      },
      {
        heading: 'Angles above 90° (quadrants)',
        paragraphs: [
          'Beyond 90°, the sign of each ratio flips depending on the quadrant. A tiny sketch of the reference angle settles the sign every time.',
        ],
        bullets: [
          'ASTC ("all sin tan cos" around the clock): which ratios are positive in which quadrant.',
          'sin(180° − θ) = sin θ; cos(180° + θ) = −cos θ.',
          'Draw the reference angle to decide the sign in the second, third and fourth quadrants.',
          'Angle of elevation looks up from the horizontal; angle of depression looks down to the horizontal.',
        ],
      },
      {
        heading: 'Non-right triangles',
        paragraphs: [
          'For triangles without a right angle, the sine and cosine rules replace the basic ratios. Pick the rule from the information given.',
        ],
        bullets: [
          'Sine rule: a/sin A = b/sin B = c/sin C — use when you know a side and its opposite angle.',
          'Cosine rule: a² = b² + c² − 2bc cos A — use when two sides and the included angle are known.',
          'Bearings: three-figure bearings are measured clockwise from north, e.g. 045°, 315°.',
        ],
      },
    ],
    examTip: 'Check your calculator is in degree mode and never miss the sign of an angle in the third or fourth quadrant — that alone shifts marks.',
  },
  {
    id: 'mathematics-probability',
    subject: 'mathematics',
    topic: 'Probability',
    slug: 'probability',
    summary: 'Sample spaces, complementary events, and the "and/or" rules of simple probability.',
    practiceTopic: 'probability',
    sections: [
      {
        heading: 'Core ideas',
        paragraphs: [
          'Probability measures how likely an event is to happen. It is always a number between 0 (impossible) and 1 (certain), usually written as a fraction: P(event) = favourable outcomes ÷ total possible outcomes.',
          'Example: to find the chance of rolling a 4 on a single die, note there are 6 outcomes and only 1 is favourable, so the answer is 1/6.',
        ],
        bullets: [
          'P(event) = number of favourable outcomes ÷ total possible outcomes.',
          'Probability is always between 0 (impossible) and 1 (certain).',
          'The sample space is the set of all possible outcomes, and outcomes must be equally likely.',
          'Two coins have 4 outcomes; two dice have 36; a coin and a die has 12.',
        ],
      },
      {
        heading: 'Complementary events',
        paragraphs: [
          'When a question asks for "at least one", it is usually faster to find the opposite — the chance that the event does not happen at all — and subtract it from 1.',
        ],
        bullets: [
          'P(not A) = 1 − P(A).',
          '"At least one" problems are easiest as complements: P(at least one head) = 1 − P(no head).',
          'With three tosses, P(no head) = (1/2)³ = 1/8, so P(at least one head) = 7/8.',
        ],
      },
      {
        heading: '“Or” (union) and “and” (intersection)',
        paragraphs: [
          'The two linking words "or" and "and" pick different rules. Think of "or" as adding outcomes and "and" as multiplying the individual chances.',
        ],
        bullets: [
          'Mutually exclusive events cannot happen together: P(A or B) = P(A) + P(B).',
          'Independent events: P(A and B) = P(A) × P(B).',
          'When the events are not independent (e.g. drawing without replacement), adjust the remaining counts after the first selection.',
        ],
      },
      {
        heading: 'Without replacement (the classic trap)',
        paragraphs: [
          'The most common trap is drawing without replacement. After one item is taken, both the total and the number of favourable outcomes drop by one.',
        ],
        bullets: [
          'Drawing two balls without replacement: the second probability uses one fewer in both the favourable and total counts.',
          'With replacement, the denominator stays the same on every draw.',
          'Example: a bag has 3 red and 2 blue; two without replacement = (3/5)(2/4) = 6/20 = 3/10.',
        ],
      },
    ],
    examTip: 'State the sample space first in awkward questions — listing outcomes makes most probability MCQs mechanical.',
  },
]