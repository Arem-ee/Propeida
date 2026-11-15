# Content audit — syllabus vs question banks (2026-11-08)

**Method.** Each bank JSON in `content-folder/` (the actual seeded
source) compared against the official JAMB structured syllabus in
`content-folder/jamb-syllabus/structured/`. DB counts verified live on
2026-11-08. English was audited first, then the rest.

**Headline: the JAMB syllabi are richer than every bank built from them.**
The documents carry 23–33 topics with 78–125 sub-items per subject; the
banks sample a thin slice. Format, not coverage, is the strength: every
bank question is 4 options A–D (JAMB format since 2013), tagged to a
curriculum topic, difficulty-graded.

## English — bank 297, DB 297 (seeded, verified)

Syllabus paper: 60 questions = 25 Comprehension / 25 Lexis / 10 Oral Forms.

| | Bank | vs paper |
|---|---|---|
| A. Comprehension | ~98 | 42% of paper |
| B. Lexis & Structure | ~154 | 42% of paper |
| C. Oral Forms | 45 | 17% of paper — closed |

Format ✓. Difficulty: 125 easy / 128 medium / 44 hard. 30 comprehension questions over 6 recent passages were authored into A–D form and seeded (expository, argumentative and vocabulary-in-context skills). A further **160 actual JAMB 2018 and 2015 questions** were sourced, solved, explanation-authored and seeded in five production batches: selected high-confidence items from 2018 Q1–30 (27), Q31–67 (35; Q40/Q41 skipped for defective items), Q68–100 (31; Q93/Q95 skipped for garbled or ambiguous items), selected 2015 conflict-management/sentence-interpretation/antonym/synonym items (28), and 2015 Q61–100 (39; Q71 skipped because the source omits it). A–D normalization used only removal of a non-answer distractor and relettering.
Ingredients on hand: **~5,000 past questions** across `USE-OF-ENGLISH`
compedium (1978–2020, ~3,400 q's) + compact PDF (~1,600). **Neither PDF
carries a usable answer key** — "ANSWERS YYYY" markers are running
headers, key content absent. Parsed questions cannot enter the product
without authoring. Passage extraction accounted 344 markers; the cleaned
passage bank (`english-comprehension-passages.json`) holds **49 passages**
(2002–2020, capped ~350 words, watermark-stripped); raw 58 preserved in
`.raw.json`. The remaining 19 passages are ingredient for future question
authoring, not a parse pipeline. Pre-2013 papers are 5-option A–E and cannot be
normalized to A–D without keys.

## Mathematics — bank 50, DB 50 published

Syllabus: **23 topics, 78 items.** Bank covers **4 topics**:
indices, logarithms and surds · polynomials · trigonometry · probability
(10q each). **19 topics uncovered**, including number bases, sets,
variation, progression, differentiation, integration, geometry,
mensuration, statistics, combinatorics.
Difficulty 23 easy / 22 medium / 5 hard. One full 100-question mock can
nearly exhaust the bank. **Sharpest gap in the company.**

## Government — bank 104, DB 104 published

Bank built from multiple files (2020 paper + coverage + foundations +
2019). **12 topic clusters of 33 syllabus topics.** Visible gaps:
civil service, the electoral process, pressure groups, public opinion,
local government, the legislature (slug conventions across bank files
differ; the map is accurate to ±2 topics). Difficulty 11 / 23 / 6.
Strongest of the four banks; closest to mock depth.

## Economics — bank 70, DB 70 published

Bank topics: basics, demand & supply, production & costs, market
structures, money & inflation, financial institutions, public finance,
consumer behaviour, national income, population, agriculture & industry,
international trade, business organisations. **18 of 23 syllabus topics
(narrower than maths, wider than govt).**

The failure is quality, not coverage: difficulty **26 easy / 27 medium /
1 hard** — the bank recalls concepts; the paper applies them. Deepen the
*top* of the bank, not the count.

## UNILORIN Post-UTME — 1,074 published (no bank JSON)

Depth vs the 34/34/32 mock blueprint: English ~10 sets, Maths ~9,
Current Affairs ~14 — adequate. Difficulty is healthier than JAMB's
banks (e.g. English 94 / 136 / 98). **Known blind spot: no topic
tagging, so Post-UTME syllabus coverage is unprovable without a
reading pass.** UNILORIN English has no Oral Forms content yet (the
30 authored items are JAMB-scoped)).

