# Full codebase bug audit checklist — 2026-11-25

Research basis: OWASP Top 10:2025, OWASP API Security Top 10:2023 (BOLA/BFLA/mass assignment/resource consumption/SSRF), OWASP Business Logic Security cheat sheet (race conditions, workflow state machines, server-side re-derivation), OWASP Next.js cheat sheet, Next.js 15 production checklist, Supabase production security checklist, and published web-app/API audit checklists (2026).

Every item must be marked PASS, FAIL, PARTIAL, or NOT VERIFIABLE with file:line evidence. Nothing may be silently skipped.

## A. Access control and authentication
- A01 Every route handler / Server Action / page classifies its audience and enforces it at the data source
- A02 BOLA: object-level ownership checked on every id from the client (sessions, results, mocks, referrals, payments, squads, push)
- A03 BFLA: admin/privileged functions check role server-side; no client-supplied role
- A04 Mass assignment: create/update accept an allowlist; no client-set user_id, entitlement, amount, status
- A04b Excessive data exposure: responses return only fields the caller may see
- A05 Session/cookie flags; logout invalidation; session expiry behaviour
- A06 Open redirect on every `next`/`redirect`/`returnTo` param
- A07 Rate limits on auth, reset, signup, referral, check-email, welcome, answers, admin
- A08 Account enumeration intentional and throttled
- A09 Password reset single-use, expiring, guarded; no session fixation
- A10 Secrets never client-side; no service-role key in bundles; `NEXT_PUBLIC_` only for public values
- A11 SSRF: no user-supplied URL fetched server-side (webhooks, push endpoints, image proxies)
- A12 XSS: no unescaped user content, no `dangerouslySetInnerHTML` with untrusted input, JSON-LD escaping
- A13 SQL safety: no string-built SQL from user input; definer functions have `search_path` and NULL-safe guards
- A14 CSRF posture for mutations; Origin checks; SameSite
- A15 Dependencies patched; no known-vulnerable versions

## B. Business logic and data integrity
- B01 Idempotency: retries/replays cannot double-grant (payments, referrals, entitlements, answers)
- B02 Race conditions / TOCTOU: check-then-act sequences (referral claim, free-mock counter, session start, completion, balance)
- B03 Transactions: multi-step writes atomic; no ignored compensating deletes
- B04 Workflow state machines enforced server-side, not by UI order (onboarding, payment callback, reset)
- B05 Server re-derives security-relevant values (price, product, ownership); client values never trusted
- B06 Pagination caps / bounded page sizes; no unbounded scans
- B07 Failed writes surfaced, never swallowed; no false success
- B08 Deletes/orphans: cascades complete; orphan reconciliation exists

## C. Reliability and observability
- C01 global-error / global-not-found / loading / error boundaries present
- C02 Fail-closed for auth and entitlement; deliberate fail-open documented
- C03 Logs free of PII, tokens, endpoints, ids
- C04 External calls bounded by timeouts (Resend, Upstash, Supabase, Paystack, web-push)
- C05 Errors reported and alerted; health/uptime endpoint
- C06 No unhandled rejections; timers/listeners cleaned up

## D. Performance and cost
- D01 Heavy libs off the critical path (KaTeX, PDF, charts)
- D02 Caches scoped to audience; no cross-user reuse
- D03 No duplicate fetches per request; no waterfalls
- D04 Images optimised; static assets long-cached
- D05 Fonts self-hosted
- D06 Redis/DB hot paths bounded; indexes present

## E. Accessibility and UX correctness
- E01 Labels, focus, keyboard, contrast, ARIA state
- E02 Responsive at 320/360px; no overflow
- E03 Loading/empty/error states; no false success copy
- E04 Hierarchy: primary vs secondary actions
- E05 Math/fraction rendering correct; no raw authoring tokens
- E06 Validation feedback specific and announced

## F. Content and configuration
- F01 Lessons meet authoring standard (one concept, Core uncapped, depth 600-900, no em/en dashes)
- F02 No raw `{{...}}` tokens in learner-facing fields
- F03 Trust metrics not published without sign-off
- F04 No dead internal links; data-driven slugs valid
- F05 Migrations all registered and replay-safe
- F06 Privacy/legal copy matches actual behaviour