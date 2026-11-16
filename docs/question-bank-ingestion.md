# Question-bank ingestion framework

This is the staging pipeline between the parsed JAMB-like corpus and the live question bank. It never publishes a question. It prepares an auditable batch, imports it as `in_review`, and leaves human verification as the final gate.

## Flow

1. **Audit the parsed corpus**
   ```sh
   python scripts/question_bank_audit.py
   ```
   Writes:
   - `content-folder/_work/question-bank-audit.md` â€” summary counts
   - `content-folder/_work/question-bank-audit.json` â€” machine-readable row classifications
   - `content-folder/_work/question-bank-audit.csv` â€” per-row table

   Status meanings:
   - `ready` â€” current automated checks permit a reviewable import
   - `needs-answer` â€” no Aâ€“E answer key found
   - `needs-repair` â€” parse damage requiring manual rescue before review
   - `needs-figure` â€” figure-dependent item (see the figure/table scan below)
   - `needs-review` â€” passes the structural gate but does not yet have a clean key
   - `orphan` / `duplicate` â€” excluded from automated import

   The audit now applies two **stemming detectors** on top of the pre-set `needs_figure` flag (added 2026-11-15 after the economics drain):

   - `figure-reference` â€” the stem mentions the structure it depends on: `table`, `diagram`, `graph`, `figure`, `chart`, `histogram`, `column(s)`, `row(s)`, `curve`, `shade/shaded`, `sketch`. A stem that cites a figure that no longer exists in the render is not a review item, it is a hopeless one â€” these land in `needs-figure`.
   - `digit-wall` â€” any single line of the stem carrying **4 or more bare numeric tokens** (e.g. `Q(ton) 400 500 600 700 800 900 10 TC(N) 16000 18000`, `Output Total Cost (N) 1 20 2 56 3 96`). This is a table the parser flattened into whitespace. These land in `needs-figure` too.

   Both are set in the row's `issues` and force `needs-figure` (never `ready`); the `needs_figure` column in the CSV/JSON marks them true so downstream tooling sees them the same way.

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
   Admin â†’ Questions â†’ Review. Reviewers can read the key in the protected queue, validate the answer and explanation, then publish or reject.

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
- **Figure/table scan is a hard pre-seed gate, not a quality nicety** (see below). Any row flagged `needs-figure` stays un-seeded until a human re-authors it from the print. There is no bulk publish path that bypasses this, and a bank may not ship items whose tables/figures render as plain text.
- A keyed item is still not finished merely because the key exists. Reviewers must check that the answer is actually defensible and that the explanation teaches the reasoning, not just validates the option.

## Batch planning rules

`plan` selects only rows classified as `ready` by the audit and re-checks the same structural gate before writing the manifest. It also:

- restricts to Aâ€“E answers and Aâ€“D options;
- rejects orphan and figure/table-dependent rows (anything the audit flags as `needs-figure`, via the pre-set flag or the `figure-reference` / `digit-wall` detectors);
- deduplicates by normalized question text + options within the batch;
- records the original parsed file and index so a reviewer can trace the question back to its source;
- can filter by `--year 1984,2008` or cap the run with `--limit`.

## Explanation format for maths and calculation questions (decided 2026-11-14)

**The decision:** questions whose solution is a procedure â€” maths, and the calculation-heavy parts of Physics, Chemistry and Principles of Accounts â€” explain the answer as **worked steps**, not prose summaries. Each step carries:

- `operation` â€” what is done in this step
- `reason` â€” why this step, not another
- `result` â€” what the step yields
- `predictPrompt` â€” an invitation for the learner to predict the next step before reading it

The shape is reused deliberately from the lesson `worked_example` block convention (problem + named steps with operation/reason/result, with the predict-first loop described in `docs/lesson-authoring-standard.md`), so a learner meeting worked mathematics in the question bank is practising the same muscle the lessons teach.

**What this does not change:**

- Prose-subject questions (Government, Literature, CRK, â€¦) keep prose explanations. Worked steps are for procedures; forcing them onto prose arguments produces nonsense.
- Everything stays `in_review` / `unverified` until a human checks the item in the admin review queue. Worked steps are held to the same gate as the answer itself.
- Provenance is mandatory on every bank item: `recomputed_by_assistant` (independently re-derived) or `ledger` (carried from a research ledger without full re-derivation). Items that cannot be honestly solved are kept with a `hold_reason`, never silently dropped.
- Topic tags from the machine-generated sidecars are untrusted and were set to `unmapped` across the OCR-lifted corpus â€” topic assignment happens during human review, not at import time.
- Stems and options carried over from OCR'd PDFs are OCR-raw until a human re-typesets them; nothing from an OCR-lifted year is learner-facing-ready.

