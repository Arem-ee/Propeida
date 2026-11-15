# English expanded bank — production-readiness audit (2026-11-12)

**File audited:** `content-folder/english-jamb-bank-expanded.json` (4,090 records, JAMB 1978–2020 past papers, hand-authored answers).
**Companion inventory:** `content-folder/english-jamb-staged-clean-v3.json` (4,401 records; the attach-tool reservoir).
**Method:** full programmatic pass over every field of all 4,090 records; cross-checks against the staged inventory and the published bank; a stratified sample read of 48 records (topics × confidence tiers).
**State:** internal review material. NOT seeded. NOT to be published until (a) the review gate below passes and (b) legal/IP sign-off on JAMB past-paper-derived content.

## Headline

**Do not ship this bank as it stands.** It is a draft of a good bank, not an importable one. Zero format defects on structure (answers always point at an option, every record carries question, options, explanation, topic, difficulty, confidence and provenance) — but it silently dropped every comprehension passage in the publish conversion, and it still carries unverified facts: duplicate items, a fifth of its best-review-pool records hanging off a passage that isn't there, and no passage verification at all. A learner opening this bank today would see unanswerable questions with no context attached.

## What's clean (verified)

| Check | Result |
|---|---|
| Records with missing question text / explanation | 0 |
| `answer` matches an option key | 4,090 / 4,090 |
| Records with a `topic`, `difficulty`, `skill`, `skillConfidence` | 4,090 / 4,090 |
| Difficulty split | 1,531 easy · 2,074 medium · 485 hard (plausible) |
| Answer-letter balance | a 968 · b 1,049 · c 1,097 · d 838 (acceptable) |
| Watermark / URL residue ("MySchoolGist", links) | 0 |
| Mojibake (U+FFFD) | 0 |
| Duplicate stems vs the published 297 bank | 0 |
| Provenance present on every record (`source.file`, `source.year`) | 100% |
| Mojibake of punctuation | none |

## Format inventory (4,090)

| Bucket | Records | Verdict |
|---|---|---|
| 4 options A–D (JAMB 2013+ format) | 3,051 | Candidate shippable after review |
| 5 options A–E (pre-2013 papers) | 1,021 | Do **not** ship — cannot be normalised to A–D without keys |
| Malformed key sets (12 `b,c,d,e` missing A; 3 `a,c,d,e`; 2 `a,b,c,e`; 1 `a,b,d,e`) | 18 | Quarantine — repair in source PDF or drop |

## Findings, severity-ordered

### P0 — blocks any import

1. **Zero passages shipped with the bank. No record in the expanded file carries a `passage` field.**
   - 287 stems explicitly reference a passage (241 comprehension-question-skills, 46 synonyms) — e.g. *"The author observes that…"*, *"According to the passage…"* — with nothing to read.
   - 25 cloze-style blanks in stems (24 ordinary-figurative-idiomatic-usage, 1 number-agreement-and-concord), likewise without context.
   - Of the 287: 98 are recoverable from the staged inventory (`english-jamb-staged-clean-v3.json` holds 157 records with passages; 155 of those ids overlap the expanded bank). **The remaining 189, and all 25 cloze items, are unanswerable-in-app** — quarantine, or reauthor, or exclude.
   - 245 of the 287 sit inside the A–D set; **208 sit inside the A–D high+medium review pool**.
   - Closure path exists but is not free: re-attach (`scripts/reattach-english-passages-v3.py` over the v3 inventory), then **verify** every attachment. `passageVerified` is `false` on every v3 passage-bearing record today.

2. **True duplicates:** 374 identical stem+options+answer records. 296 of them are inside the A–D set alone; **95 are inside the 939-item A–D high+medium pool**. (Same stem with different options/answers — 173 groups — is fine: different years).

3. **Duplicate option text within a question:** 63 records (case-insensitive; 23 case-sensitive). 51 in the A–D set, **47 inside the high+medium pool** — e.g. *"coupes… coupes"*, *"lots of noise… lots of noise"*, *"Auditors generals… Auditors generals"*. Fixable or excludable case-by-case.

### P1 — quality-of-review risks

4. **Confidence profile is mostly LOW:** of 4,090 → 2,666 low (65%), 1,217 medium, 207 high. The "human review" the bank awaits is not a spot check — it is the bank. The A–D high+medium subset that anyone could reasonably defend is **939** (293 easy / 512 medium / 134 hard, 16 of 22 topics).
5. **8 records with uncertainty leakage in explanations** (4 unique texts, duplicated ×2 — e.g. *"Torch probably developed…"*, *"May well be asked means…"*): not defects per se, but they flag inferred answers that need a human eye, and the duplicates are caught by finding 2 anyway.
6. **Underline-target loss:** 4 stems reference an underlined phrase the parser flattened (2 unique items, both duplicated). Cosmetic once in context, breakage otherwise — they resolve automatically if the passage reattachment is done, else quarantine.

### P2 — informational

7. **12 stems exist in both A–D and A–E form** — no ambiguity for shipping if the split formats are handled.
8. **Topic coverage:** 17 of 22 curriculum topics present; missing `summary-writing`, `passage-description`, `passage-exposition`, `passage-argumentation`, `rhymes-and-homophones` (known since 2026-11-12).
9. **Answer letters, difficulty, skill tiers** — sane.
10. **Source provenance** proves every record derives from JAMB 1978–2020 papers (`source.file` = `Use-of-English-JAMB-Past-Questions-And-Answers.pdf`, years 1978–2020). These are third-party works. **No publication or seeding of this bank until JAMB/IP counsel signs off.** The published 297-question seeded bank is the only English content that may currently go live.

## What review's bottom line looks like

| Path | Records | What it takes |
|---|---|---|
| Import-ready slice (A–D, high+medium, no passage needed, deduped) | **~731 unique** (939 − 95 dups − 208 passage-dependent) | Mechanics + ~90 minutes of authoring fixes + human eye per record |
| Passage-recovery slice (A–D, high+medium, passage-dependent) | 84 recoverable | Re-attach + verify attachment per record (labour-heavy, biggest quality win) |
| Unrecoverable passage-dependent | 124 | Quarantine — do not import |
| Rest of A–D set (low confidence) | 2,112 | Full human review or quarantine — nobody can bless these at volume without reading them |
| A–E & malformed | 1,039 | Exclude from production release entirely |

## Gates, in order, before this bank is "production-ready"

1. Re-attach passages from v3; verify every attachment (`passageVerified: true`); quarantine unverifiable ones.
2. Delete true duplicates (keep canonical by id).
3. Fix or exclude the 63 duplicate-option records.
4. Re-quarantine/exclude the 18 malformed key sets.
5. Keep out all A–E (1,021) for a JAMB-format release.
6. Human review: the 731 + 84 passages = ~815 records, stratified by topic and difficulty, unresolved records dropped into quarantine. Do not ship "high confidence" labels the gate hasn't re-earned.
7. IP counsel sign-off on JAMB-sourced content **before any public release**.
8. Only then: the seed checklist in `docs/content-audit.md` Annex B (medium+ filter, source-label, smoke import, `question_topics` join).

**Recommendation:** pass = "approve with conditions" or better "keep in internal review". This bank does not go live behind a paywall that marketing already sells; it goes live after review passes *and* IP clears.
