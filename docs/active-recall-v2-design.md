# Active Recall v2 — Design Doc

**Status:** proposed, not implemented. Date: 2026-11-25.
**Scope:** (1) promote the 447 existing inline section checks into free-recall cards, (2) replace the flat review date with a retrievability-based interval. No new question authoring, no new UI surface, no AI dependency.

---

## 1. Why this exists

The current states:

| Mechanism | Coverage | Retrieval mode | Timing |
|-----------|----------|----------------|--------|
| Inline 10-second check | 988/2,191 text blocks (45.1%) across 9 subjects | **Cued** recognition (4 options visible) | Massed, immediately after the section |
| Recall card (`/recall`) | 20 cards in **1 topic** (0.4% of published topics) | **Free** recall (front → generate → flip) | Spaced via `learner_topic_mastery.next_review_at` |

The evidence base says the strongest learning comes from **free recall**, **spaced at low retrievability**, with **feedback**, and from **pre-testing** before new material. The 10-second checks already deliver the feedback half (why + steps + walkthrough) and the spaced engine already exists — but the two are disconnected: the checks die at the end of the lesson, and the recall engine has almost no cards.

Goal: connect them. Convert every section check into a recall card so the existing 988 checks become a spaced retrieval queue, then make the interval respond to how close the learner was to forgetting.

---

## 2. Research basis (what the design copies and why)

Primary sources reviewed: Wikipedia *Testing effect* synthesis (Roediger & Karpicke 2006/2008, Dunlosky et al. 2013, Butler & Roediger 2008, Carpenter 2009, Kornell et al. 2009, Pan & Sana 2021, Pan & Rickard 2018, Yang et al. 2021) and the FSRS-7 algorithm specification (open-spaced-repetition, updated Nov 2026).

Patterns adopted:

1. **Storage vs retrieval strength** — restudy inflates short-term retrieval strength; testing builds long-term storage strength. The system must schedule tests, not rereads.
2. **Retrieval effort hypothesis** — difficult-but-successful retrieval > easy successful retrieval; cued recall helps short-term and hurts long-term (Carpenter 2009). Therefore the card **front must not carry the options**.
3. **Feedback makes MCQ safe** — MCQ without feedback entrenches lures; with feedback it reduces negative effects (Butler & Roediger 2008). Therefore the card **back carries the check's why/steps**, and the leaner still sees the original check inline.
4. **Unsuccessful attempts help if followed by feedback** (Kornell et al. 2009, generation effect) — a wrong card mark is not a failure state; it schedules a sooner return.
5. **Spacing multiplies the effect**, gap grows with retention horizon (Karpicke & Roediger 2007, Cepeda).
6. **Review when retrievability is low** — FSRS-7's decisive finding: the smaller R at a successful review, the larger the stability gain. The best time to review is when you almost forgot it.
7. **Four-grade memory modelling** — FSRS uses Again/Hard/Good/Easy; stability increases on success, decreases on lapse, saturates with high S, grows more slowly for high D. Binary got-it/learning cannot express this.
8. **Transfer needs format variety + inference** (Pan & Rickard 2018) — keep the original MCQ check *and* add the free-recall card; do not replace one with the other.

Explicitly **not** adopted:
- Full FSRS-7 (34 fitted parameters, per-card D/S state) — too much machinery for v1. The graded model below is a deliberate, explainable subset (see §4).
- Learning-style personalisation, speed rewards, streak pressure, open-ended AI chat — all forbidden by the product requirements.

---

## 3. Phase 1 — Promote section checks into recall cards

### 3.1 Source rule

One card per section check, keyed by `(lesson_id, front)` — the existing unique index in `20261107000009_recall_cards.sql` already enforces idempotency.

For each `lesson_blocks` row where `block_type = 'text'` and `content.check` is a valid `SectionCheck` (`question`, `options[]`, `answer` index in range, `why` and/or `steps`/`walkthrough`):

