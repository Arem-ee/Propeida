# English JAMB inventory — skill tagging status

**Companion:** `docs/english-exclusions.md`, `docs/english-curriculum-plan.md`,
`docs/propeida-learning-architecture.md` (question → topic → skill routing).

## What happened

- `content-folder/english-jamb-staged-clean-v3.json` — 4,401 records from the
  two source PDFs (1978–2020 JAMB Use of English) after consolidation, dedupe,
  cleanup and 20 verified rescues from the original 2018 quarantine wave.
- Every solved record (4,090) now carries:
  - `topic` — the curriculum topic slug (matches `lib/notes/content/english-curriculum.ts`),
  - `skill` — the sub-topic/skill slug (aligned with the 297-question `english-jamb-bank.json`),
  - `skillConfidence` — `low` | `medium` | `high`.

## Skill distribution (4,090)

| Skill | Count | Confidence predominance |
|---|---|---|
| synonym | 2,293 | mostly low — bulk of pre-2010 vocabulary items |
| vocabulary in context | 711 | mixed |
| sentence completion | 515 | mostly medium |
| tense | 73 | medium |
| inference | 71 | medium |
| subject-verb agreement | 67 | medium |
| vowel | 65 | high |
| spelling | 47 | medium |
| word stress | 46 | high |
| emphatic stress | 40 | high |
| main idea | 35 | medium |
| reported speech | 23 | medium |
| idiom in context | 22 | medium |
| question tag | 18 | high |
| word class | 15 | medium |
| degrees of comparison | 14 | high |
| consonant | 13 | high |
| conditional forms | 6 | high |
| cloze gap | 5 | high |
| relative pronoun | 3 | medium |
| sequence in a narration | 3 | low |
| inversion | 2 | medium |
| prepositions in time expressions | 2 | medium |
| antonyms | 1 | medium |

## Decision recorded (2026-11-12)

The user has explicitly elected to keep the current English bank **as-is**
and revisit distribution only once real user volume data exists. The
measured imbalance is logged here for the **nearest-future fix**; it does
not block anything in the near term.

Target shape (JAMB blueprint, 60 questions · 25 Comprehension / 25 Lexis /
10 Oral Forms, ≈ 42 / 42 / 17):

| Combined bank weight after staged seed | Current | Blueprint |
|---|---|---|
| A. Comprehension and Summary | 20.6% (904) | 41.7% (≈ 25) |
| B. Lexis and Structure | 74.6% (3,274) | 41.7% (≈ 25) |
| C. Oral Forms | 4.8% (209) | 16.7% (≈ 10) |

The inventory is unbalanced because the source papers are vocabulary-heavy,
not because of modelling error.

## What was **not** done

- **The ordinary-figurative-idiomatic-usage bucket was not re-tagged by hand** —
  the tagging pass was automated using a curated idiom list plus default
  heuristics. Most of those items are word-substitution questions whose answers
  are obvious that way; others need human review.
- **The skill field is not yet a meaningful learning signal across the bank.**
  If a student is weak on `antonyms`, the inventory will not surface those —
  the bank as-is lacks an `antonyms` topic slug because JAMB treats them as
  ordinary usage. To lift this, add the topic as a first-class split (it exists
  in the syllabus).
- **The "synonymy backbone" problem.** Because synonym questions predominate,
  the expanded bank looks dominated by vocabulary. Not because the questions
  are poorly balanced — because published JAMB English papers are vocabulary-heavy.
- **Export shape is not DB-ready.** `content-folder/english-jamb-bank-expanded.json`
  carries the correct `topic`/`skill` fields, but the DB seeder
  (`seed-english-jamb-bank.mjs`) reads the *published* `english-jamb-bank.json`,
  not this staging artifact. A new import pipeline is needed; none has been
  built and none has been applied.

## Known risks & honesty notes

- **The 2,666 low-confidence records are `synonym`-or-unspecified guesses.** They
  are not hand-verified per item. Each should be reviewed by the content team
  before being used to randomize students into skill-routed sessions.
- **"Low confidence" is the primary QA signal, not an indication to trust it.**
- **34 records of the inventory are excluded entirely** (`exclusionClass:
  obsolete-novels`) — see `docs/english-exclusions.md`. They cannot serve any
  current Propeida learner.
- **All answers remain hand-authored.** No external answer key was found even
  after extended search; every key derives from passage verification, syntax or
  meaning. This is good — but it is not equal to JAMB's official keys.
