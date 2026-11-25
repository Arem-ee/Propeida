# Section A — Access control and authentication (2026-11-25)

Scope: every route handler (44), Server Action file (16), page/layout reading protected data, middleware, cached functions. No code modified.

## A01 Entry points classified — PARTIAL (Low)
All 44 route handlers and 16 action files were inventoried. Six routes are intentionally unauthenticated: `auth/check-email`, `auth/confirm`, `health`, `paystack/webhook` (signature-verified), `report-error` (IP-throttled), `stats` (public). `lib/actions/learn-subjects.ts` has no auth by design (public catalogue, cached).
Gap: `middleware.ts` matcher omits `/periodic-table` although `PROTECTED_PREFIXES` lists it (`middleware.ts:18` vs `:107-126`). The page re-checks, so no data leak, but the matcher and the list disagree.

## A02 BOLA / object-level ownership — PASS
Every id-taking path re-checks ownership: `getLessonByPath` (`lib/actions/lessons.ts:212`), `completePracticeSession`/`completeMockSession` (session ownership + `for update` RPC), `getSessionById`, `record_session_answer` (definer, `auth.uid()`), `answers/sync` (`app/api/answers/sync/route.ts:59-64`), push subscribe/unsubscribe (`.eq('user_id', user.id)`), `addUserExamAccess`/`removeUserExamAccess` (`lib/actions/profile.ts:41-60`), account delete (own id from session, `app/api/account/route.ts:14`). No client-supplied id is trusted without an ownership predicate.

## A03 BFLA / admin function authz — PASS
All 23 admin routes call `requireAdmin()` (`lib/admin.ts:13-26`) which derives the user from the session and checks `profiles.is_admin`. No client-supplied role is accepted anywhere.

## A04 Mass assignment — PASS
`updateOnboardingProfile` whitelists fields (`lib/actions/onboarding.ts:202-220`); `addUserExamAccess` inserts only `user_id` (from session) + `exam_id`; profile updates elsewhere are field-specific. No endpoint binds an arbitrary object.

## A04b Excessive data exposure — PASS
Responses are narrow DTOs: `check-email` returns `{exists}` only, `health` `{ok,at}`, `stats` aggregate counts, `getLearnSubjects` slug/label/count. Admin list endpoints return the records they manage, gated by `requireAdmin`.

## A05 Session / cookies — PASS
`lib/supabase/server.ts:13-24` preserves `maxAge`/`sameSite`/`path`/`httpOnly`/`secure` from Supabase; `auth/callback/route.ts` copies all attributes; logout clears cookies explicitly (`app/api/auth/logout/route.ts`).

## A06 Open redirect — PASS (fixed this session)
All redirect params now go through `safeInternalPath` (`lib/safe-redirect.ts`), which rejects `//`, `/\`, backslashes and control chars: `auth/callback/route.ts:12`, `api/auth/confirm/route.ts:37`, `auth/finish/page.tsx:30`, `middleware.ts:108`, `login/page.tsx:22`. Verified `/\evil.com` falls back to `/home`.

## A07 Rate limits — PASS
`lib/rate-limit.ts` with 11 call sites: signup/welcome/check-email/paystack-initialize/account-delete/answers-sync/events/report-error/referral-claim/push. Caps 1–120/min.

## A08 Account enumeration — PASS (intentional)
`check-email` is explicitly documented and throttled at 12/min (`app/api/auth/check-email/route.ts:7-12`); duplicate signups are handled with a clear message.

## A09 Password reset — PASS
Single-use, expiring tokens via Supabase; recovery session guarded in `auth/finish` (`linkType === 'recovery'`) and `update-password` redirects to `/forgot-password` without a session. OTP TTL itself is dashboard config (see G05).

## A11 Secrets — PASS
`SUPABASE_SERVICE_ROLE_KEY` and `RESEND_API_KEY` appear only in server files (`lib/supabase/admin.ts`, `lib/emails/send.ts`, admin upload/preview, `check-email`, `error-report`). No secret in `components/`. `NEXT_PUBLIC_` used only for URL/anon key/GA id.

## A12 RLS and grants — PARTIAL (Medium)
All 55 public tables have RLS enabled with policies. However 33 tables still carry legacy `anon=r` SELECT grants (e.g. `analytics_events`, `app_config`, `careers`, `contact_submissions`). These are read-only and mostly harmless, but they are broader than needed and should be revoked where anon does not need the table.
Four definer functions are anon-executable: `get_platform_stats`, `get_presence_stats`, `get_cohort_stats`, `get_upcoming_cycles` — all return aggregates/catalogue, no user data.

## A13 SQL safety — PASS
The only string-built query is `lib/path-subjects.ts:51`, guarded by a UUID regex at `:29`. All definer functions pin `search_path` (0 definers without it).

## A14 CSRF — PARTIAL (Low)
Mutations are POST with `SameSite=Lax` cookies and Next's Server Action Origin check. Route handlers do not add explicit Origin/Sec-Fetch checks.

## A15 Dependencies — PARTIAL (Medium)
`next 15.5.29` (clears CVE-2025-29927), `react 19`, `@supabase/ssr 0.6`. `npm audit --omit=dev` reports **0 vulnerabilities**.

## XSS / SSRF (A11-A12 detail) — PASS
`dangerouslySetInnerHTML` only for KaTeX output (`math-text.tsx:238,303`, `trust:false`) and JSON-LD with `<` escaped (`faq-json-ld.tsx:25`). Push endpoint host allowlist at `push/subscribe/route.ts:24-35`. No user-supplied URL fetched.

## Summary

| Item | Status |
|---|---|
| A01 | PARTIAL (Low) |
| A02 | PASS |
| A03 | PASS |
| A04 | PASS |
| A04b | PASS |
| A05 | PASS |
| A06 | PASS |
| A07 | PASS |
| A08 | PASS |
| A09 | PASS |
| A11 | PASS |
| A12 | PARTIAL (Medium) |
| A13 | PASS |
| A14 | PARTIAL (Low) |
| A15 | PARTIAL (Medium) |
| XSS/SSRF | PASS |

Priority: A12 (revoke unused anon grants), then A01 matcher, A14, A15.