## System-level notes

- 6 exam rows exist (jamb, unilorin-post-utme, waec, scholarship,
  aptitude, postgraduate); only jamb + unilorin have any published
  questions. The other four are inert content-wise.
- Topics: 676 shared (exam_id null) + 22 scoped to one exam.
- Exam cycles: one JAMB 2027 (unverified, dates reported both Mar and
  Apr 2027); **no UNILORIN cycle** — Post-UTME learners correctly see
  no countdown until dates are official.
- Lessons (separate track): 217 published across 8 subjects; 228 in
  curriculum files (11 unseeded); every lesson passes the two-tier
  authoring standard (`scripts/check-lesson-depth.mjs`).

## Content priorities (output of this audit)

1. JAMB question bank breadth — maths first (19 topics at zero).
2. Economics hard ends (more application questions, not recall).
4. UNILORIN coverage: add topic tags to questions so coverage becomes
   measurable, and mirror existing content across paths carefully.

---

# Annex A — inventory snapshot (2026-11-12)

**Method.** File-level re-count of `content-folder/` on 2026-11-12. No DB
queries were executed; DB figures below are inherited from the 2026-11-08
snapshot above or marked as unverified. Full file inventory and per-subject
gap list: `docs/content-inventory-2026-11-12.md`.

## English — inventory built, bank unchanged (297 seeded)

The staged English inventory (Option A–D era questions from two JAMB source
PDFs) has been parsed, deduplicated, hand-solved and tagged:

- **4,401 records** after dedup; **4,090 solved** (hand-authored answers,
  passage-verified where attached; 0 defects in final QA pass); **311
  quarantine** (34 of which are obsolete prescribed-novel items — The
  Potter's Wheel / The Successors / The Last Days at Forcados High School,
  excluded from any import).
- `english-jamb-bank-expanded.json` carries the 4,090 in publish shape
  (question, options, topic, difficulty, explanation, `skill` +
  `skillConfidence`). **It is internal-review material — NOT seeded, NOT to
  be imported without the production-hardening checklist (annex B) and user
  sign-off.**
- Topic coverage, expanded inventory alone: **17 of 22** real topics
  (missing: summary-writing, passage-description, passage-exposition,
  passage-argumentation, rhymes-and-homophones). Combined 297 + 4,090 =
  4,387 questions → **22 of 22 topics (100%)**.
- Section weight (combined 4,387): **A. Comprehension 20.6% (904) ·
  B. Lexis & Structure 74.6% (3,274) · C. Oral Forms 4.8% (209)** vs the
  JAMB blueprint ≈ 41.7 / 41.7 / 16.7. Blueprint-imbalance gap is recorded
  in `docs/english-skill-mapping.md` (2026-11-12).
- **Decision (user, 2026-11-12): keep the current English bank as-is until
  real user volume justifies a re-balance. No re-balancing done, none
  scheduled.**
- 6 stale `english-jamb-staged*.json` intermediates were moved to
  `content-folder/_archive/` on 2026-11-12 (untracked in git;
  `english-jamb-staged-clean-v3.json` retained as the canonical working
  inventory, SHA256
  `5D9EED2B69078E23DBE08C598D5F8CC15417EC9F69C287400BC577A643105E71`).
- Topic-tag → `question_topics` linkage and the seed of the expanded bank
  remain **pending** (step 3 of the user directive).

## Subject file-presence re-check (2026-11-12)

