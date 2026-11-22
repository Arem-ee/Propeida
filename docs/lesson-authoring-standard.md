# Lesson authoring standard: two tiers

This document governs lesson shape; `docs/agent-authoring-spec.md` governs
cold-start agents and is the first thing to read when picking the task up
without seeing this note. Where the two disagree, the agent-authoring-spec
wins.

Every published topic must have a lesson. This standard defines what "a lesson"
means so that 500+ topics can be authored consistently without turning into
essays.

## One concept per lesson

A lesson teaches **one concept**. The unit of authoring is not the syllabus
topic; it is the single thing a learner should be able to explain after three
minutes. Broad syllabus topics are therefore split into several narrow lessons
rather than inflated into one long one. "Basic Concepts of Government" stays one
lesson because power, authority and legitimacy are taught as one contrast;
"Occupation" splits into types of occupation and factors in choosing one.

The test is simple: if a lesson needs the word "also" to connect two sections
that could each carry their own exam question, it is two lessons.

## How a learner meets a topic for the first time

A lesson is written for a learner meeting the topic for the **first time**. The
author has deep knowledge of the topic; the learner has none. Two consequences
follow.

1. **No prior knowledge is assumed.** The lesson must teach any term, formula
   or symbol before it uses it, at the level the syllabus requires. The word
   "base" is defined; the word "exponent" is glossed; "remainder" is turned
   into a concrete sentence ("what is left over after the groups are taken
   out"). A concept in the core is never "obvious from context" or
   "obvious from the previous section". A reader with none of the surrounding
   material should still finish the lesson.
2. **Research first.** No lesson is written from the author's memory of the
   topic. The lesson is constructed from published curricula, teacher guides,
   worked-solution collections, and verification against the official IBASS /
   JAMB syllabus. Verify primary sources, not secondary summaries; keep
   sources so audits can trace claims back to their material. Publication
   without research is a reason to reject the commit.
   Research the **vocabulary** as well as the method: list the exact terms the textbook uses for the topic and use those terms everywhere, including checks and worked examples. Keep the list with the source. "Place value", not "place worth". A wrong word is a teaching failure.
3. **Follow the Nigerian classroom, not a pet order.** Research means the
   published Nigerian schemes: the NERDC curriculum documents, the official
   IBASS topic structure, and the teacher guides the Nigerian classroom
   actually uses (Learn Africa, Cambridge Nigerian edition, New
   Concept in Mathematics, New Excellence). Teach the topic in the order
   those materials teach it, in the terminology they use, and with the
   notation they hand to students.
   - Number bases are taught base-ten first (thousands, hundreds, tens,
     units with their worths), then other bases via the same table; then
     expansion; then conversion. Powers of the base are the column worths
     as they are raised (3² = 9, 3¹ = 3, 3⁰ = 1), shown as notation, not as
     column names.
   - **"Place value" means the base-ten columns and their worths:**
     thousands 1000, hundreds 100, tens 10, units 1. Other bases are not
     given invented column names (no "fives", "nines place", or "hundreds
     of base five"). Other places are referred to by their worth, the
     number itself. The power notation 3² means "three raised to the
     power 2", and the power is the exponent: the number of times a
     number should be multiplied by itself. Write it as "the column
     worth 9", never as a nickname for the column.
   - Order and gap-filling follow the Nigerian sequence: revise base ten
     first (thousands, hundreds, tens, units); then other bases as the same
     table with their worths (1, b, b², …); then expansion; then
     conversion written with the powers of the base in brackets beside the
     digits. Never invent a sequence the Nigerian classroom does not use.
   - If your own ordering feels more elegant, that is a reason to keep it
     out, not in.


A lesson that fails either test is unfinished, regardless of how correct the
content is. A correct answer installed on a missing foundation is not a lesson.

## Sentence length and register

The reader is young. Write proper, connected sentences that a thirteen-year-old
can parse on the first read. Do not chop ideas into fragments.

- **Proper, connected sentences.** Write a complete sentence with its subject
  and verb, then join the closely related ideas in that sentence with natural
  connectives (and, so, then, because). A chain of one-word or three-word
  sentences reads like notes, not like teaching. "The 4 is in the fives
  column, so we multiply it by 5 and get 20" is right. "The 4 sits in the
  fives column. Multiply it. 4 × 5." is wrong.
- **One main idea per sentence.** Two separate ideas belong in two connected
  sentences, not in one loaded sentence and not in a staccato list.
- **Simple English, level 4.** Prefer everyday words and short, direct
  phrasing. Keep any word that a correct definition cannot do without, even
  if it is a bigger word; simplify around it, not by removing it. Never change
  the meaning of a definition to make it simpler.
- **Follow the textbook.** Use the method, wording and notation the Nigerian
  textbook uses. Do not contradict it, and do not add an outside shortcut the
  textbook does not use unless it makes the idea genuinely simpler.
- **Quality over quantity.** Prefer a lesson that teaches well over a lesson
  that fits a word cap. Never delete good teaching to reach a number. Caps and
  budgets are warnings, not reasons to make the lesson worse.
- **Concrete before abstract.** Use scenarios, objects and numbers before
  symbols and rules. A definition that follows a worked example is
  rememberable; the same definition first is not.
- **No nested qualification.** Avoid em-dash asides, parenthetical
  pit stops, and nested second thoughts. If the sentence needs they, they
  are a new sentence.
- **No theatre.** Lines like "Here is the mark that disappears in silence" or
  "a circuit can be on or off" that perform significance without teaching the
  thing do not appear in a lesson. The learner is not a literary audience.
- **Natural, casual register.** Write the way a patient tutor talks across a
  table, not the way a spec is written. Avoid formal inversions, decorative
  vocabulary, words that mean one thing in the lesson and a broader thing in
  ordinary speech ("worth" as a noun for value), and any sentence that
  sounds like it was drafted to satisfy a requirement. Pick words that pass
  the spoken test: say the sentence aloud; if it sounds strained, rewrite.
  Prefer "doubles in value" to "doubles in worth", "a byte" to "a byte of
  eight binary digits" where the extras add nothing, and "you can combine
  bits to make any number" over "the binary representation scheme allows the
  formation of arbitrary integers".
- **"Decimal" means a dotted number, never base ten.** In ordinary use a
  decimal is 0.625, not the base-ten system. Do not define, introduce or
  re-label base ten as "decimal", anywhere in a lesson, example or prompt.
  Write "base ten" / "base-ten" explicitly. If you mean the dotted number
  (0.625), say "decimal point" or show the dotted numeral.
- **Predict-prompts are real questions, not meta-prompts.** Ask exactly what
  you would ask across the table: direct, plain, specific, answerable at once.
  Numbers first where the answer is numeric ("What is 18 plus 3 plus 0?"),
  concrete ("What are the three places worth in base three?"), never abstract
  ("How much is the place value worth?"). A prompt the learner cannot parse on
  first read is broken, whatever the answer is.

## Maths explanation shape: the patient-tutor walkthrough

Every mathematical explanation, whether it is a teaching card, a worked
example or the feedback under a check, is written the way a patient tutor
talks a student through a problem at a table. The student should feel the
topic is intuitive and effortless, not that a textbook has been compressed.

- **Lead with a concrete analogy.** Open with two or three sentences that
  anchor the whole idea in an everyday physical picture (a bag size, a bundle
  of counters, sharing oranges) before any formal term appears. The analogy
  must stay true for the whole topic and be tied back to at the end.
- **A one- or two-sentence plain summary of the main rule** follows the
  analogy, so the learner knows what they are about to do before the steps.
- **Numbered stages with clear headings.** In cards, use the card heading and
  prose stages; in worked examples, use the numbered `operation` field as the
  step heading ("Step 1: Write the place worths"). Progress from basic
  intuition to core mechanics, then shortcuts, then edge cases.
- **Explain the why inside every step, in plain English.** Never state a rule
  and leave it bare. Right after the operation, say why it is done, in words
  a thirteen-year-old uses at home: why remainders are read from the bottom,
  why a base cannot contain its own digit, why we multiply before adding.
- **One small mental leap per step.** If a step needs the learner to hold two
  new ideas at once, split it. This is stricter than "one idea per sentence":
  it applies to operations as well as prose.
- **Visual breathing room.** Keep related rules together, use bullets for
  quick reference lists, and give each major stage its own card or its own
  step block. Compact tables are good for comparing bases or cases; do not
  invent new visual components without the owner's say-so.
- **Final answer stated plainly at the bottom**, after every step has been
  shown, never only inside the working.
- **Plain English over jargon.** Introduce each formal term beside its
  everyday translation on first use: "remainders (leftovers)", "expanding
  (opening the number out)". Keep the textbook's necessary terms; simplify
  the language around them, not the definition.
- **One plain takeaway sentence at the end** that ties the topic back to the
  opening analogy.

Our renderer does not consume `$...$` or `$$...$$`: use `**bold**` for
emphasis and `{{sub:x}}` / `{{sup:x}}` / `{{frac:x|y}}` tokens for maths, with
maths-only lines left as plain lines so they become centred panels. The
horizontal rules from a chat answer are replaced by separate cards/steps in
our schema. Keep the encouraging, direct, jargon-free tone.

- **Worked examples use the v2 walkthrough shape.** Every worked example is a
  `problem`, a `finalAnswer` and numbered `steps` (`stepNumber`, `instruction`,
  `hint`, `explanation`). The whole solution is shown at once, each step
  explains the why, and the final answer is stated at the bottom. There is no
  per-step typing gate. The older operation/reason/result shape still renders
  for the other subjects; new authoring uses v2 only.

## Worked calculations and hierarchy

Calculations cannot be understood with prose alone. Every rule, shortcut or
method a lesson states is unfinished until it is followed by a worked instance
the reader can see being carried out. That includes the "obvious" ones: a
"quick way" with no example is not a way at all.

- **Never trap a calculation inside a prose sentence.** A procedure is not a
  clause in a sentence. The line that carries the working stands on its own,
  in reading order, one step per line.
- **Hierarchy in presentation.** Put a short sentence of setup first, then
  the working on its own lines. A paragraph that is maths only is set as a
  centred, tinted maths panel automatically; authors never type a prefix
  (`MATH:` is retired, and old `MATH:` prefixes still parse).
- **A full sentence never sits on a maths line.** The renderer keeps a line
  as prose when it finds a lowercase English word on it. Write the
  commentary as its own sentence before or after the working instead of
  tucking "units:", "mind the carry" or bracketed asides onto the maths
  line. Words stay in prose; maths stays on the working lines.
- **Every shortcut ships with a calculation instance.** If the lesson says
  "convert to decimal, do it there, then convert back", it must show one full
  conversion, start to finish, not just describe the route.
- **In worked and check steps, one fact per result.** A result string that
  chains three operations with semicolons or parentheses is three steps
  trapped in a sentence. Split it.
- **The 10-second section checks use the walkthrough shape too.** Each
  section card's inline check carries `summaryVerdict`, numbered `steps`
  with `title`, `explanation` and `workings`, and an optional `takeawayRule`.
  The mascot renders them through `MascotWalkthrough`, the same component as
  practice feedback. Legacy `operation/reason/result/predictPrompt` checks
  still render for the other subjects, but new authoring uses the walkthrough.
  The checker accepts either shape; do not author new legacy checks.
- **Bold the quantities that carry the idea** (the digits, the carries, the
  answers) so the eye lands on the working, not the prose.

A lesson with a method but no worked instance fails the commit just as surely
as a lesson with a wrong answer.

Violations fail the commit just as surely as a missing objective.


## Nigerian curriculum verification

The authoring standard controls shape; the Nigerian curriculum controls content.
Every lesson is checked against the official JAMB/IBASS topic before it is seeded:

- **Cover every objective and item on the linked topic.** The structured syllabus
  (`content-folder/jamb-syllabus/structured/<subject>.json`) is the checklist. A
  topic with empty `items` still has `objectives`, and those must be taught in
  the core. *Definition and Scope of Government*, for example, requires the
  definition, the characteristics and the functions of government, not the
  definition and functions alone.
- **Use Nigerian law and institutions as the authority.** For Government, cite
  the 1999 Constitution (as amended), the Federal Republic of Nigeria, the
  federal, state and local tiers, and the named institutions. Never describe a
  foreign system as if it were Nigerian.
- **Use Nigerian examples where the syllabus is Nigerian**, and say when an
  example is foreign. Generic situations are acceptable when they are plausible
  in Nigeria; dates, constitutions and institutions must be Nigerian and
  checkable.
- **Keep Nigerian and British spelling and terminology**: government,
  recognise, organisation, programme, Naira, Federal Government, National
  Assembly, State House of Assembly, local government council.
- **Match JAMB question style**: four options, one defensible key, plausible
  distractors from the same concept, and no "all of the above" unless the
  syllabus item requires it.
- **Check the exam discrimination.** If two concepts are commonly confused —
  state vs government, power vs authority, characteristics vs functions — the
  core must name the pair and give the rule.

## Reading flow

A lesson is read as section cards, not as a wall of text. The player shows one
card at a time, with progress ("Section 2 of 3"), an estimated reading time,
and a **Read it all at once** toggle for learners who prefer continuous prose.
Depth stays collapsed and outside this flow.

### The seven rules

1. **One concept per lesson.** Split anything broader.
2. **At most three sections.** Three is the ceiling, not a target.
3. **120–180 words per section.** Long enough to teach, short enough to finish
   in one sitting.
4. **Open with a situation.** Start with a concrete case, decision or mistake,
   then name the concept. Never open with a dictionary definition.
5. **One-line takeaway per section.** A single sentence the learner could repeat
   in the exam hall. It becomes a recap bullet.
6. **One ten-second check per section.** A single multiple-choice question that
   tests the section's claim, with a one-line reason. Answering is retrieval
   practice, not a grade; the check explains the right answer either way.
7. **No paragraph over three sentences; three-bullet recap.** The recap is the
   sections' takeaways, one line each.

A lesson that breaks rule 1 cannot be fixed by shortening its prose. Split it.

## Two tiers

| Tier | Required | Length | Purpose |
|---|---|---|---|
| **Core** | Yes | Uncapped | Teach the syllabus point well enough to attempt exam questions today. No upper word cap since 2026-11-14 (user directive, applied universally): use as many words as the content genuinely needs. The 500–800 band disappeared with this change; nothing so ordinary will fail again. |
| **Go deeper** | Optional | 600–900 words | Explain the mechanism, context, comparisons and edge cases for a learner who wants the full picture. |

Total teaching text is therefore uncapped. `check-lesson-depth.mjs` enforces only the 500-word floor against the embarrassing case (an unfinished lesson); exceeding it never fails again.

## How words are counted

Count prose the learner reads as teaching:

- `text` block headings, paragraphs and bullets
- `callout` text
- `worked_example` problem, step reasons and results
- `recap` text

Do **not** count question stems, options, hints, vocabulary cards or UI labels.
Depth sections count toward the depth budget only. The core budget is the sum of
everything outside `Go deeper:` sections.

## Core lesson

The core is the lesson. A learner who reads only the core should be able to
answer a standard JAMB question on the topic.

Structure, in order:

1. **Summary** — 25–40 words. The single claim the lesson exists to teach.
2. **Teaching sections** — exactly 1–3 sections, 120–180 words each.
   - Each section opens with a situation, then names and explains the concept.
   - Each section has a heading, 1–3 short paragraphs (three sentences max),
     and 2–4 bullets.
   - Each section ends with `takeaway`: one sentence, under 20 words.
   - Each section carries one `check`: a four-option question on that section's
     claim, plus a one-line `why`.
   - The first section may have an empty heading; it renders as the intro.
   - Where the lesson has a confusable pair, name it in a section and give the
     discrimination rule.
3. **Exam tip** — 1–2 sentences, 30–50 words. A decision rule, not a summary.
4. **Worked example** - one exam-style item, 3-6 named steps. Each step says
   what was done and why, not just the arithmetic or the answer. Calculations
   are laid out step by step, one step per line, and every step carries its
   explanation (the `reason` line): the tool to reach for and why it fits. The
   final step **checks to confirm**: it verifies the answer in a second,
   independent way (substitution back into the original relation, a rearrangement,
   or a units-and-magnitude sanity check), so a wrong answer announces itself.
   Confirmed 2026-11-14, recorded in `docs/question-bank-ingestion.md`
   ("Explanation format for maths and calculation questions").
   **An algorithm is taught only as worked examples, never as prose.** A procedure
   shipped inside a paragraph ("divide by b repeatedly, reading remainders upward")
   produces confident wrong work. Prose explains why the procedure exists; only a
   worked example shows it. Added 2026-11-14 after the Number Bases lesson shipped
   §2 "Converting between bases" as four prose sentences and failed comprehension
   review.
5. **Guided attempt** — one prompt with hints that scaffold the same skill.
6. **Independent attempt** — one or two questions without hints. These normally
   come from the topic-tagged question bank, not from the lesson JSON.

Optional core blocks: one `callout` for a misconception, `vocabulary_card` for
language subjects, `diagram`/`image_explainer` where a visual carries meaning.

A lesson told as a story, e.g. a full novel summary, may set `"shape": "reference"`
in the lesson object: the `worked_example`/`guided_question` requirement is
waived for it, bullet-frames, takeaways and checks stay optional in spirit, and
the 3-card warning is expected. Complete is the goal, not worksheets.

## Lesson images

A picture may carry a whole section. The shape, checked in `toLessonVisual`
and `check-lesson-depth.mjs`:

```json
{ "kind": "image",
  "src": "/lesson-art/example.svg",
  "alt": "What a screen reader hears",
  "caption": "One line on what to notice",
  "aspect": "wide" }
```

Rules: local assets only (served from `/public`, committed with the app, never
external URLs); `alt` is mandatory and honest; `aspect` is `wide` or
`portrait`; caption under 30 words; the aspect box pre-reserves its space so
the layout never jumps. Images explain how things look when words cannot;
they are never decoration.

### Core writing rules

- One idea per paragraph. If a paragraph needs "also", split it.
- Bullets are complete claims a student could be marked on, not fragments.
- Define jargon on first use, in the same sentence.
- Use Nigerian examples where the syllabus is Nigerian (Government, Economics,
  History, Literature set texts), and say when an example is foreign.
- No fabricated dates, statistics or quotations. If a number matters, give the
  source or use a qualitative statement instead.
- Prefer "because" over "it is important to note".
- Never write "In this lesson we will…" or "By the end you will…". Start with
  the content.

## Go deeper tier

Depth is optional reading that makes a correct answer feel inevitable. It is not
a second lesson and it is not revision of the core.

Use a heading of the exact form:

```
Go deeper: <specific title>
```

Rules:

- 2–3 depth sections, 180–300 words each, 2–4 bullets each.
- Each section must add something the core did not say. Good depth material:
  - the mechanism behind a result (why it happens, not just that it happens)
  - a comparison table or contrast between two confusable systems
  - historical or institutional context that explains a rule
  - a harder worked nuance, fully worked
  - the edge case that separates a top-band answer from a pass
- Do not repeat core sentences. Do not introduce a new dependency that the
  lesson's questions assume.
- Depth may be read out of order; each section should make sense alone.

The player keeps depth collapsed behind **Go deeper — optional**, excludes it
from the section cards, and never gates progress on it. No other change to the
lesson flow is needed.

## JSON shape

Lessons live in `content-folder/<subject>-curriculum.json` and are seeded by a
subject seeder. A core-plus-depth lesson uses ordinary `text` blocks; depth is
expressed only through the heading prefix:

```json
{
  "type": "text",
  "content": {
    "heading": "Why covering the field matters",
    "paragraphs": ["…"],
    "bullets": ["…"],
    "takeaway": "A vote is only free when the voter can choose without fear or payment.",
    "check": {
      "question": "Which situation best shows a free vote?",
      "options": ["A voter is paid…", "A voter is watched…", "A voter marks the ballot alone…", "A voter is threatened…"],
      "answer": 2,
      "why": "Secrecy removes the fear that makes a vote unfree."
    }
  }
}
```

`takeaway` is one sentence. `check.answer` is the zero-based index of the
correct option, and `why` is shown after any answer. Checks are retrieval
practice inside the reading flow; they are not written to the question bank or
the mastery model.

Do not add a new block type for depth. The mapping layer
(`lib/actions/lessons.ts`) already turns `text` blocks into note sections, and
the player splits on the heading prefix.

### The first text block is special

The mapping uses the first paragraph of the first `text` block as the lesson
summary and renders any later paragraphs as an untitled intro. Its bullets are
not shown. Keep the first block to one summary paragraph, with no bullets, and
start the taught sections in the second block.

## Visuals

A visual earns its place only when it carries a relationship prose handles
badly: a chain, an order, or a two-way contrast. It is never decoration, never
a restatement of one sentence, and never more than one per section card.

Two primitives ship:

| `kind` | Use it for | Shape |
|---|---|---|
| `flow` | a process that runs in reading order | 2–7 labelled steps, one optional second line each |
| `compare` | two alternatives judged against the same features | exactly 2 columns, 1–4 rows |

Put the figure in the section's `visual` field. It renders after the prose and
before the takeaway, in both section-card and read-all modes.

```json
"visual": {
  "kind": "flow",
  "caption": "Commerce carries the good from producer to consumer; each link adds a service.",
  "steps": [
    { "label": "Producer", "detail": "Grows the good" },
    { "label": "Trader", "detail": "Buys and resells" },
    { "label": "Consumer", "detail": "Buys to use" }
  ]
}
```

```json
"visual": {
  "kind": "compare",
  "caption": "The groups are separated by purpose, not by job title.",
  "columns": ["Commercial occupations", "Service occupations"],
  "rows": [
    { "feature": "Examples", "left": "Trader, banker, insurer", "right": "Teacher, doctor, lawyer" },
    { "feature": "Exam test", "left": "Does it move or finance goods?", "right": "Does it serve the person?" }
  ]
}
```

Rules:

- **One figure per section.** If a section needs two, it is two sections.
- **Seven nodes, four rows, maximum.** More than that means the lesson is
  teaching two ideas; split it.
- **Labels are text in the page**, not baked into an image. Label each node
  directly; no keys, legends or arrow numbers.
- **The caption states the relationship**, not the diagram type: "each link
  adds a service", not "a flow chart".
- **Keep nodes short.** Step labels under about six words and compare cells
  under fifteen, because they wrap first on a 360px phone. The compare table
  keeps both values side by side at that width.
- **Colour carries no meaning.** Every distinction must survive in the wording;
  the palette is semantic (ink, accent, rule), never per subject. Text meets
  4.5:1 and lines meet 3:1 against their background.
- **Do not count figure text in the word budget.** Captions and labels restate a
  relationship already taught; `scripts/check-lesson-depth.mjs` ignores them.
- **Prefer CSS and inline SVG.** A diagram built from DOM text stays crisp,
  themeable, searchable, translatable and readable by screen readers. Raster
  figures are not supported by this contract yet; when one is unavoidable it
  must be a real photograph or scan, not an AI-generated factual visual, and it
  must declare its dimensions, lazy-load, stay under about 60 KB, and carry a
  credit and licence.

The checker warns on an unknown `kind`, a missing caption, a flow outside 2–7
steps, repeated or over-long step labels, a compare that is not exactly two
columns, and more than four compare rows. Malformed figures are dropped at
render time, so a bad row never breaks a lesson.

### Checking a curriculum file

`node scripts/check-lesson-depth.mjs content-folder/<subject>-curriculum.json`
reports each lesson's core and depth word counts and fails on the wrong budget,
fewer than two depth sections, mis-typed `Go deeper` headings, duplicate
headings, or a missing worked example or guided prompt. With no argument it
checks every `content-folder/*-curriculum.json`.

### Seeding a subject

```bash
node --env-file=.env scripts/seed-curriculum.mjs government --dry-run
node --env-file=.env scripts/seed-curriculum.mjs government
```

The seeder matches a topic by `syllabus_ref` first and slug second, so an
authored topic lands on its spine row even when the two names differ. A lesson
can name an existing spine topic with `topic` (its slug) or `syllabus_ref`
without repeating the topic in the file; a file may contain only `lessons`.
Publishing a topic's first lesson also publishes the topic. A topic is otherwise
published only when the file supplies a lesson for it, when the row is already
published, or when the topic sets `published: true` explicitly. Lessons are
matched by `(subject, slug)`, linked through `topic` (defaults to the lesson
slug), and their blocks are replaced, never duplicated. Reviewer and source refs
already on a lesson row are preserved.

The older `scripts/seed-government-curriculum.mjs` and
`scripts/seed-economics-curriculum.mjs` remain as thin wrappers around this
command.

## Quality checklist

Before a lesson is seeded:

- [ ] Research was done against the published Nigerian schemes (NERDC
      curriculum, the IBASS topic structure, and the Nigerian classroom
      teacher guides), and order, terminology and notation match that
      sequence, not a private re-ordering.
- [ ] Every `syllabus_items` entry **and every syllabus objective** on the linked
      topic is taught by the core.
- [ ] The lesson teaches one concept; a second testable idea has its own lesson.
- [ ] No more than three sections, each 120–180 words.
- [ ] Each section opens with a situation, ends with a one-line takeaway, and
      carries one check with a stated `why`.
- [ ] No paragraph is longer than three sentences.
- [ ] Core teaches the point in full (uncapped since 2026-11-14); depth, if present, is 600–900 words. Quality wins over the counter; never trim a lesson to fit any word ceiling.
- [ ] Summary states one claim, not a table of contents.
- [ ] At least one section names a confusable pair and the discrimination rule.
- [ ] A visual, if present, is one figure, carries a relationship, has a
      relationship-stating caption, and fits the node limits above.
- [ ] Worked example is answerable from the core alone and has a stated answer.
- [ ] Guided prompt practices the same skill as the worked example.
- [ ] Facts, dates and figures are checkable; no placeholders or TODOs.
- [ ] Headings are sentence case, specific, and free of syllabus codes.
- [ ] Depth headings all start with `Go deeper:` and none repeat a core heading.
- [ ] The lesson reads correctly aloud in under five minutes for the core.

## Exemplar outline

`government` → **Basic Concepts of Government**:

- Core: state vs government vs nation; power, authority, legitimacy,
  sovereignty; the confusable pair "authority vs power"; one worked item on
  legitimacy; guided prompt asking for a Nigerian example of each concept.
- Depth: `Go deeper: How sovereignty is limited in practice` (membership of
  international organisations, borrowed powers, constitutional limits) and
  `Go deeper: Legitimacy, consent and the problem of coups` (why a government
  can hold power without authority).

This is the shape to copy: core covers the syllabus and the exam discrimination;
depth explains the part that makes the definitions stick.

## Anti-patterns

- A broad syllabus topic crammed into one lesson: split it into one-concept
  lessons instead of writing a longer one.
- A section that is really two ideas joined by "also".
- A check that asks about a detail the section did not teach.
- A 900-word core with no depth: the learner gets a wall before the first
  attempt.
- Depth that is only "more examples" of the core: no new understanding.
- A depth heading like `Go deeper: Introduction` — the title must say what the
  section adds.
- Copying the syllabus wording as the lesson text.
- Authoring independent questions inside the lesson JSON when a topic-tagged
  bank question exists; link the topic instead.
