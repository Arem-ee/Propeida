# Propeida — content-folder inventory & production gaps

**Date:** 2026-11-12
**Method.** Files-level audit of `content-folder/` only (this is a file
inventory, **not** a DB count). All DB-side claims remain inherited from
`docs/content-audit.md` (printed 2026-11-08). Inferred content quality
needs a human read of the actual 4,090 expansions; whether the DB is in
a desired state is still a separate verification step.

Scope: everything tracked in `content-folder/` of the working tree at
`.gitignore`-allowed state. Listed in the order of *production readiness*,
not file size.

---

## TL;DR — what blocks a "ship everything" build today

1. **English** is the only subject with useable material for an
   expansion (4,090 hand-authored answers traced to passages/comprehension).
   311 records quarantine, including the 34 prescribed-novel items
   (excluded until JAMB stops printing them).
2. **Mathematics** is the **largest hard gap in the DB**: 50 published
   questions across 30 syllabus topics, but a 125-question authored
   extension covering all 25 missing topics is now staged on disk
   (`content-folder/maths-jamb-bank-extension.json`, checker passes,
   `--dry-run` clean — not seeded pending sign-off).
3. **Physics** has only 3 topics curriculum-wide and 3 lessons. **No bank
   of JAMB questions is seeded** yet (PHYSICS lives only as a parsed PDF,
   not in the bank JSON format).
4. **Chemistry** carries 17 topics and 44 lessons but **no bank JSON file**
   exists yet; chemistry questions live only in the parsed PDF.
5. **CRK / Literature / Accounts / Commerce** exist as PDFs+parsed JSON,
   but have no bank JSON and are not seeded. Commerce has a curriculum.
6. **Post-UTME** track has its own path and 1,074 questions seeded (per `docs/content-audit.md`) with topic tags missing — coverage is unprovable without a verification pass.

---

## A. Subject banks and curricula — exact inventory

Counts verified 2026-11-12 by reading the JSON files directly.

| Subject | Curriculum file (present? topics) | Bank file(s) present? count | DB seeded? seeded at 2026-11-08 | Status |
|---|---|---|---|---|
| English | ✔ (24 raw topics / 22 real + 2 section tags · 25 lessons) | ✔ `english-jamb-bank.json` — **297** (published); ✔ `english-jamb-bank-expanded.json` — **4,090** (staged, *not seeded*; skill-tagged; confidence-bounded) | ✔ 297 verified in audit | **Partially productionised** |
| Mathematics | ✔ (30 topics / 30 lessons) | ✔ `maths-jamb-bank.json` — **50** seeded; ✔ `maths-jamb-bank-extension.json` — **125 staged** (25 topics × 5, all 30 curriculum topics now covered at file level) | ✔ 50 (extension **not** seeded) | **Improving — 25 topics covered on disk, awaiting seed sign-off** |
| Government | ✔ (21 topics / 21 lessons) | ✔ `government-jamb-bank.json` — 40 + `government-2019-bank.json` — 32 + `government-coverage-bank.json` — 20 + `government-foundations-bank.json` — 12 = **104** | ✔ 104 | **In progress**; 12 topic clusters vs 33 syllabus topics |
| Economics | ✔ (23 topics / 23 lessons) | ✔ `economics-jamb-bank.json` — **54** + `economics-2014-bank.json` — **16** = **70** | ✔ 70 | **Deepening**; 18/23 syllabus topics, all recall-not-application difficulty (26 easy / 27 medium / 1 hard) |
| Biology | ✔ (92 topics / 92 lessons) | ✘ No bank file | ✘ Unseeded for JAMB | **Preparation only** |
| Chemistry | ✔ (17 topics / 44 lessons) | ✘ No bank file | ✘ Unseeded for JAMB | **No bank** |
| Physics | ✔ (3 topics / 3 lessons) | ✘ No bank file (PDF parsed only) | ✘ Unseeded for JAMB | **Preparation only** |
| Commerce | ✔ (22 topics / 22 lessons) | ✘ No bank file (PDF parsed only) | ✘ Unseeded for JAMB | **Preparation only** |
| Current Affairs | ✔ (4 topics / 4 lessons) | ✘ n/a | ✘ n/a | **Preparation only** |
| CRK | ✘ No curriculum file | ✘ No bank file (FR parsed) | Unseeded | **Not started** |
| Literature | ✘ No curriculum file | ✘ No bank file | Unseeded | **Not started** |
| Principles of Accounts | ✘ No curriculum file | ✘ No bank file (parsed only) | Unseeded | **Not started** |
| Current-affairs / general | ✘ No curriculum file | ✘ n/a | Unseeded | **Not started** |
| Post-UTME past questions | ✘ No specific `*-postutme-bank.json` files | live in Post-UTME track, untagged | 1,074 published (per audit, no bank JSON, no topic tags) | **Partial — coverage unprovable** |

