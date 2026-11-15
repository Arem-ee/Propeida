# Chemistry worked-steps + live-state closure — 2026-11-14 (final)

**Headline: Chemistry is live. Worked-steps is coded, committed, and builds — but
NOT deployed and NOT seeded into the DB yet. Deploying today ships it safely.**

## What is live (prod, origin/main @ b5ab305 after push)

| Metric | Value |
|---|---|
| Chemistry rows in `questions` | 965 |
| Published | 942 |
| Verified state | `source_cited` |
| Topic tags (`question_topics`) | 1,568 |
| Explanations served today | **prose** (correct until worked-steps go live) |

61 records that an earlier network failure had left unseeded are now in the DB
(all published, all `source_cited`).

## This session's commits on `main` (not yet pushed)

```
b5ab305  fix(app): drop dead progress-map block after resume-cards scope fix
879286b  feat(practice): render worked steps in answer feedback
```

- `879286b` wires the worked-steps format end to end: `parseExplanation`
  (`lib/lessons.ts`) decodes a `worked-steps-v1` JSON payload from
  `question_answers.explanation`; `lib/practice.ts` + `lib/actions/practice.ts`
  + `lib/actions/lessons.ts` thread it through practice, lesson and session-review
  feedback; the lesson and practice players and the results review page render
  steps via `<WorkedSteps>`; admin surfaces render steps readably without
  exposing raw JSON. Adds `scripts/push-worked-steps.mjs` (idempotent, `--apply`).
- `b5ab305` is not worked-steps work. `07585b4` removed `progressMap` from
  `getDashboardData()` but left `app/(app)/home/page.tsx` referencing it, so
  origin/main stopped type-checking and Vercel builds would fail. The commit
  drops the dead block (+ its orphaned `STATUS_STYLE`). Its deletions are the
  same lines the pending uncommitted home-page rewrite removes, so the two merge
  cleanly (conflict on the blank lines was resolved in favour of the rewrite).

origin/main was already broken before either of these commits; the repair is what
makes pushing main viable at all. The full uncommitted workspace (the lessons /
results / mascot redesign) also compiles on top of these commits — `tsc --noEmit`
exit 0.

## Worked-steps — what remains before learners see them

1. **Push `main`.** Two commits ahead of origin/main; fast-forward. Vercel
   auto-deploys. Committed tree typechecks clean.
2. Run `node --env-file=.env scripts/push-worked-steps.mjs --apply` **after the
   deploy is READY**. It writes the worked-steps JSON into
   `question_answers.explanation` for the 117 re-authored calculation questions
   (112 present in the DB; 5 can never be seeded — figure-dependent or optionless).
   Do NOT run it before the deploy: any build that cannot parse the payload shows
   raw JSON in the feedback UI.
3. Sanity check one practice session and one completed-session review.

The 112 rows were pushed and then deliberately reverted to prose tonight after the
discovery that origin/main cannot parse the format — production never saw the JSON.
`scripts/push-worked-steps.mjs` dry-run reports state; `--apply` is idempotent.

## Also on origin/main tonight (another session, not applied)

```
56a90f0  chore(db): add question_answers.steps + questions.steps with sync and reveal/review functions
```
A native `steps jsonb` column design (mirrors lesson worked_example step shape).
**This migration is NOT applied to the live DB** (columns do not exist). Nobody has
verified it or its effect on the reveal/review RPCs. Decide, deliberately, whether to
apply it and use the native column instead of the JSON-in-explanation wire-up that
`879286b` ships; today they coexist harmlessly (nothing in the app reads
`qa.steps` yet) but are two parallel pipelines.

## Verification evidence

- `tsc --noEmit` clean on the committed state (detached worktree at b5ab305).
- `tsc --noEmit` clean on the full uncommitted workspace on top of it.
- DB integrity probe: `question_answers` holds 2,980 rows; chemistry explanations
  are prose (0 JSON) after the revert.
- `scripts/push-worked-steps.mjs` dry-run confirms 112 targets carry prose now,
  5 have no DB row.
- Production pack: local `git status` shows the giant uncommitted redesign is NOT
  in these commits — it remains in the working tree (254 modified paths +
  untracked content), unpushed.

## Known homework / not done

- Applying `20261115000001_question_answers_steps.sql` — decision belongs to the
  owner; do not apply without a look at the sync trigger against live
  `questions` writes.
- English bank remains internal; nothing seeded from it.
- 75 low-confidence chemistry answers + ~52 OCR-suspect records remain
  `source_cited` (honest state, not verified).
- Mock sessions intentionally strip worked-steps at the action boundary
  (pending redesign; mock questions stay unrevealable until submission).
- `stash@{0}` in this repo holds the pre-rebase pending redesign (kept, not
  dropped); `stash@{1}` predates this work and was not touched.
- **Vercel may currently be pinned to an older deployment** if 07585b4's broken
  build failed — origin/main could not build since 07585b4 (2026-11-14 21:59).
  Check the dashboard after pushing; the live site may legitimately jump several
  unpushed commits in one deploy.
- Another session shares this working tree and pushes mid-flight straight to
  origin/main; state may shift — re-verify at push time.