| Card field | Derivation |
|-----------|-----------|
| `subject_id`, `topic_id`, `exam_id` | From the parent `lessons` row (same as the vocab seed) |
| `lesson_id` | Parent lesson id |
| `front` | `check.question` verbatim (no options) |
| `back` | Correct option text + `why` + procedural `steps`/`walkthrough` rendered as plain text |
| `hint` | First distractor that is *not* the answer, prefixed `"Think about: "` — optional, only when no `why` exists |
| `source` | `'check-derived'` |
| `published` | `true` (lesson is published by construction) |

Backward-compatible with the existing vocab seed: the `(lesson_id, front)` index prevents duplicates, and a check whose question equals a vocab word front is skipped rather than overwritten.

Re-running the script must produce zero new rows after the first run (idempotency is a hard acceptance test).

### 3.2 Honest limits of auto-generation

- A check written as "Which of the following…" with stem-dependent options (e.g. "In the above diagram…") makes a weak standalone card front. Rule: skip checks whose `question` references a figure/diagram/table ("above", "below", "the diagram", "the table") unless the correct option text alone restates the fact — flag these in the run report as `needs-human-card` rather than guessing.
- Cards from calculation checks carry the worked steps on the back — that is the correct "verification" half; no new derivation is authored.
- No key is changed. The card back is derived from the recorded answer and explanation only.

### 3.3 Expected coverage after Phase 1

| Subject | Section checks → candidate cards (dry run 2026-11-25) |
|---------|--------------------------------------------------------|
| Biology | 276 |
| Chemistry | 132 |
| Physics | 129 |
| English | 111 |
| Government | 99 |
| Mathematics | 94 |
| Economics | 69 |
| Commerce | 66 |
| Current Affairs | 12 |
| **Total** | **988 candidate cards**, 0 figure-dependent skips, idempotent on re-run |

Measured from all 2,191 published text blocks, not a sample; an earlier 447 count came from a query capped at 1,000 blocks and was an undercount.

Topic-level coverage rises from 1/274 to roughly the 1/3–1/2 of topics that carry section checks, measured and reported per subject after the dry run — not claimed before it.

### 3.4 Script shape

`scripts/promote-checks-to-recall.mjs` (new, service-role, `--dry-run` default, `--apply` explicit):
1. Fetch published lesson blocks with checks (chunked, like the econ scripts).
2. Derive cards per §3.1; validate every field non-empty.
3. Dry-run: print per-subject counts, skip list, and 3 sample cards.
4. Apply: batched `.upsert(..., { onConflict: 'id' })`-style insert relying on the `(lesson_id, front)` unique index; `source: 'check-derived'`.
5. Verify: re-count by subject and assert zero new rows on a second apply.

---

## 4. Phase 2 — Retrievability-based interval (graded v1)

### 4.1 Memory state (per learner × card)

New table `recall_review_state`:

```
user_id uuid          -> auth.users
card_id uuid          -> recall_cards
stability real        -- days at which R = 90%
difficulty real       -- 1..10, default 5
reps int default 0
lapses int default 0
last_review_at timestamptz
due_at timestamptz
grade smallint        -- last grade 1..4
```

Unique `(user_id, card_id)`; RLS: own-row read only, no client writes (service role only), matching `learning_attempts` / `learner_topic_mastery`.

### 4.2 Forgetting curve (explainable subset of FSRS)

`R(t) = (1 + t / (9 · S))^(-1)` — FSRS v4's curve, which uses `R(S) = 0.9`. One parameter, auditable, no fitting.

Initial stability after first grade G (1=Again, 2=Hard, 3=Good, 4=Easy): a fixed ladder `[0.4, 1.0, 2.4, 5.8]` days (FSRS v4 defaults).

Update rules on review (mirroring FSRS v4, constants simplified):

```
If success (G>=2):
  S' = S * (1 + 1.3 * (11-D) * S^-0.5 * (e^(0.1*(1-R)) - 1) * ease_multiplier)
  D' = clamp(D - 0.5*(G-3) - 0.1*(1-R), 1, 10)
If lapse (G=1):
  S' = max(0.4, S * 0.5 * e^(0.2*(1-R)))
  D' = clamp(D + 0.6, 1, 10)
  lapses += 1
next interval = 9 * S' * (1/target_R - 1), target_R = 0.9
```

