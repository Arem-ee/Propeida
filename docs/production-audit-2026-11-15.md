# Production audit — 2026-11-15

Scope: whole codebase at `origin/main` (`b6ec428`): rendering, responsiveness, security, Vercel/Supabase/Upstash cost, question-bank growth. Four parallel reviews (Supabase query cost, Upstash Redis, security, rendering/bundle), plus direct verification. Static analysis only for cost estimates; verify with `EXPLAIN (ANALYZE)` before applying the SQL items.

**Status legend**: [shipped] committed and live on 2026-11-15 · [migration] written, NOT applied — needs your go-ahead · [reported] deliberately not changed yet · [verify] worth confirming on prod.

---

## Direct answers

### "Will one question call scan the whole database as the bank grows?"

Two calls did, both now shipped as cached reads (5-minute `unstable_cache`, published rows only):
- `/practice` read every question's `exam_id` (up to 20,000 rows) per page view → `c33cfb3`
- `/mocks` paginated the whole published bank per page view → `c33cfb3`
- Learn hub scanned every published lesson row per view → `2056fd2`

And one path still will, and cannot be cleanly fixed from app code — it is a **database** property: `get_session_questions` (`20261115000009`) scans the pool, sorts globally by `md5(id::text || seed)` (no index usable), runs two more pool passes, and executes under the caller's RLS with the questions policy (see C2). At 10x bank size that is tens of ms; at 100x it is the hottest RPC in the app. The real fix is a security-definer rewrite with a precomputed hash ordering — see "Not done, and why". The new composite index helps the filter side (`questions(exam_id, status)`, [migration]).

### "How well is Upstash Redis used?"

Nearly unused, and in the right places. Three consumers only:
- rate limiting: `contact` 3/min, `inquiries` 3/min, `paystack-initialize`/`verify` 10/min, `welcome` 10/min, `events` 120/min — all namespaced `rl:endpoint:ip`, fixed-window, fail-open to a per-process fallback;
- `claimOnce` (SET NX PX) for once-per-day ghost-nudge dedup;
- presence/cohort stats use `unstable_cache` (no Redis at all) — correct choice;
- the mock hot path makes zero Redis calls.

One mock exam ≈ 0 Redis commands (≤ ~10 pathological). Free tier (500k commands/mo) fits with ~50–100x headroom. **Redis is under-used, not over-used — it is not a cost risk today.** The weak spots were semantics, and the two real ones are shipped in `a564100`: the non-atomic INCR→PEXPIRE could orphan a key and block an IP forever (now rolls back), and the per-process fallback map was unbounded and attacker-keyed by IP (now capped at 1000 with a sweep). Two abuse targets had no limit — referral claim and account deletion — both now throttled.

### "What does a Vercel/Supabase call cost?"

The bill driver is **per-visit Supabase round trips and per-answer server invocations**, not Redis. `/home` paid for 3–4 auth verifications per view (now one via request-scoped `cache()`), middleware verified the user on every matched request including `/` (now skipped; `/` dropped from the matcher), and the lesson route fetched its content twice (metadata + page — still queued, see below).

---

## Critical

**C1 — `process_payment` rolled back paid orders for referred first-time buyers.** The live `20261115000011` function calls `grant_referral_reward()` before promoting the referral out of `pending`; the reward function only grants against a verified, unrewarded referral, raises, and the exception rolls back the payments and entitlements rows. The webhook 500s and Paystack retries forever; the buyer paid and got nothing. → [migration] `20261115000013_process_payment_referral_order.sql` — promote first, grant second, and a referral failure can never roll back a payment. **APPLY THIS FIRST.**

**C2 — Questions RLS is a per-row subplan gauntlet.** Policy "questions are accessible by exam access" runs, per row: an admin EXISTS, `has_campaign_access()` (plpgsql, planner-opaque), an exams school_id PK probe, and `is_own_free_pool_question()` whose `user_exam_free_pools` branch probes **every question row against the learner's whole free pool (~360–720 rows) with no `question_id` index anywhere**. Every authenticated question read pays this. → [migration] `20261115000014_audit_performance_indexes.sql` adds `user_exam_free_pools(question_id)` and `questions(exam_id, status)`. Longer term: wrap the qual in one inlinable SQL definer function with ordered short-circuits, and make `has_campaign_access` SQL-stable.

