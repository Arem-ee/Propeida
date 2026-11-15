# Question-bank ingestion framework

This is the staging pipeline between the parsed JAMB-like corpus and the live question bank. It never publishes a question. It prepares an auditable batch, imports it as `in_review`, and leaves human verification as the final gate.

## Flow

1. **Audit the parsed corpus**
   ```sh
   python content-folder/_work/question_bank_audit.py
   ```
   Writes:
   - `content-folder/_work/question-bank-audit.md` — summary counts
   - `content-folder/_work/question-bank-audit.json` — machine-readable row classifications
   - `content-folder/_work/question-bank-audit.csv` — per-row table

   Status meanings:
   - `ready` — current automated checks permit a reviewable import
   - `needs-answer` — no A–E answer key found
   - `needs-repair` — parse damage requiring manual rescue before review
   - `needs-figure` — figure-dependent item
   - `needs-review` — passes the structural gate but does not yet have a clean key
   - `orphan` / `duplicate` — excluded from automated import

2. **Plan a batch**
   ```sh
   node scripts/question-bank.mjs plan --file Government-JAMB-Past-Questions-And-Answers.json --subject government --limit 25
   ```
   Writes `content-folder/_work/bank-ingestion/<name>.plan.json`. The manifest contains only the selected rows, their parsed source index, audit status and a content hash. No database writes happen in this step.

3. **Import the batch**
   ```sh
   node scripts/question-bank.mjs apply --file Government-JAMB-Past-Questions-And-Answers.json --subject government --source-batch government-2026-11-sample --limit 25 --confirm
   ```
   Imports rows tagged `source = jamb-bank:<source-batch>` into `status = in_review`, `verified_state = unverified`. Service-role access is required. Existing non-draft/rejected rows are never overwritten.

4. **Review**
   Admin → Questions → Review. Reviewers can read the key in the protected queue, validate the answer and explanation, then publish or reject.

5. **Rollback if a batch is bad**
   ```sh
   node scripts/question-bank.mjs rollback --source-batch government-2026-11-sample --confirm
   ```
   Deletes only draft/in_review/rejected rows carrying that batch tag. It refuses to touch published or otherwise non-review rows.

## Safety rules

- No row reaches a learner without human review.
- Every imported row carries the source batch in `questions.source` and a source index in the review note.
- Exact-text duplicates are excluded from the batch plan.
- Audit failure means no insert; the tool exits instead of importing partial garbage.
- Answers remain in the locked answer path; import code never requires client-side answer access.
- Every MCQ must carry a reviewed explanation. Imported rows intentionally have it blank until a reviewer writes or confirms it; the admin edit path and the bulk-publish endpoint both refuse `published` with no explanation.
- A keyed item is still not finished merely because the key exists. Reviewers must check that the answer is actually defensible and that the explanation teaches the reasoning, not just validates the option.

## Batch planning rules

`plan` selects only rows classified as `ready` by the audit and re-checks the same structural gate before writing the manifest. It also:

- restricts to A–E answers and A–D options;
- rejects orphan and figure-dependent rows;
- deduplicates by normalized question text + options within the batch;
- records the original parsed file and index so a reviewer can trace the question back to its source;
- can filter by `--year 1984,2008` or cap the run with `--limit`.

## Explanation format for maths and calculation questions (decided 2026-11-14)

**The decision:** questions whose solution is a procedure — maths, and the calculation-heavy parts of Physics, Chemistry and Principles of Accounts — explain the answer as **worked steps**, not prose summaries. Each step carries:

- `operation` — what is done in this step
- `reason` — why this step, not another
- `result` — what the step yields
- `predictPrompt` — an invitation for the learner to predict the next step before reading it

The shape is reused deliberately from the lesson `worked_example` block convention (problem + named steps with operation/reason/result, with the predict-first loop described in `docs/lesson-authoring-standard.md`), so a learner meeting worked mathematics in the question bank is practising the same muscle the lessons teach.

**What this does not change:**

- Prose-subject questions (Government, Literature, CRK, …) keep prose explanations. Worked steps are for procedures; forcing them onto prose arguments produces nonsense.
- Everything stays `in_review` / `unverified` until a human checks the item in the admin review queue. Worked steps are held to the same gate as the answer itself.
- Provenance is mandatory on every bank item: `recomputed_by_assistant` (independently re-derived) or `ledger` (carried from a research ledger without full re-derivation). Items that cannot be honestly solved are kept with a `hold_reason`, never silently dropped.
- Topic tags from the machine-generated sidecars are untrusted and were set to `unmapped` across the OCR-lifted corpus — topic assignment happens during human review, not at import time.
- Stems and options carried over from OCR'd PDFs are OCR-raw until a human re-typesets them; nothing from an OCR-lifted year is learner-facing-ready.

**Application state as of 2026-11-14 (honest):**

- Mathematics 1984 (hand-vetted pilot): 32 in-bank items; 1 carries the full structured `steps[]`; the remainder carry terse but correct prose derivations awaiting conversion. 17 held items document why they cannot be used.
- OCR-lifted years (1983, 1985–1995, 1997–2004): explanations are research-ledger shorthand, not learner-facing teaching prose; stems are OCR-raw. Worked-steps conversion is outstanding for all of them, and the same treatment is not yet applied to Physics, Chemistry or Accounts banks even though they share the calculation-heavy profile.
- Step structure is stored inline in the bank JSON as a `steps` array alongside the flat `explanation` string, so conversion can land incrementally without re-authoring the whole record.

## Intended use

Use this for small, auditable batches and pilot imports. Do not bulk-import the whole corpus until the review queue can realistically process it.
