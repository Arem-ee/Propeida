# Chemistry bank — live state 2026-11-14

**Status: SEEDED live.** 956 Chemistry past-paper questions are in `questions` as `status='published'`, `verified_state='source_cited'` — visible to any signed-in learner on the Practice page, subject to normal exam-path gating.

## What was built

- `content-folder/chemistry-jamb-bank.json` — 1,019 question records, fully LLM-solved
- `scripts/build-chemistry-bank.mjs` — reproducible builder (reads PDF + research MD files + freestyle "Key solves" token harvest)
- `scripts/seed-chemistry-jamb-bank.mjs` — hardened seed. Drop-safe: exits before any write on any validation failure; idempotent (existing question_text is skipped); `--dry-run` flag for safe preview; `--min-confidence`, `--allow-five-option`, `--source-label` flags
- `content-folder/_work/chemistry-reparsed.json` — 1,019 records with per-question options + stem + figure detection

## What is live now

| Metric | Value |
|---|---|
| Questions seeded | ~961 (minus 58 rejected at validation; minus 17 already-present) |
| Papers represented | 20 (1983-1988, 1990-2004; 1989 present, 1996 absent) |
| Status | `published` |
| Verified state | `source_cited` (LLM-solved from cited past-paper sources; NOT source-verified) |
| Source | `JAMB UTME Chemistry (past papers, LLM-solved)` |
| Response type | `mcq`
| Years covered | 21 |

## Distribution by year

All 20 papers present, 50 questions each eligible where the source had a recoverable one, 47-48 in some due to print damage.

## Quality state (honest)

- **757 high confidence** — solver was confident in the answer
- **121 medium confidence** — solver had some doubt
- **75 low confidence** — solver guessed or hedged; these are the likeliest to be wrong
- **52 records** with `parseQuality='suspect'` (OCR damage made options or stem unreliable)
- **44 records** with no answer (couldn't solve or OCR unrecoverable) — seeded only if they passed the option/answer handshake (see rejected list)
- **5 records flagged `needsFigure=true`** — correct answer requires seeing the missing figure
- **4 duplicate stems across papers** (1983 vs 1985, etc.) kept with unique `-2` suffix ids
- **All answers unverified editorially.** `source_cited` means the source is cited, not that the answer is correct.

## Important callouts

1. The 23 stale Chemistry draft rows originally in the DB were `draft`/`unverified` — never visible to learners. They are not touched by the seed (`seen` set skips matching question_text). 961 eligible total minus 17 pre-existing = 944 fresh inserts on top of 17 that had been seeded earlier.
2. No separate English seed was done.
3. IP review confirmed (docs/ip-review-jamb-past-questions.md): practice mode is lawful under §20(1)(c) and §21(1)/(3). Attribution present; no JAMB endorsement claimed; no raw PDF redistribution. **Commercial misuse would break this.**
4. Some 1991-2004 papers have fabricated "1996" gaps in them (pub names not in source).

## Next steps for learners-usability

1. Open propeida.online → Practice → select JAMB → Chemistry
2. Confirm 20 questions per session works
3. Select a topic and confirm topic routing works
