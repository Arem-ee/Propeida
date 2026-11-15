# Physics bank — live state 2026-11-15

**Status: LIVE.** `910` rows in `questions`; `897` published; every published
row carries an answer in `question_answers` and a `question_topics` tag
(verified 2026-11-15 with paged count scripts — not sampled, complete).

## What was built

- `content-folder/physics-jamb-bank.json` — 1,019 records (all 21 papers;
  1996 not printed in source, as for Chemistry).
- `scripts/build-physics-bank.mjs` (was in `%TEMP%`, its output is committed) —
  assembles the bank from the parsed PDF dump + research MDs + topic-bank maps.
- `scripts/seed-physics-jamb-bank.mjs` — adapted from the chemistry seed; writes
  staging columns null and populates `question_answers` directly (see DDL break below).
- `scripts/seed-physics-jamb-bank.mjs --dry-run` reports 909 eligible / 110 HELD / 0
  missing research rows; confidence 651 high / 131 medium / 127 low / 110 figure-held.
- Topic mapping: 1,019/1,019 mapped (no misses); 735 exact / 147 approximate /
  133 inferred-from-style / 4 review. Held-figure placeholder rows parked on
  `motion` and flagged `needsManualReview`+ `needsFigure` (2 rows).

## Honesty posture

Answers are **letter-unverified** — LLM-recomputed, cross-checked against a public
compilation (examplayground.com) where available. Nothing is source-verified.
Published as `verified_state='source_cited'`, same as Chemistry. The seed now
completes with staging nulls; answers live only in `question_answers`.

## DDL break — repaired 2026-11-15 (applied and verified live)

The parallel migration `20261115000001_question_answers_steps.sql` rebuilt
`sync_question_answers()` without blanking the staging columns, so every insert
with `correct_answer` non-null failed the Phase-B
`questions_answer_is_staged` CHECK (23514).

Repaired in three steps, all applied. `20261115000002_repair_phase_b_sync.sql`
(authored by the parallel session, extended in this session to cover steps)
restores Phase-B blanking for correct_answer/explanation; the live trigger
still left the steps staging column readable — confirmed by probing.
`20261115000005_null_steps_staging.sql` makes the trigger null the steps
column too. `20261115000006_clear_steps_and_extend_check.sql` clears the 32
mathematics-pilot questions rows whose steps staging was populated (all were
verified mirrored in question_answers) and extends the CHECK to cover steps.

Verification (all 2026-11-15, live): probe insert with correct_answer +
explanation + steps non-null now succeeds; staging columns return null in
`questions`; `question_answers` receives the mirror; `questions.steps` rows = 0.
Admin write paths are restored.

## Still to do (Physics)

- Worked-steps re-authoring for the ~496 calculation-heavy questions
  (digit-containing; Chemistry equivalent was 117). IN PROGRESS 2026-11-15:
  `content-folder/_work/physics-calc-496.json` and `physics-calc-batch-01..25.json`
  written; batches 01-06 re-authoring (spawn 6 agents at a time, 25 batches
  total × 20 items ≈ 25 agent-rounds). Answer keys to remain intact unless the
  derivation disagrees (disagreement flagged in reports, not silently overridden).
  Output: `physics-calcstep-batch-*-out.json`; merge into
  `content-folder/physics-jamb-bank.json` as `format: 'worked-steps-v1'`; push
  with `node --env-file=.env scripts/push-worked-steps.mjs --apply` post-deploy.
- Physics push into question_answers has the same deploy-order constraint as
  Chemistry (origin/main parses the format only from the committed build).
- Attribution on live practice UI for Physics questions — as Chemistry before it.
- 110 figure-held questions remain unusable as text-only MCQs (options print in
  papers studied as figures) — they are kept but excluded from seeding today.
- Deploy: prod likely pinned behind origin/main builds; local main is ahead of origin/main. Push when ready; Vercel must build cleanly (the committed tree does).
- ~~DDL break~~: repaired and verified 2026-11-15 (see "DDL break — repaired").