---

## B. Curriculum notes — incomplete and drift

- **chemistry-curriculum.json**: 17 topics vs 44 lessons — **27 lessons ahead of topics**. That's fine (a topic can have multiple lessons) but loses the "one lesson per topic" symmetry many other subjects carry; verify lesson-to-topic mapping before authoring.
- **biology-curriculum.json**: 92 topics and 92 lessons — best symmetry in the audit but **no JAMB question bank exists** at all; the file is the most pre-built for authoring a bank quickly.
- **Physics**: 3 topics — probably the wrong curriculum shape for JAMB (JAMB Physics traditionally has ~30 syllabus topics). The file must be redesigned against the § physics syllabus before any bank can claim coverage.
- **maths-curriculum.json**: 30 topics/30 lessons matches a "one topic = one lesson" shape.
- **current-affairs-curriculum.json**: 4 topics only. Mark scheme may need expanded scope once user volume dictates.

---

## C. Source PDFs / parsed dumps (reference, not product)

These files are the raw corpora. None reach the user. All carry high-level grammar/watermark damage from the original MyschoolGist watermark print. They should not enter seed pipelines — they are reference / proposed-starter-supply only.

| File | Size | Role |
|---|---|---|
| `Use-of-English-JAMB-Past-Questions-And-Answers.pdf` (11 MB) | 11.2 MB | English JAMB source corpus, 1978–2020, ~3,400 questions, 5-option pre-2013 format |
| `USE-OF-ENGLISH-JAMB-Past-Questions.pdf` (940 KB) | 940 KB | English JAMB condensed source, 1978–2020, 5-option pre-2013 (truncated/incomplete marking) |
| `Lekki-Headmaster-novel.pdf` | 17.3 MB | JAMB 2026 prescribed text (The Lekki Headmaster), used by the author for comprehension authoring |
| `BIOLOGY/CHEMISTRY/COMMERCE/CRK/ECONOMICS/*-JAMB-Past-Questions*.pdf` | various | Source corpora for banking; contain watermark, 470+ candidate items per subject |
| `*-parsed*.json` | various | Parsed dumps — errors of concatenated PDF text; not directly importable |
| `*-Past-Questions-And-Answers.json` (Government, Economics, Biology) | various | Loose keys-probably; treat with caution |
| `english-jamb-staged-clean-v3.json` | 15.3 MB | The staged inventory — **all 4,401 records hand-corrected/solved in this session**; 311 quarantine |
| `english-jamb-bank-expanded.json` | 4.3 MB | 4,090 solved records in `_note`+`questions` shape; **confidence tagged**, **not seeded** |
| `english-jamb-staged-topicmapped*.json` / `english-jamb-staged-clean.json` | various | Intermediate topic-mapped snapshots, **obsolete** or **backup**; not for import |
| `english-jamb-bank.json` | 238 KB | **Publish file** — 297 questions (topic-mapped, DB-verified 2026-11-08) |
| `economics-2014-bank.json` etc. | small | Older generation banks; superseded |

