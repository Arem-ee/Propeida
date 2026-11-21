# Cross-agent authoring spec: how to write one lesson safely

A cold-start agent picks this up with no prior conversation and produces a
lesson at the same bar as the Number Bases pilots. Every rule here exists
because one of them was broken in live content, unseen by the author, until a
reviewer caught it. Follow it literally; it is shorter than re-doing
reviewed lessons after the fact.

## What is in scope

- One lesson per file block in `content-folder/<subject>-curriculum.json`.
- Every claim is either in the official IBASS topic or in a sourced page.
  Nothing is authored from the agent's memory.
- No published lesson exists until the seed is confirmed against the live
  database row set.

What is NOT in scope without explicit instruction:

- Inventing or renaming a topic; changing which IBASS objectives map to which
  topic; seeding new topic rows in production. All of these are human
  decisions. Flag them and stop.
- Changing suite-wide inventories, exports, or bank files. Only the
  changes needed to teach the one lesson.
- Committing user WIP that isn't yours. Check `git status` before every
  commit; only stage the intended files.

## Source of truth, in order

1. `docs/lesson-authoring-standard.md` — the shape of a lesson.
2. `docs/agent-authoring-spec.md` — this file — the register and rules below.
3. The official IBASS PDF for the subject — `content-folder/jamb-syllabus/structured/<key>.json` names it; fetch it (`ibass.jamb.gov.ng/...`).
4. Nigerian classroom materials: Learn Africa *New Concept Mathematics*, Cambridge *New Excellence* (Nigerian edition), *New General Mathematics* (Macmillan, today, in shops), the official lesson notes (headteacher.ng, lessonotes.com, edudelight.org, learnafricaplc.com, classnotes.com.ng). Match these, not foreign sources.
5. Any document inside the repo trumps any sentence below if the two disagree.

## The hard rules (each one was broken before)

R.1 Zero prior knowledge assumed. Every term, symbol, formula, method and
word the learner could stumble on is defined in place, in plain English,
before the first use. "Base", "digit", "place value", "remainder",
"power" — taught in the lesson body, not assumed.
- **Never author calculations from memory.** The formula, the sequence of
  operations and the notation must come from the researched textbook, checked
  against a worked example from that source. Then choose the simplest and
  easiest version to grasp. A calculation you invented is a calculation you
  cannot trust.
- **Use the accepted system for Nigeria.** Words, formulas and notation must
  be the ones found in Nigerian textbooks. Borrow something from outside only
  if it makes the idea simpler to understand; otherwise it adds complexity and
  strange things we do not want. If you are unsure whether a term is Nigerian
  textbook language, do not use it.

R.2 Research first. Pull the IBASS topic goals and at least one full Nigerian
lesson note or teacher guide for the topic before writing a word. IBASS
recommends textbooks; follow the textbook's method and sequence, then break it
into smaller, logically separate pieces. Our difference from the big textbooks
is the breakdown, not a rewrite of the mathematics. Never deviate from the
recommended system. Never invent a sequence to fill a gap; say so instead.
- The **IBASS goals are the test of completeness**. Every goal listed for the
  topic ("convert one base to another", "perform four basic operations",
  "perform operations in modulo arithmetic") must be taught as its own
  distinct skill with its own worked instance. Surface resemblance is not
  coverage.
- **Each card advances one concept.** Cards that restate the same idea in
  different clothes ("bundles of five" three times) are a failure. State the
  progression before drafting: what the learner knows after card 1 that they
  did not know before, and so on. Lessons in a series must also progress:
  concept, then conversion, then operations, then modular arithmetic — never
  three versions of the introduction.

R.3 Follow the Nigerian classroom order. Teach in the order the Nigerian
books teach:
- number bases are taught via thousands, hundreds, tens, units FIRST, then
  other bases via the same table, then expansion, then conversion, then operations.
- "Place value" means the base-ten columns and their worths: thousands
  (1000), hundreds (100), tens (10), units (1). Other bases are NOT given
  invented English column names (no "fives column", "nines place", 
  "hundreds of base five"). Their columns are referred to by their worth
  (the number itself). Write "the column worth 9", not a nickname.
- "Power" is the exponent — the number of times a number should be multiplied
  by itself. 3^2 means "three raised to the power 2". It is shown as
  powers-of-the-base notation: 3², 3¹, 3⁰.
- Never reorder anything because your order "feels better". Your taste is
  not evidence.
- Structure the lesson so that teaching keeps the textbook order: base-ten
  table first, then other bases' worths (1, b, b^2, …), then expand and add,
  then convert.

R.4 British spelling, British punctuation. colour, programme, judgement. No
American spellings. No em dashes or en dashes anywhere in lesson text. Same
rules apply to every learner-facing explanation outside lessons (step
reasons, check `why` lines, guided hints, mascot lines, topic descriptions).

