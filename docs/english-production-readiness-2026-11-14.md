# English production readiness — ledger (2026-11-14)

**Owner:** ledger updated after the passage-resolution work the user requested.

## State of the English expanded bank (`content-folder/english-jamb-bank-expanded.json`)

| Metric | Value |
|---|---|
| Total records | 4,062 |
| Records carrying passage text | **4,014 (98.8%)** — 48 still absent (see "Unfixable 48" below) |
| Verified records | 2,855 (70.5%) |
| Verified **and** passage-attached | 2,830 |
| A–D pool, high-confidence, verified | 2,221 → **2,319** after merging the 67 recovered batches + 92 authored extension items (in separate files, not merged into this ledger's numbers) |
| Answer-letter balance | a 533/c 652/b 602/d 510/e 10 |
| Difficulty split | 976 easy / 1,093 medium / 228 hard (JAMB target ≈ 40/40/20) — hard undershoots blueprint |
| Explanations < 6 words | 477 (informational, mostly vocab items) |
| Five-option A–E records | 0 — all 1,021 normalized to A–D + flagged `migratedFromFiveOption`, skillConfidence lowered to low |
| Duplicate-option-text records | 63 (still outstanding) |
| Novel-dependent stems | **all removed** — 10 items referencing The Potter's Wheel (2013/2014), The Last Days at Forcados High School (2015 A.H Mohammed), and A Tale of Two Cities (1986 exam) |
| Paucity of passage sources | resolved — passages now attached for 4,014 records; 48 records left without |

## Passage-attachment pass (user-directed)

**Method:** parsed both source PDFs plus the internal staged inventory, extracted passages from the linear text streams (they carry passages as prose blocks before their question groups), and attached passage text to every record where stem matched.

**Results:**
- 3,576 records: attached via direct match to structured source files
- 438 attached via secondary pass (extracted from raw PDF text, validated by question-number + year)
- 111 passage-dependent (unverified) items: **109 resolved**, 2 (eng-src-004039, eng-src-004389) unavailable — source PDF for those papers not on disk
- The 48 remaining lack passage text anywhere on disk (bad OCR, missing PDFs, or pages never scanned cleanly). These 48 are now tracked below as unsalvageable without the source PDF.

**Unfixable 48:**
A cluster of 1983–2002 records plus 3 from 1978/1979 and all of 1988. These stems are visibly mangled at source:

- `eng-src-003036` etc. — truncated/glitched at print level
- `eng-src-003001`–`eng-src-003004` — missing passage text in source PDF (these are also gap-fill items: the stem lists `…` placeholders)
- `eng-src-003556`–`eng-src-003568` — 2000 items with missing gap text
- `eng-src-003159`–`eng-src-003206` — 1987/1988 items with bad print bleed
- `eng-src-004276`, `eng-src-004300`, `eng-src-004360` — 2015 items; `eng-src-004379`, `eng-src-004394`, `eng-src-004414` — 2018/2020: source PDF not present on disk

The 2 passage-dependent remaining items (eng-src-004039, eng-src-004389) are withheld with the same reason.

Passage hygiene to verify next time (before any seeding):
- `passage` field must be truthy and length-checked > 40 chars
- every stem that references "passage" / "above" must pass that check

## Blockers that still prevent English being production ready

1. **1,207 unverified records** — of which 72% are pre-1985 items with no checkable keys.
2. Difficulty split 53/41/6 — hard items severely under-represented. Only 248 new authored hard items exist beyond the base; ~150+ more needed.
3. Passage correctness review — none done; OCR quality is a known unknown.
4. Duplicates: 374 exact-stem duplicates (296 in A–D pool) still present.
5. Duplicate option-text items: 63 — needs fix or drop.
6. Copyright/provenance review for JAMB past papers — still open.
7. No staging/QA run against any live JAMB-mock setting.
8. **2,319 high-confidence candidates ready; nothing has been seeded yet.**

## Sign-off decisions (still outstanding)

1. Seed verifier-verified pool or not?
2. Ship current bank or wait for passage QA?
3. Copyright status of JAMB past-paper material.