**C3 — Full-bank scans per view.** `/practice` (20k-row probe), `/mocks` (paginated whole bank), Learn hub (whole lessons table). → [shipped] cached 5 min (`c33cfb3`, `2056fd2`). Ideally backed by a `GROUP BY exam_id, subject_id` definer RPC once the migrations are applied; the cache already kills the recurring cost.

**C4 — The mock/practice submit path.** Every answer is a server action with `getAuthUser()` + `getSessionById` + RPC writes. Practice mode additionally chains a reveal RPC, then on wrong answers an admin misconception lookup + two full-scan counts (`sharedStrugglePct` — no `question_answers(question_id)` index existed → [migration] fixes). Mock mode fire-and-forgets `void submitAnswer`, so rapid taps can land out of order and **unsaved selections score as blank with no error surfaced**. → [migration] adds `session_answers(question_id)`. The client-side batching (one submit at exam end) is a design change, queued (see "Not done").

## High

**H1 — Payment fulfillment plausibility gap.** Webhook and verify paths granted entitlements without checking currency or minimum amount against the product price. Server-side pricing makes it defense-in-depth, not an active exploit. → [shipped] `b95a0b2`: both paths now require `NGN` and `amount >= PRODUCT_AMOUNTS[product]`.
**H2 — `get_platform_stats`**: anon-callable, full `session_answers` count (no index on `selected_answer`), no cache, and `active_students_30d` counts rows not distinct users. `/api/stats` still carries `force-dynamic` (and `max-age=60` browser cache only — no edge cache). → [reported] 410 the route or lock it to an ISR-cached definer RPC (no in-repo caller; grep found none).
**H3 — `/home` round trips.** 3–4 auth verifications + ~18–24 duplicate `getExamScope` queries per render (each scope resolution is 3–4 queries; six copies per view). → [shipped] one verification via request-scoped `cache()` (`3c90039`, `e6f0496`) + middleware skip. Memoizing `getExamScope` itself needs a per-request key — see "Not done".
**H4 — `/api/account` and referral claim were unthrottled.** → [shipped] `a564100` (5/min and 10/min).
**H5 — `getSessionHistory`** read every completed session ever per user, called from `/progress`. → [shipped] capped at 100 (`9c14313`).

## Medium

- **M1 — Referral order bug (above) also means `/payment/callback` + verify page can strand paid users on retry.** Covered by C1.
- **M2 — Admin pages are gated only by `app/admin/layout.tsx`**, which does not re-run on client-side navigations; every admin page then reads with the service role. API routes all self-check via `requireAdmin` (verified OK). → [reported] per-page `requireAdmin()` across `app/admin/**` (~20 mechanical changes).
- **M3 — `resend` was in devDependencies** but imported by runtime code (`auth/callback`, welcome route, both crons) → [shipped] moved to dependencies; `@types/katex` moved to devDependencies (`bd916bc`).
- **M4 — `getSessionQuestionsWithStatus` + per-answer chains** make `/results` and `/practice/session` entirely client-side: two serial round trips after TTFB (plus a separate `isPro` action in results). → [reported] convert to server components like `/mocks/session` (kills the skeleton blank and one action).
- **M5 — KaTeX ships on every page** (root layout CSS, ~20–25 KB render-blocking) and re-renders on every lesson render; already-large `ALL_NOTES` corpus duplicated into lesson and practice client chunks (~7–8 KB gz). → [reported] scope the CSS to the lessons segment, `useMemo` the parse, pre-render at save time ideally.
- **M6 — Landing images** (hero 219 KB, 16 screenshots) without dimensions/lazy/priority → LCP/CLS. `/` is static, so these are pure HTML attributes. → [reported] S-sized fix, not done because `public/landing/*` is under active edit by the redesign flow.

