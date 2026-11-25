# Section B — Data integrity and business logic (2026-11-25)

Scope: payments, entitlements, referrals, sessions, answers, mocks, squads, account deletion. No code modified.

## B01 Idempotency — PARTIAL (High)
Correct: payment rows unique on `paystack_reference`; entitlements unique `(user_id, product)`; `grant_referral_reward` claims atomically; `claim_referral` RPC; mock/practice completion via locked RPCs.
Failure: **replaying a successful `charge.success` re-arms the term.** The webhook early-returns on `status='success'` (`webhook/route.ts:147-150`) and `process_payment` now preserves an active paid entitlement, but both must hold; the DB-level guarantee is the `where` clause added in `20261121000001`. Verified present. Residual: any *other* caller of `process_payment` (admin, future) could still extend; the guard is in the SQL, so it holds.

## B02 Races / TOCTOU — FAIL (Medium)
- **Fixed:** mock-event sessions now have `exam_sessions_one_per_event_user_idx` (`20261121000006`).
- **Fixed:** practice completion uses a `for update` RPC (`complete_practice_session`).
- **Open:** free-mock allowance is check-then-act. `countUsedFreeMocks` (`lib/actions/practice.ts:86-103`) reads, then `createSession` inserts later (`:175+`) with no lock or atomic counter. Two concurrent starts can both pass and create two mocks. `try_start_free_mock` exists but is not used on this path.
- **Open:** squad flag flips (`lib/actions/squads.ts:385,395,421,425`) update `profiles.squads_enabled` outside the RPC with an ignored compensating update; a failure leaves the flag inconsistent.
- **Open:** `createSession` compensating deletes ignore errors (`practice.ts:323,330,417`).

## B03 Transactions — FAIL (High)
Refund is now atomic via `process_refund` (fixed). Practice completion atomic (fixed). Referral claim atomic (fixed).
Still non-transactional: session creation (session row + answers + warmup + micro-lesson, `practice.ts:175-420`) with best-effort cleanup; squad flag flips; onboarding partial saves (two-step, `lib/actions/onboarding.ts:17` then `:299`).

## B04 Workflow state machines — PARTIAL (Medium)
Onboarding enforces order in the UI and re-validates on save (`onboarding.ts:269-301`), but there is no server-side step record; a crafted request can post the final payload directly. Payment callback polls and dedupes (`app/payment/callback/page.tsx`). Password reset is single-use via Supabase.

## B05 Server re-derives values — PASS
Product validated (`lib/paystack.ts:43-45`), amount re-verified against Paystack (`webhook:134`, `verify`), user id from session, entitlement RPCs service-role only.

## B06 Pagination caps — PARTIAL (Low)
Admin question browser clamps to 50/page. But admin contact/codes/schools/exams/lessons/cycles/mocks lists and `mocks/page.tsx` have no hard cap; `countUsedFreeMocks` and `getSessionHistory` use `.limit(100)`.

## B07 Failed writes surfaced — FAIL (High)
- `void submitAnswer(...).catch(...)` on the practice scoring path shows a message now (`practice-player.tsx:139`), but the answer is still lost.
- `answers/sync` reports per-item failures now (fixed).
- Still swallowed: mastery/streak writes (`practice.ts:646`, `lessons.ts`), squad compensating deletes, session-creation cleanup, `void load()/remove()` in admin managers (`cycles-manager.tsx:45,131`), `void poll()` in payment callback.
- Admin routes now report 500s (fixed) but many `void` UI chains remain silent.

## B08 Deletes / orphans — PARTIAL (Medium)
Account deletion cascades fully. Orphan risks remain: failed referral claim (now atomic, so fixed), failed session creation (ignored cleanup), refund/reward partial states (reconciliation cron exists at `/api/cron/reconcile`).

## Race / TOCTOU table

| Operation | Atomic? | Evidence |
|---|---|---|
| Payment grant | Yes | unique reference + conditional upsert |
| Refund | Yes | `process_refund` single txn |
| Referral claim | Yes | `claim_referral` RPC + unique |
| Mock-event start | Yes | unique index |
| Practice complete | Yes | `for update` RPC |
| Free-mock allowance | **No** | `practice.ts:86-103` + `:208-216` |
| Squad flag flip | **No** | `squads.ts:385-425` |
| Session create | **No** | `practice.ts:175-420` |

## Summary

| Item | Status |
|---|---|
| B01 | PARTIAL (High) |
| B02 | FAIL (Medium) |
| B03 | FAIL (High) |
| B04 | PARTIAL (Medium) |
| B05 | PASS |
| B06 | PARTIAL (Low) |
| B07 | FAIL (High) |
| B08 | PARTIAL (Medium) |

Priority: B07 (answer loss), B02 free-mock race, B03 session-create transaction, B01 webhook guard verification.