These are deliberately fixed constants, not fitted weights. They are versioned in one exported config object (`RECALL_CONFIG`) with the citations above, so tuning is an auditable change, not a black box.

### 4.3 Grade mapping for the current UI

The player currently asks a binary "Got it / Learning". Map:

- Got it → **Good (3)**; optional second state "too easy" → Easy (4) if a learner flags it.
- Learning → **Again (1)**.

Hard (2) is held back until the UI has an explicit 4th button; a graded UI is a small follow-up, not a v1 blocker. The schema already stores `grade` so adding Hard later needs no migration.

### 4.4 Interaction with the existing mastery model

**Do not create a second scheduler.** `learner_topic_mastery` remains the one subject-level model; `recall_review_state` is card-level evidence feeding it. On each card mark:

1. Insert `learning_attempts` row (`attempt_type='recall'`, `recall_card_id`, `is_correct`, `confidence=null`) — unchanged contract.
2. Write/update `recall_review_state` (service role).
3. Call `applySubjectEvidence` with the correct/total pair — unchanged; subject mastery still drives `/home`, `/progress`, and the cohort push.
4. Recall card selection changes from "random fresh cards in due subjects" to "cards whose `due_at <= now`, ordered by `R` ascending (most likely to be forgotten first), limit 10; fill with never-seen cards in due subjects if fewer than 10 are due." The 24-hour recent-correct sit-out stays.

The subject-level interval ladder stays as-is for now. A later pass can feed card-level retrievability into `nextReviewInDays` — tracked as a follow-up, not in this design.

### 4.5 Pre-testing (Phase 3, deliberately out of v1)

The evidence for pre-questions is strong for concrete facts, but it changes lesson sequencing (question before teaching) and the player's teach-gate logic. Out of scope here; noted in `docs/deferred.md` when this ships.

---

## 5. Security and data rules

- No new client write grants. `recall_review_state` follows the existing service-role-only pattern; the definer RPC or server action is the only write path.
- Exam scope: card selection filters `exam_id` through the same `inScope` helper used in `lib/actions/recall.ts` — no cross-path leakage.
- Pro gate stays: `/recall` is Pro; the free tier keeps the inline checks.
- No answer keys are modified. No claim of "human verified" is introduced — card content is derived from existing source-cited lesson content.

---

## 6. Verification plan

1. Dry-run promotion: counts, skip list, samples checked against the source lesson JSON.
2. Apply in a transaction-safe batch; verify second run inserts 0 rows.
3. Read-back: per-subject card counts and topic coverage measured from prod.
4. Scheduler unit checks: `R(0)=1`, `R(S)=0.9`, lapse never raises stability, high-S growth saturates, gap always >= 1 day, exam horizon cap respected.
5. Two-learner smoke: one mark → `learning_attempts` row + `recall_review_state` row + subject mastery evidence; scope filter denies cross-path reads.
6. Render inspection: open `/recall` as a Pro user and confirm the front hides options and the back shows the check's why/steps.
7. `npm run typecheck`, `npm run build`, then commit only the intended files.

---

## 7. Rollout and budget

- Phase 1 script: ~1 session, no prod writes until dry-run reviewed by the owner.
- Phase 2 migration + action changes: ~1 session, applied only after Phase 1 coverage is confirmed.
- Human review of the `needs-human-card` skips: owner decision; those checks stay inline-only.
- Rollback: delete rows where `source='check-derived'` (safe, they are additive); drop `recall_review_state` table for full v2 rollback. The existing vocab cards and inline checks are untouched in either case.

---

## 8. Success measure

Not "cards created". The measures that matter:
- Topic coverage with free-recall cards (per subject, measured after apply).
- Delayed recall accuracy on card re-attempts (card-level R vs observed correctness) — the same delayed-recall metric the PRD names as the north-star evidence.
- Return-after-failure and repair-attempt rate on wrong card marks.

If delayed recall does not move after a 4-week cohort, the interval constants get tuned from observed data — not the content replaced.
