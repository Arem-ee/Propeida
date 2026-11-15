# Chemistry bank — status 2026-11-14 (final honesty ledger)

**Verdict: a complete internal DRAFT of ~1,019 questions exists and nothing was dropped. It is not production-ready and must not be seeded.**

## What changed this session (after earlier fragment)

- The prior parse was fundamentally broken: ~375 missing rows, all years broken mid-page, a new bug every run, and no way to attribute merged papers (1995/2001). Root causes were all diagnosed and fixed — wrong year boundary (year header is a page marker in the PDF; marker sits between pages, each page = one paper per year), two-column pages (column-major block ordering, not y-sort), marker-split boundary attribution, false decimal anchors (`28. 6g`), marker blocks containing content (manual block-list patching), and marker vs. paper-side assignment for merged pages.
- **Result: 1,019 records, 20 papers, zero declined.** 1,019 = 1,050 printed questions minus 61 absent from the source PDF (mostly cut pages) minus a handful with unrecoverable text (kept as placeholders — see below).
- Pages are perfectly scoped per year, including split pages (2002/2003, 2001/2002, 1995/1997) which were individually mapped in `_work/chemistry-reparsed.json`.

## What \*exists\* in the source PDF and was NOT previously counted

Full page → year mapping is written and verified:

| Paper | Pages | Questions |
|---|---|---|
| 1983 | 2-5 (below mid-page on p5) | 50 |
| 1984 | 5-9 | 47 |
| 1985 | 10-12 | 49 |
| 1986 | 13-16 | 48 |
| 1987 | 17-19 | 50 |
| 1988 | 20-22 | 47 |
| 1989 | 23-26 | 48 |
| 1990 | 27-29 | 50 |
| 1991 | 30-33 + split | 50 |
| 1992 | 34-36 | 49 |
| 1993 | 37-39 | 48 |
| 1994 | 40-43 | 45 |
| 1995 | 44-46 | 48 |
| 1997 | 46-49 | 46 |
| 1998 | 50-52 | 48 |
| 1999 | 53-56 | 50 |
| 2000 | 57-59 | 48 |
| 2001 | 60-61 split + 62–64 (col0+J blocks) | 48 |
| 2002 | 62-64 + col0 blocks on 65 | 50 |
| 2003 | 65-68 split + col0 blocks on 68 | 50 |
| 2004 | 68-70 | 50 |

1996 does not exist in the paper — it was never printed and was not fabricated.

## Current state of the bank (`content-folder/chemistry-jamb-bank.json`)

- **1,019 records, 20 papers.**
- **324 answers** — only from `_work/bank-ingestion/research/chemistry-*-research.md` for years 1983-1987, 1988-1990 (mechanically harvested from freestyle prose) and 1995.
- **695 records have NO answer.** Years 1991-94 and 1997-2004 have zero letters anywhere in the repo; 1994-research.md actually contains Accounting, not Chemistry.
- **52 records** parse as suspect (options wouldn't extract cleanly from PDF; usually multi-line formulas or heavily structured layout that the parser can't handle).
- **5 figure-dependent records** retained, flagged `needsFigure=true` (1983-Q13, Q17, 1984-Q7, Q12, Q16). Figure files exist under `content-folder/_figures/CHEMISTRY-JAMB-Past-Questions/` but were not linked automatically.
- **4 duplicate stem pairs** genuinely reprinted across papers (1983↔1987, 1985↔2000, 1990↔2003, 1993↔2001). All kept, with unique `-2` ids (`chem-1984-q05-2` etc.).
- **4 empty option-text records** (from OCR-but-figure-less questions; kept as provided).
- **All records `needsManualReview: true`**, `topic: unmapped`, `difficulty: 'medium'` default, `skillConfidence: 'low'`, `sourceVerified: false`, `parseQuality` honest.

## What must happen before this reaches any learner

1. **LLM solve pass** on the 695 currently unanswered records (or across the whole bank to uplift confidence), always tagged as LLM-verified, never auto-promoted to `sourceVerified`.
2. A–D normalisation pass (A–E present in the PDF; A–E choices kept as-is for honesty but bank schema is A–E).
3. Topic mapping (currently `unmapped`)
4. Explanation attachment (currently empty)
5. Image/figure attachment for the 5 figure-dependent records
6. IP review for JAMB past-paper-content handling (same gate as English)

## What remains missing or wrong, plainly

- **695 records have no answer.** Neither I nor the research files can supply one honestly. The letters given are syllabus-solved from past-paper ingestion notes by humans — not an answer key.
- **OCR is lossy.** Subscripts, superscripts, arrows, parentheses, and formulas are all degraded in the source PDF. Some stems are "garbage strings" vs "text that doesn't make sense to a human reader" — flagged `suspect` but kept.
- **The Chemistry bank is not production-ready, must not be seeded, and must not publish.**
- 1994-research.md is mis-attributed (Accounting). It was avoided; no letters were harvested from it.

## What I did not do

- Did not run an LLM solve pass for 1991-2004.
- Did not adjust option order (different question splits).
- Did not map topics.
- Did not push or commit anything (repo stays clean; all changes are in `content-folder/` as content files + `scripts/build-chemistry-bank.mjs`).

## Recommendation

Next session: run LLM solves for the 695, or let me either (a) mark Chemistry bank as "draft+internal only, no publish" and move on to other work, or (b) actually pursue an answer-key pass. Sign-off required before any seeding, any publish, any staging.
