import type { RevisionNote } from '@/lib/notes'

export const mathematicsNotes: RevisionNote[] = [
  {
    id: 'mathematics-surds',
    subject: 'mathematics',
    topic: 'Surds',
    summary: 'Simplify, rationalise and compare surds — the irrational roots that show up in nearly every paper.',
    practiceTopic: 'surds',
    sections: [
      {
        heading: 'What surds are',
        bullets: [
          'A surd is an irrational square root that stays in root form: √2, √3, √5 (√4 = 2, so it is not a surd).',
          'Surds arise when a square root cannot be written as a whole number.',
          'Common surds you will meet: √2 (≈1.414), √3 (≈1.732), √5 (≈2.236).',
        ],
      },
      {
        heading: 'Simplifying surds',
        bullets: [
          'Split the number under the root into a prime-factor pair with a clean square: √12 = √(4 × 3) = 2√3.',
          'Only like surds can be added or subtracted: 3√5 + 2√5 = 5√5, but 3√5 + 2√3 stays as it is.',
          'Multiplication: √a × √b = √(ab). Division: √a ÷ √b = √(a/b).',
          'A surd squared returns its number: (√5)² = 5.',
        ],
      },
      {
        heading: 'Rationalising the denominator',
        bullets: [
          'A fraction is simplified only when its denominator is a whole number.',
          'Single surd: multiply top and bottom by the surd: 1/√3 × √3/√3 = √3/3.',
          'Binomial: multiply by the conjugate (change the sign): 1/(√5 + 1) becomes (√5 − 1)/[(√5)² − 1²] = (√5 − 1)/4.',
          'Remember (√a + b)(√a − b) = a − b².',
        ],
      },
      {
        heading: 'Comparing and equating surds',
        bullets: [
          'To compare, square both sides and compare the values.',
          'To separate the rational and surd parts of (a + b√c)², expand and match coefficients.',
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
    summary: 'The laws of indices applied to simplification and solving exponential equations quickly.',
    practiceTopic: 'indices',
    sections: [
      {
        heading: 'The laws of indices',
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
        bullets: [
          'Negative: a⁻ᵐ = 1/aᵐ. Example: 3⁻² = 1/9.',
          'Fractional: a^(1/n) = ⁿ√a. Example: 8^(1/3) = 2.',
          'Combined: a^(m/n) = (ⁿ√a)ᵐ. Example: 27^(2/3) = (∛27)² = 3² = 9.',
          'These convert roots into powers so the laws above always apply.',
        ],
      },
      {
        heading: 'Solving exponential equations',
        bullets: [
          'Write both sides with the same base, then equate the indices.',
          '4ˣ = 8 → (2²)ˣ = 2³ → 2²ˣ = 2³ → 2x = 3 → x = 3/2.',
          'If bases cannot be made the same, rewrite all powers as powers of a common base.',
          'Watch for equations like 2ˣ · 2ˣ⁺¹ = 32: add the indices first, 2²ˣ⁺¹ = 2⁵.',
        ],
      },
      {
        heading: 'Common traps',
        bullets: [
          '(a + b)² is not a² + b² — expand fully.',
          'Do not combine unlike powers: aᵐ × bⁿ has no single base, it stays as aᵐbⁿ.',
          'a^0 = 1 only when a is not zero.',
          'Be careful with brackets: 2x² means 2(x²), while (2x)² = 4x².',
        ],
      },
    ],
    examTip: 'Convert every expression to a single base before comparing powers — most index questions only test that one move.',
  },
  {
    id: 'mathematics-quadratic-equations',
    subject: 'mathematics',
    topic: 'Quadratic Equations',
    summary: 'Factorise, complete the square or use the formula to solve ax² + bx + c = 0.',
    practiceTopic: 'quadratic-equations',
    sections: [
      {
        heading: 'The standard form',
        bullets: [
          'A quadratic is of the form ax² + bx + c = 0, where a is not zero.',
          'It has two solutions (roots), sometimes repeated.',
          'When rearranging, bring all terms to one side first: x² + 3x = 10 → x² + 3x − 10 = 0.',
        ],
      },
      {
        heading: 'Factorisation (when it factors cleanly)',
        bullets: [
          'Find a, b, c such that a number pair multiplies to c and adds to b (for a = 1).',
          'x² + 3x − 10: pair (5, −2) → (x + 5)(x − 2) = 0 → x = −5 or x = 2.',
          'For a ≠ 1, split the middle term using the pair that multiplies to "a × c".',
        ],
      },
      {
        heading: 'The formula and completing the square',
        bullets: [
          'Quadratic formula: x = (−b ± √(b² − 4ac)) / 2a.',
          'The discriminant, b² − 4ac, tells the nature: positive → two distinct real roots; zero → one repeated root; negative → no real roots.',
          'Completing the square rewrites x² + bx as (x + b/2)² − (b/2)², which also gives the vertex of the curve.',
          'Pick the formula when factorisation is not obvious — it always works in MCQs.',
        ],
      },
      {
        heading: 'Sum and product of roots',
        bullets: [
          'Sum of roots = −b/a; product of roots = c/a.',
          'To build a quadratic from its roots: x² − (sum)x + (product) = 0.',
          'Used to check answers quickly: in x² + 3x − 10 = 0 the roots (2, −5) sum to 3 and multiply to −10.',
        ],
      },
      {
        heading: 'Word problems',
        bullets: [
          'Translate the sentence into equation, e.g. "the product of two consecutive integers": x(x + 1) = 132.',
          'Solve, then reject answers that cannot make sense (negative lengths, ages).',
        ],
      },
    ],
    examTip: 'When a quadratic is long and ugly, the exam expects factorisation and a quick check of the sum and product of your roots.',
  },
  {
    id: 'mathematics-trigonometry',
    subject: 'mathematics',
    topic: 'Trigonometry',
    summary: 'Ratios, special angles, identities, and the sine and cosine rules for solving triangles.',
    practiceTopic: 'trigonometry',
    sections: [
      {
        heading: 'Basic ratios (right-angled triangles)',
        bullets: [
          'SOHCAHTOA: sin θ = opposite/hypotenuse, cos θ = adjacent/hypotenuse, tan θ = opposite/adjacent.',
          'Ratios only apply to right-angled triangles unless you use the sine/cosine rules.',
        ],
      },
      {
        heading: 'Special angles to memorise',
        bullets: [
          'sin 30° = ½, sin 45° = √2/2, sin 60° = √3/2.',
          'cos 30° = √3/2, cos 45° = √2/2, cos 60° = ½.',
          'tan 30° = 1/√3, tan 45° = 1, tan 60° = √3.',
          'tan θ = sin θ / cos θ, so tan 45° = (√2/2)/(√2/2) = 1.',
        ],
      },
      {
        heading: 'Identities',
        bullets: [
          'sin²θ + cos²θ = 1 regardless of θ.',
          'Dividing through by cos²θ gives tan²θ + 1 = sec²θ.',
          'Use identities to simplify surprises in longer questions.',
        ],
      },
      {
        heading: 'Angles above 90° (quadrants)',
        bullets: [
          'ASTC ("all sin tan cos" around the clock): which are positive in which quadrant.',
          'sin(180° − θ) = sin θ; cos(180° + θ) = −cos θ.',
          'Use a small sketch of reference angles to decide the sign in the second/third/fourth quadrants.',
          'Angles of elevation look up from the horizontal; angles of depression look down to the horizontal.',
        ],
      },
      {
        heading: 'Non-right triangles',
        bullets: [
          'Sine rule: a/sin A = b/sin B = c/sin C — use when you know a side and its opposite angle.',
          'Cosine rule: a² = b² + c² − 2bc cos A — use when two sides and the included angle are known.',
          'Keep liquid for bearings: three-figure bearings are measured clockwise from north, e.g. 045°, 315°.',
        ],
      },
    ],
    examTip: 'Check your calculator is in degree mode and never miss the sign of an angle in the third quadrant — that alone shifts marks.',
  },
  {
    id: 'mathematics-probability',
    subject: 'mathematics',
    topic: 'Probability',
    summary: 'Sample spaces, complementary events, and the "and/or" rules of simple probability.',
    practiceTopic: 'probability',
    sections: [
      {
        heading: 'Core ideas',
        bullets: [
          'P(event) = number of favourable outcomes ÷ total possible outcomes.',
          'Probability is always between 0 (impossible) and 1 (certain).',
          'The sample space is the set of all possible outcomes, and outcomes must be equally likely.',
          'Two coins have 4 outcomes; two dice have 36; a coin and a die has 12.',
        ],
      },
      {
        heading: 'Complementary events',
        bullets: [
          'P(not A) = 1 − P(A).',
          '"At least one" problems are easiest as complements: P(at least one head) = 1 − P(no head).',
          'With three tosses, P(no head) = (1/2)³ = 1/8, so P(at least one head) = 7/8.',
        ],
      },
      {
        heading: '“Or” (union) and “and” (intersection)',
        bullets: [
          'Mutually exclusive events cannot happen together: rolling 2 or 5 → to add: P(A or B) = P(A) + P(B).',
          'Independent events: occurrence of this one does not affect the other: P(A and B) = P(A) × P(B).',
          'When not independent (e.g., drawing without replacement), adjust the total and remaining count after each selection.',
        ],
      },
      {
        heading: 'Without replacement (the classic trap)',
        bullets: [
          'Drawing two balls without replacement: the second probability uses one fewer in both the favourable and total counts.',
          'With replacement, the denominator stays the same each draw.',
          'Example: a bag has 3 red and 2 blue; two without replacement = (3/5)(2/4) = 6/20 = 3/10.',
        ],
      },
    ],
    examTip: 'State the sample space first in awkward questions — listing outcomes makes most probability MCQs mechanical.',
  },
]