**Data-Hygiene caveats in these source corpora:**
- "ANSWERS YYYY" pages are *section headers* (currently never answer keys), not keys.
- Pre-2013 papers remain **five-option A–E**. Normalising to A–D would require key evidence (no key exists in these PDFs).
- Watermark "Download MySchoolGist JAMB CBT Software" is preserved in parsed text.
- Year labels inside parsed dumps are the *marketing* year of the source PDF, not the exam year.

---

## D. Subject-by-subject production gaps

Ordered by severity of absence.

| Subject | Stage | What's missing before production | Live hours-signon |
|---|---|---|---|
| **Physics** | Curriculum stub | 3 topics — rebuild vs syllabus; author ≥ 5–10 questions per topic (~150 minimum); seed; topic-map; diff-synchronize | Prepared-but-not-seeded |
| **Chemistry** | Curriculum built (17 t / 44 l) | No bank JSON at all; author target ~17 × 5 = 85 questions minimum for a coherent sprint; topic-map; seed; sync verify | Not seeded |
| **Commerce** | Curriculum built (22 t / 22 l) | Same shape as chemistry — bank needed; seed; topic-map; verify | Not seeded |
| **Biology** | Curriculum excellent (92 t / 92 l); no bank | Strategically the largest authoring opportunity adjacent to chemistry (92 × 5 = 460 minimum for bank launch); deferring this is also fine | Not seeded |
| **Mathematics** | 50 seeded questions across 5 topics (file level) | **Extension staged:** 125 hand-authored questions (5 per each of the 25 missing topics; 41 easy / 56 medium / 28 hard) in `content-folder/maths-jamb-bank-extension.json`; `scripts/check-maths-jamb-bank-extension.mjs` passes; `scripts/seed-maths-jamb-bank.mjs --dry-run` resolves all 25 slugs in the DB. **Pending: user sign-off to seed; then re-balance difficulty and update this audit.** | Seeded (partial) |
| **Government** | Best depth of any bank (104/seeded) | Add: elected process, civil service, pressure groups, public opinion, local gov, legislature; also expand every topic to push mode-count past 1–2 each | Seeded (passing but thin) |
| **Economics** | Recall-heavy, weak application | Add applied-difficulty questions — regression/scenario style — 30 minimum to raise the difficulty profile. Possibly integrate 2014 bank's under-rated difficulty items | Seeded |
| **English** | **4,090 staged, none seeded** | This is the single biggest unseeded stock in the repo: import + trigger verification + 3 smoke questions + sync double-check | Seeded 297 only |
| **CRK / Literature / Accounts** | None | No curriculum, no bank. Authoring the curriculum first is a big task; not first-priority | Not seeded |
| **Post-UTME** | 1,074 published (per audit) | Topic tags missing; Oral-Forms gap — 30 author-authored items are JAMB-scoped; UNILORIN-aligned English content needed | Seeded |
| Current Affairs | 4 curriculum topics only | Expand to exam-blueprint scope; no bank; not seeded; not itemised | Not seeded |

---

## E. Stale / temporary files (recommended prune or re-purpose)

These files occupy ~150 MB of the 340 MB overall tree and are not relevant to production:

- `_work/question-bank-audit.json`, `question-bank-audit.csv` — historical dumps (should be archived and removed from the main tree)
- `_work/real-assets/*.png` — Visual assets provenance directory (should move to whatever image-ingest pipeline the team uses); also `_work/real-assets/…/composed-map.png` originals
- `_work/econ-renders/`, `_work/crk-renders/`, `_work/com-renders/`, `_work/econ-prev-backup.json`, etc. — renders and prior exports; archive
- `_figures/` — parsing cache and parsed JSON mirrors; source-of-truth is the PDFs themselves; do not import anything from here directly
- `_work/econ-…` directory — temporary col-knowledge in JSON; archive
- `english-jamb-staged-clean.json`, `english-jamb-staged-clean-v2.json`, `english-jamb-staged-topicmapped*.json`, `english-jamb-staged.json` — 6 historical versions of the staged inventory; keep "v3" only; archive/delete others
- `english-jamb-bank-expanded.json` and `english-jamb-staged-clean-v3.json` — keep deliberately for now
- `english-comprehension-passages.json` + `.raw.json` — legitimate reference

