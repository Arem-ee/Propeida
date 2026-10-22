# Use of English — build plan

The JAMB UTME Use of English syllabus, turned into lessons and questions.

Source of truth: the official JAMB syllabus, extracted to
`content-folder/jamb-syllabus/english.md` from JAMB's own IBASS server.
The topic tree, the lesson slugs and the ordering live in
`lib/notes/content/english-curriculum.ts` — one file, and both the app and
the seed scripts read it.

## What the exam looks like

60 questions, three sections:

| Section | Title | Questions |
|---|---|---:|
| A | Comprehension and Summary | 25 |
| B | Lexis and Structure | 25 |
| C | Oral Forms | 10 |

Section A: 1 comprehension passage (5), 1 summary passage (5), 1 cloze
passage (10), 1 reading text (5).
Section B: sentence interpretation (5), antonyms (5), synonyms (5), basic
grammar (10).
Section C: vowels (2), consonants (2), rhymes (2), word stress (2),
emphatic stress (2).

## The five phases

### Phase 1 — Curriculum spine ✅

The syllabus becomes a queryable tree.

- 22 topics across sections A (7), B (10), C (5), each carrying its
  syllabus item reference and objective
- Every topic has a lesson row: 5 already published, 17 drafted for the
  content phases
- 17 prerequisite edges, so a learner who keeps failing a topic is routed
  to its cause
- `lessons.sort_order` replaces `created_at` for curriculum order
- The subject page renders the map: sections, topics, what is ready and
  what is coming

**Status: done.** `4e5fa19`.

### Phase 2 — Section A: Comprehension and Summary

Six lessons to write: description, narration, exposition, argumentation and
persuasion, summary writing, the cloze test.

- Evidence-tapped passages: ~200 words, mixed disciplines, as the syllabus
  requires. Each question declares the exact sentences that prove its
  answer, resolved to character offsets at seed time so the highlight can
  never drift from the passage
- Worked examples with prediction gates, minimal pairs, sentence rebuilds
- The cloze lesson is the hardest: the gaps are grammar questions wearing
  a passage costume, and the teaching has to show the learner to read the
  gap rather than the story

### Phase 3 — Section B: Lexis and Structure

Nine lessons to write: synonyms, antonyms, clause and sentence patterns,
word classes and functions, mood/tense/aspect, number/agreement/concord,
degrees of comparison, question tags, mechanics.

- Vocabulary cards for the high-yield words, each with definition,
  contrast and a sentence
- Minimal pairs for the traps: subject-verb agreement across a
  prepositional phrase, neither/nor agreement, inversion after hardly
- Sentence rebuilds, because JAMB tests sentence patterns by breaking a
  sentence and asking you to repair it

### Phase 4 — Section C: Oral Forms

Five lessons to write: vowels (monothongs, diphthongs, triphthongs),
consonants and clusters, rhymes and homophones, word stress, emphatic
stress.

- IPA for every sound taught
- Pronunciation minimal pairs — the ones that actually decide the answer
  (ship/sheep, full/fool, beat/bit)
- Audio explainer blocks: the only section that is genuinely heard rather
  than read

### Phase 5 — Question bank, exam wiring and audit

- A JAMB-aligned bank built to the 60-question structure above
- Every question tagged to a topic (`question_topics` is currently empty)
- The 328 existing Post-UTME English questions tagged and their sources
  corrected; only 3 are manually verified today
- The `jamb` exam wired to English so the structure can be practised
- Full audit: every syllabus objective has questions, every answer key is
  correct, nothing learner-readable holds a key

## Rules that apply to every phase

1. **The syllabus is the specification.** Every lesson traces to a syllabus
   item. Nothing is taught because it seemed useful.
2. **Answers never reach the learner.** The key lives in `question_answers`,
   which the learner role cannot read.
3. **Evidence is computed, not counted.** Passage highlights are resolved
   from substrings at seed time, so a passage edit cannot leave a question
   pointing at the wrong sentence.
4. **Publish deliberately.** Draft is a first-class state. A lesson is
   published only when its content is complete and checked.
5. **The map stays honest.** A topic without content shows as *Coming*,
   not as a broken link.