**Application state as of 2026-11-14 (honest):**

- Mathematics 1984 (hand-vetted pilot): 32 in-bank items; 1 carries the full structured `steps[]`; the remainder carry terse but correct prose derivations awaiting conversion. 17 held items document why they cannot be used.
- OCR-lifted years (1983, 1985â€“1995, 1997â€“2004): explanations are research-ledger shorthand, not learner-facing teaching prose; stems are OCR-raw. Worked-steps conversion is outstanding for all of them, and the same treatment is not yet applied to Physics, Chemistry or Accounts banks even though they share the calculation-heavy profile.
- Step structure is stored inline in the bank JSON as a `steps` array alongside the flat `explanation` string, so conversion can land incrementally without re-authoring the whole record.

## Figure/table loss detection (required before any seed â€” added 2026-11-15)

**Why this exists.** Economics entered the published pool with stems whose tables and figures had been flattened to plain text (`Price 5 15 5 16`, `Q(ton) 400 500 600 10 TC(N) 16000`, walls of bare numbers), making the items unanswerable as rendered. On 2026-11-15 the owner gated the economics pool to `draft` for exactly this reason (1197 â†’ 210 published). A detector that would have caught it already existed in concept (`needs-figure` is a declared audit status) but had no detection logic â€” it only ever surfaced the flag the parser happened to set, never the actual loss. This section closes that gap.

**The rule.** Before any bank import â€” Economics, Mathematics, Accounts, CRK, anything derived from PDF or OCR â€” the audit must report **zero** rows entering the seed with `figure-reference` or `digit-wall` issues, unless every flagged row has been re-authored by hand from source print and re-queued through review. No exceptions, no waiver in bulk, no "they'll read around it". The batch planner already rejects `needs-figure` rows; this detector is what feeds it.

**What the detectors catch** (any hit forces `needs-figure`, never `ready`):

- `figure-reference` â€” the stem cites a structure that must exist to be answered: `table`, `diagram`, `graph`, `figure`, `chart`, `histogram`, `sketch`, `column(s)`, `row(s)`, `curve`, `shaded`. In a correct render these words point at visible content; in a lossy one they point at nothing.
- `digit-wall` â€” a line carrying 4+ bare numeric tokens (`Output Total Cost (N) 1 20 2 56 3 96`), i.e. a table the parser collapsed into whitespace-separated cells.

First live run against the 2026-11-15 parsed corpus flagged 40 rows (23 in `JAMB-Economics-Past-Questions-and-Answers.json`, 17 in `JAMB-Biology-Past-Questions-and-Answers.json`), 15,837 rows classified total. The counts by source are written into `question-bank-audit.md` on every run â€” check them, every time.

**Known limits â€” do not rely on the detector alone:**

- A table fused into prose without spacing (`TotalOutputCost`) or keyword (`value of the marginal cost when...`) can evade both detectors. Layout tags from the parser (`needs_figure`) remain mandatory input, not a redundant add-on.
- A single line is the unit of detection; a five-row table collapsed onto wrapped physical lines each with â‰¥4 numeric tokens is still caught, but a two-column table with word labels on each row can evade it.
- False positives are acceptable by design (four years on one line is a flagged stem): a human clears them at review, which is cheap; silent pass-through is what we will not accept.

**Remediation path for genuinely table-bearing items:** re-author from the print by hand â€” PyMuPDF text-layer extraction where the layer is clean, page-image render + human reading where it is not â€” typing the table as structured content the learner-facing renderer can draw (the same method used to recover the 60 economics orphan stems, recorded in `docs/deferred.md` 2026-11-15). The re-authored row then re-enters through the normal import â†’ review queue flow with provenance noted; publishing remains human-gated.

**Retroactive expectation.** Any corpus already in the bank carrying `source` tags from a lossy parse should be re-scanned and, where the detectors flag it, pulled from publish-eligible status until re-authored. Economics was done by hand this way on 2026-11-15; Mathematics (1983â€“2004), Accounts and Biology are the next candidates, and no 1986-onwards maths tranche may seed without a clean audit line.

## Intended use

Use this for small, auditable batches and pilot imports. Do not bulk-import the whole corpus until the review queue can realistically process it.