---

## F. Production-hardening checklist (what must be done before an "English only" ship)

Done:
- English staged inventory parsed, deduped, cleaned, tagged to curriculum topics.
- 4,090 answers hand-assigned + passage-verified.
- 4,090 records have a `skill` tag.
- Ledger of exclusions: 311 quarantine; 34 `obsolete-novels`.
- 297 items directly seeded (2026-11-08 per audit) and DB-verified.

Remaining for a full ship:
1. **Map** `english-jamb-bank-expanded.json` export → `_note`+`questions` schema into a seedable DB bank. The current seed script reads only `english-jamb-bank.json`. Change it, or parameterise it, to read from `-expanded.json`.
2. **Human review pass** on at least 100 sample records (random across skill confidence levels) to validate the current QA pass's rigour. The `question_answers` mirror must be checked for leakage.
3. **Topic mapping reconciliation**: the DB seeds via `question_topics` (the currently empty link table); join `english-jamb-bank-expanded.json.topic` → `topicBySlug.get(q.topic)` — topic mismatches between this JSON and DB slugs must be cleaned up first.
4. **QA enforcement**: run `skill`-confidence filter; ideally publish only `high`+`medium` initially.
5. **Copyright review** with JAMB IP counsel — before any public release derived from third-party past papers.
6. **Readd `question_topics`** for the whole bank; the legacy question bank has no links.
7. **Commit-issue check**: 6 historical `english-jamb-staged*.json` files & the staging backups in temp directory should be removed or archived to avoid accidentally shipping oversized files to production.
8. **Update `docs/content-audit.md`** (it is a snapshot at 2026-11-08; it does not yet know about the English inventory work).
9. **`content-folder/english-jamb-bank-expanded.json`** should either (a) be moved to a `staging/` folder (not to production `files/`), or (b) marked clearly as *internal-review-only*.

---

## G. Out of scope of this audit

- **No DB queries were executed.** Counts for DB-side items (e.g. "DB has X questions") rely on `docs/content-audit.md` or migration knowledge.
- No reading of any lesson content (lesson files are huge; reviewing requires a separate pass).
- No determination of licensing status (see research doc; consultation of counsel needed).
- No performance testing.

---

## H. Pending volume to decide: ship as-is or re-balance

The user stated (2026-11-12): keep current bank as-is; revisit after enough
user volume justifies the fix. Tag → user-weakness routing cannot be trusted
to operate until the inventory in `expanded.json` is reviewed and seeded —
it is **staged reference** only at this time.

---

## I. Recommended next items of work, in order

1. ~~Mark all 6 historical `english-jamb-*` staging files as `archived/` or delete~~ — done 2026-11-12 (5 stale files moved to `content-folder/_archive/`).
2. ~~Update **`docs/content-audit.md`** with this inventory annex~~ — done 2026-11-12 (Annexes A & B appended).
3. Apply the production hardening checklist (English import) — **in progress 2026-11-12:** seed script parameterised (`--source`, `--min-confidence`, `--allow-five-option`, `--dry-run`); read-only dry-runs verified; `english-jamb-bank-expanded.json` marked internal-review-only. **Pending: user sign-off to seed.**
4. ~~Pick the next subject to bank: **Mathematics first**~~ — **done 2026-11-12:** extension of 125 questions authored across the 25 missing topics (all 30 curriculum topics now covered at file level); nothing seeded pending sign-off. Next subject: **Chemistry** (perfect curriculum, zero bank).
5. Schedule a hands-on review pass over a representative sample of the expanded bank (see section F above).
6. Decide the fate of the 3 legacy overlapping maths curriculum slugs (`number-bases-modular-arithmetic`, `fractions-decimals-approximations`, `indices-logarithms-and-surds`) — dedupe vs keep-both is a product decision pending.