## Low

- CSP: `upgrade-insecure-requests` missing; `'unsafe-inline'` in script-src (needs nonce or accepting trade-off). `X-App-Commit` exposes the SHA (informational). [reported]
- Two `with_issues` items resolved in passing: `searchParams` NC.dev GA pathname leaked query string (payment references were being sent to Google Analytics — [shipped] `88261ee`), squad-nudge cron silently skipped auth users past page 1 (now pages all, cap 20×1000 — [shipped]), `/payment/callback` unencoded + uncapped reference ([shipped]).
- Standardize `requireAdmin()` in admin pages to return not-found vs redirect. [reported]
- Contrast: `text-gray-400` on white is 2.5:1 (AA fails) on several learner surfaces; `gray-500` passes. [reported] (files under active edit — batch later)
- Dead `revalidatePath('/history')` in `completePracticeSession` (no such route). [reported]
- ~1 MB unreferenced images in `public/images/landing/` (`nigeria-map-students.jpg`, `hero-students.jpg`). [reported] — delete or wire in.

## Not done, and why

1. **`get_session_questions` security-definer rewrite** (kills C1's RPC-side cost: global md5 sort → indexed hash sampling, one pass, single pool authorization). This is the one structural fix for bank growth. It changes plpgsql behavior every session depends on; needs a review cycle and prod verification with `EXPLAIN (ANALYZE)`. Staged for your go-ahead.
2. **Questions RLS single-definer short-circuit function** (C2 long fix). Same category: needs SQL review against migration history.
3. **`getExamScope` request memoization + `/home` streaming with Suspense + `(app)/loading.tsx`** (H3/M4) — touches layout and `dashboard.ts` heavily; the parallel redesign is mid-flight there.
4. **Mock-player batch submit** (C4 client side) — design change to the redesigned CBT UI; the in-flight redesign owns those files.
5. **Per-page `requireAdmin()`** (M2) — ~20 mechanical edits; sequence after the redesign lands to avoid conflicts.
6. Anything that needs a SQL migration **not applied without your sign-off**: `20261115000013`, `20261115000014`.

## Verified OK (no action)

- Admin API routes self-check `requireAdmin()` per file; admin boundary holds; privilege columns server-managed with guard triggers.
- Paystack webhook: HMAC-SHA512 + `timingSafeEqual`, 64 KB cap, re-verifies with Paystack server-side before any state change; refund path re-verifies before revoking access.
- Session cookies sameSite=lax; server actions same-origin; `safeInternalPath` guards open redirects; both paystack routes rate-limited; cron routes fail-closed with constant-time compare.
- `record_session_answer` RPC enforces `es.user_id = auth.uid()` server-side (double enforcement with the app checks).
- No secrets in tracked files; GA4 id is public-by-design; service-role never client-reachable.
- Cache Storage never holds HTML or `/api/*` or Supabase responses.

## Cost model recap

| Path | Before | After shipped |
|---|---|---|
| `/practice` | ~20k rows + map per view | 0 extra reads (5-min cache) |
| `/mocks` | N= bank/1000 requests per view | 1 scan / 5 min |
| `/learn` | lessons table per view | 0 extra reads (5-min cache) |
| `/home` | 3–4 auth verify + ~20 scope queries | 1 auth verify (scope dedupe still pending) |
| Mock exam Redis | 0 commands | 0 commands |
| KaTeX on non-lesson pages | yes | still yes (queued) |
| Per-answer | 5–8 round trips (practice) | same, minus one full-scan count via `session_answers(question_id)` index (pending migration) |

## Verify plan

`EXPLAIN (ANALYZE)` for: the selector sort, the policy expansion on a count-exact head query, the 7-day `count(distinct user_id)`. Confirm `active_students_30d` intended meaning. Re-run Lighthouse on `/` and `/learn` after the image and CSS fixes land.
