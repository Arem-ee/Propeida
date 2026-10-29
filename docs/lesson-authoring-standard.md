# Lesson authoring standard: two tiers

Every published topic must have a lesson. This standard defines what "a lesson"
means so that 500+ topics can be authored consistently without turning into
essays.

A lesson has two tiers:

| Tier | Required | Length | Purpose |
|---|---|---|---|
| **Core** | Yes | 500–700 words | Teach the syllabus point well enough to attempt exam questions today. |
| **Go deeper** | Optional | 600–900 words | Explain the mechanism, context, comparisons and edge cases for a learner who wants the full picture. |

Total teaching text is therefore 500–700 words for a usable lesson, or
1,100–1,600 words when depth is present. Depth is never required to pass the
lesson or unlock practice.

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
2. **Teaching sections** — 3–5 sections, 100–200 words each.
   - Each section has a heading, 1–3 short paragraphs, and 2–4 bullets.
   - The first section may have an empty heading; it renders as the intro.
   - One section should name the exam discrimination: the pair of ideas
     students confuse and how to tell them apart.
3. **Exam tip** — 1–2 sentences, 30–50 words. A decision rule, not a summary.
4. **Worked example** — one exam-style item, 3–5 named steps. Each step says
   what was done and why, not just the arithmetic or the answer.
5. **Guided attempt** — one prompt with hints that scaffold the same skill.
6. **Independent attempt** — one or two questions without hints. These normally
   come from the topic-tagged question bank, not from the lesson JSON.

Optional core blocks: one `callout` for a misconception, `vocabulary_card` for
language subjects, `diagram`/`image_explainer` where a visual carries meaning.

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
from the 30-second preview, and never gates progress on it. No other change to
the lesson flow is needed.

## JSON shape

Lessons live in `content-folder/<subject>-curriculum.json` and are seeded by a
subject seeder. A core-plus-depth lesson uses ordinary `text` blocks; depth is
expressed only through the heading prefix:

```json
{
  "type": "text",
  "content": {
    "heading": "Go deeper: Why the doctrine of covering the field matters",
    "paragraphs": ["…"],
    "bullets": ["…"]
  }
}
```

Do not add a new block type for depth. The mapping layer
(`lib/actions/lessons.ts`) already turns `text` blocks into note sections, and
the player splits on the heading prefix.

### The first text block is special

The mapping uses the first paragraph of the first `text` block as the 30-second
summary and renders any later paragraphs as an untitled intro. Its bullets are
not shown. Keep the first block to one summary paragraph, with no bullets, and
start the taught sections in the second block.

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

- [ ] Every `syllabus_items` entry on the linked topic is taught by the core.
- [ ] Core is 500–700 words; depth, if present, is 600–900 words.
- [ ] Summary states one claim, not a table of contents.
- [ ] At least one section names a confusable pair and the discrimination rule.
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

- A 900-word core with no depth: the learner gets a wall before the first
  attempt.
- Depth that is only "more examples" of the core: no new understanding.
- A depth heading like `Go deeper: Introduction` — the title must say what the
  section adds.
- Copying the syllabus wording as the lesson text.
- Authoring independent questions inside the lesson JSON when a topic-tagged
  bank question exists; link the topic instead.