R.5 Natural, casual, spoken register. The lesson is written for a
thirteen-year-old to parse on the first read. Write **proper, connected
sentences**, not fragments. Join closely related ideas with natural connectives
(and, so, then, because). One main idea per sentence, simple everyday English
at roughly level 4, with any essential definition word kept even when it is a
bigger word. Follow the textbook's wording and notation; do not contradict it.
Every sentence should sound right when said aloud to a patient tutor. No
decorative phrasing, no theatre ("the mark that disappears in silence"), no
nested qualifications or asides in brackets/em dashes, no "obviously", no "of
course", no "in fact".
- **Quality over quantity.** Never cut good teaching, steps or examples to fit
  a word cap. Budgets are warnings. A lesson that teaches well wins over a
  shorter one every time.

R.6 Concrete before abstract. Scenarios, objects, numbers first; symbols
and rules after. Definition follows worked example; rule follows instance.

R.7 Calculations are not prose. Any working the learner is meant to
perform stands on its own line(s) in reading order, each line doing one
thing. Never trap a calculation inside a sentence.
- Write working lines as plain lines in the body. Do NOT type "MATH:"
  anywhere — the renderer detects maths-only lines and sets them as centred
  panels automatically.
- A sentence never carries math in it unless the whole line is math-only.
- If math appears mixed into a sentence, it must contain at least one
  English word, and it stays inline (looks like: "so the sum is 1×25 + 0×5 +
  0×1 = 25"). Pure-maths lines are panels; mixed lines are prose.

R.8 Every rule teaches its own example. A rule, shortcut, formula, or
method stated without a worked instance beside it is unfinished work. If you
write "convert to base ten, do it there, then convert back", the next block
is the full round trip done once, labels included.

R.9 Worked examples end with "Check to confirm:" — the final step, a
independent verification of the answer, never the same method twice.

R.10 Working steps carry predictPrompts. Not "Which numbers work with
each other first?" — plain, answerable questions with concrete answers:
"How much is each place in base three worth?", "What is 18 plus 3?". If a
learner cannot parse the ask in one read, the prompt is broken. Numbers
first when the answer is numeric.
- **The reason must not leak the answer.** The reason states the rule or
  principle ("each place is three times the one before it"); the result
  carries the numbers for this question ("1, 3 and 9"); the prompt asks
  for the concrete next computation. If the prompt can be answered by
  reading the reason above it, the prediction is copying, not recall,
  and the step must be rewritten.

R.11 **Never skip a step in a calculation.** This includes the "obvious"
operations: calculating the place worth before multiplying (3² = 3 × 3 = 9),
writing each remainder line in a division, multiplying each digit separately
before adding. A worked example that jumps from a numeral to its expanded sum
in one line is broken. The test: can a learner follow every operation without
doing hidden arithmetic in their head? If not, split the step. Two lines for a
conversion is almost always too few.

R.12 "Decimal" means a dotted number, never base ten. Never define
base ten as decimal. Write "base ten". Zero occurrences in anything you ship.

R.13 Other base column naming, explicitly banned everywhere:
- "fives column", "fives place", "threes column", "nines column",
  "twenty-fives place", "eights column", "sixty-fours place", "twos digit",
  "twos place" — none of these exist. Use position+worth: "the ones column"
  (worth 1), "the column worth 5", "the column worth eight",
  "the column worth sixty-four", "the middle column", "the next place to
  the left". "Units" is acceptable for the worth-1 column of any base.

R.14 bold contract. `**…**` renders as bold inside body and step text.
Bold the numbers and key words in worked steps and intro paragraphs so the
eye lands on the working, not the prose. Never bold a full sentence; never
bold a calculation inside a maths-only panel (KaTeX strips `**`).

R.15 Core and depth budgets. Core: 500 words soft cap (750+ is a warning,
not a law) but never reduce content to fit a counter. Depth (`Go deeper:`
sections): 600–900 words, at least two sections; depth sections appear only
at the end of the lesson. One lesson, one concept.

R.16 Every section card opens with the situation, then the concept; ends
on a one-line takeaway; carries an inline check with a `why` line and
procedural `steps` for the check's own answer. Inline checks are JAMB-style,
four options, plus a `why` string every time.

R.17 **Patient-tutor walkthrough shape (maths).** Every maths explanation,
in a card, worked example or check feedback, follows this shape:
 1. a two or three sentence concrete analogy from everyday life, true for the
    whole topic, named before formal terms;
 2. a one or two sentence plain summary of the main rule;
 3. numbered stages (`operation` field in worked examples) that build from
    intuition to mechanics to shortcuts to edge cases;
 4. a plain-English "why" beside every operation, never a bare rule;
 5. one small mental leap per step, even when the prose is already short;
 6. bullets or a compact table for quick comparison, separate cards or steps
    for major stages;
 7. the final answer stated plainly at the bottom after the working;
 8. formal terms introduced with their everyday translation, with the
    textbook's necessary words kept;
 9. one plain takeaway sentence tying the topic back to the opening analogy.
- Formatting in this renderer: `**bold**`, `{{sub:x}}`, `{{sup:x}}`,
  `{{frac:x|y}}`, maths-only lines as plain lines (auto panels). Chat-style
  `$...$`, `$$...$$` and `---` are not consumed here; do not use them.

R.18 Render and inspect the actual page before declaring the work done.
Data checks and seed verification prove the bytes landed; they do not
prove the page looks right. Open the rendered lesson in a browser and
look at it (the public preview route is
`/preview/lesson-db/<subject>/<slug>`), or the page you changed for any
other implementation. Check the things that can survive every script:
bare superscript tokens rendering as floating `²`, broken bold spans,
missing glossary underlines, mangled fractions, overflow, and the
mobile width. If you cannot render it, say so explicitly and do not
claim the work is visually verified. This rule applies to every
implementation, not only lessons.

## Pipeline

1. Locate the lesson in the subject's curriculum file. Read the IBASS topic
   PDF + at least one Nigerian lesson note before drafting.
2. Draft section by section in plain sentences; never write padding like
   "In this lesson we will…". The first paragraph is the situation.
3. Depth sections written last; depth check enforces 600–900 words.
4. Verify:
   - `node scripts/check-lesson-depth.mjs <file> 2>&1 | grep -i <slug>`
   - KaTeX panel scan: render every maths-only panel through katex and check
     for thrown errors; zero tolerance.
   - `node --env-file=.env scripts/_seed-bio-changed.mjs <file>` to seed the
     production rows, then confirm the exact `lessons` row and blocks live.
   - `npm run typecheck` — must pass.
5. Commit with the lesson name and the rules this commit applies. Never
   stage other files' WIP.

## Banned words and forms (full list)

- decimal = base ten — replace with base ten everywhere in lessons
- column nicknames as in R.12
- "expand" for multiply-and-sum; use "convert … and add …"
  or "open out"
- "remainders read upward" register; use "read the remainders back from
  bottom row upward"
- "units" is accepted only as the name of the worth-1 column
- "worth of a column" vs "place value": place value = named base-ten
  columns and their worths (thousands/hundreds/tens/units); other columns
  get no names
- theatre or performed emphasis: "the weight falls", "the mark vanishes",
  "here is the trap" with no worked instance following it
- filler sentences: "In this lesson we…", "In the next section we…",
  "You might be wondering…"
- super-formal phrasing: "in order to", "in other words" when "so" would do

## Validations used, and how to run them

```
# word budget / shape
node scripts/check-lesson-depth.mjs content-folder/<subject>-curriculum.json

# KaTeX panels never crash
node scripts/check-lesson-depth.mjs content-folder/<subject>-curriculum.json
# (a built-in pass prints tag counts: "KaTeX panel errors: 0")

# seed change in production
node --env-file=.env scripts/_seed-bio-changed.mjs content-folder/<subject>-curriculum.json

# Typecheck (only when editing code)
npm run typecheck

# Proof of sanity: no banned strings anywhere after the edit
node -e "const s=require('fs').readFileSync(process.argv[1],'utf8'); for (const w of ['decimal','threes column','nines column','fives column','twenty-fives','eights column','sixty-fours','twos digit','twos place']) { const n = (s.match(new RegExp(w,'gi'))??[]).length; if (n) console.log(String(n).padStart(3),'×',w) }" content-folder/<file>.json
# expected: nothing printed
```

## Files agents are forbidden to invent or rename without the user

- Any file in `app/`, `components/`, `lib/`, `supabase/migrations/` not
  named earlier
- `docs/lesson-authoring-standard.md`, `docs/deferred.md`, `docs/audit-*.md`
- Any `*-curriculum.json` entry outside the lesson being authored
- Any new topic row, or any change to `sort_order` of topics/lessons
- Anything involving secrets, `.env*`, or service role keys

If you finish a lesson and discover it needs one of those, stop and ask
first. The lesson waits.

## Self-audit the author must run before seeding

The user reads the rendered page; the author's job is maths-recheck and
rule-recheck. One pass per each of these, all must pass:

- every predictPrompt reads naturally aloud;
- every worked example ends with a Check to confirm step;
- every Go deeper heading starts with `Go deeper:`;
- every check carries an `answer` index inside `options`, a `why` string,
  and procedural `steps`;
- every reported addition/substitution is recomputed by hand on paper
  (never trust a calculator alone for the result in the lesson);
- British spelling throughout; no em dash; no banned strings listed in
  the section above.