| Subject | Bank file(s) in `content-folder/` | Count | Seeded |
|---|---|---|---|
| English | `english-jamb-bank.json` + `english-jamb-bank-expanded.json` (staged) | 297 / 4,090 | 297 only |
| Mathematics | `maths-jamb-bank.json` | 50 | 50 |
| Government | `government-jamb-bank.json` + `-2019-` + `-coverage-` + `-foundations-` | 40 + 32 + 20 + 12 = 104 | 104 |
| Economics | `economics-jamb-bank.json` + `economics-2014-bank.json` | 54 + 16 = 70 | 70 |
| Biology | none | 0 | — |
| Chemistry | none | 0 | — |
| Physics | none (PDF parsed only; 3-topic curriculum stub) | 0 | — |
| Commerce | none (PDF parsed only) | 0 | — |
| CRK / Literature / Accounts | none | 0 | — |
| Lekki Headmaster (novel) | `lekki-headmaster-bank.json` | 72 | unverified this pass |

## Mathematics — extension staged (2026-11-12)

- `content-folder/maths-jamb-bank-extension.json` holds **125 hand-authored
  questions across the 25 curriculum topics missing from the published bank**
  (5 each; 41 easy / 56 medium / 28 hard). Topic set is disjoint from the
  seeded bank (indices, surds, quadratic-equations, trigonometry, probability).
- Combined coverage: **all 30 topics** in `mathematics-curriculum.json` now
  have at least 5 questions (verified by
  `scripts/check-maths-jamb-bank-extension.mjs`, which also validates format,
  option keys, answer keys, and cross-bank duplication).
- **Not seeded, not imported.** Import requires user sign-off and
  `scripts/check-maths-jamb-bank-extension.mjs` to pass (it does).
  `scripts/seed-maths-jamb-bank.mjs` was created with the same hardening
  contract as the English seeder (`--dry-run` verified read-only against the
  DB: 125 eligible, 0 duplicates, no unmapped slugs).
- Note: the maths curriculum carries two legacy umbrella slugs
  (`number-bases-modular-arithmetic` alongside `modular-arithmetic`,
  `fractions-decimals-approximations` alongside `percentages`, and
  `indices-logarithms-and-surds`) that overlap; the extension authors into
  all curriculum slugs rather than delete them, so the DB seed will tag
  whichever slug is live per topic row. Curriculum deduplication is a
  product decision, not made here.

## Gaps unchanged since 2026-11-08 (except where noted)

Mathematics file-level coverage now complete (all 30 slugs, extension
staged — see above); **DB still carries only the 50 published questions**.
Economics application-difficulty thin (1 hard) · Government 12/33 topic
clusters · Post-UTME topic tags missing · current-affairs, chemistry,
biology, commerce, physics: no JAMB bank at all · the two source PDFs carry
no usable answer key; pre-2013 papers are 5-option A–E and stay out.

# Annex B — production-hardening checklist (English expanded import)

Applies before any seed/import of `english-jamb-bank-expanded.json`.
Checklist, not permission: **seeding requires separate user sign-off.**

1. Parameterise `scripts/seed-english-jamb-bank.mjs` so the source file
   (publish bank vs expanded) is an argument, not a hard-coded path.
2. Filter by `skillConfidence` (`high` + `medium` only initially; `low`
   after review) or document an explicit decision to ship all four classes.
3. Map each question's `topic` slug to the DB topic via
   `topicBySlug`; fail the seed on any unmapped slug (no silent drops).
   Verify `question_topics` rows are created, not just `questions`.
4. Confirm `question_answers` mirror stays correct (no key leakage).
5. Run 3–5 smoke records through the import in a staging context; verify
   the join + counts in the DB before commit.
6. Copyright/content review of JAMB past-paper-derived material with
   counsel **before any public release** — the expanded inventory is
   internal-review material until that clears.
7. Mark `english-jamb-bank-expanded.json` as internal-review-only (path or
   note) so it cannot be shipped by accident.
8. Re-run `docs/content-audit.md` annexes after seed; update DB counts.

