# Section C + G — Reliability, observability, configuration (2026-11-25)

## C01 Error/loading/404 UI — PARTIAL (Low)
Present: `app/global-error.tsx`, `app/not-found.tsx`, `app/error.tsx`, `app/(app)/error.tsx`, `app/(app)/loading.tsx`, `app/admin/error.tsx`, `app/admin/loading.tsx`, `components/ui-states.tsx`.
Gap: `app/global-not-found.tsx` absent (Next 15.5 experimental); `app/not-found.tsx` is the effective global 404.

## C02 Fail-open vs fail-closed — PARTIAL (Medium)
Entitlements, cron auth (`lib/cron.ts` rejects when secret unset), layouts fail closed. Middleware auth-server errors and logout now fail closed (fixed earlier). Remaining fail-open: rate-limit Redis outage falls back to memory (documented, not an auth boundary) and `check-email` returns `exists:false` on lookup failure (documented).

## C03 Logs free of PII — PARTIAL (Medium)
No direct PII. But several sites log full error objects that can carry user ids/endpoints: `lib/actions/practice.ts:596,604,639`, `lib/actions/lessons.ts:818,826`, `lib/actions/recall.ts:152`, `lib/actions/onboarding.ts:184`, `app/api/auth/confirm/route.ts:29`, `app/auth/callback/route.ts:71`. `lib/error-log.ts` is the safe path but is not used everywhere.

## C04 External timeouts — PARTIAL (Medium)
Paystack 15s AbortController; Resend 10s via `withTimeout`; Upstash 1 retry + 2s signal. Supabase clients and web-push have no explicit timeout.

## C05 Error reporting / health — PASS
`lib/error-report.ts`, `/api/report-error` (throttled), `/api/health`, cron failure reporting, error boundaries wired.

## C06 Unhandled rejections / cleanup — PARTIAL (Low)
Main hot paths clean. Admin `void load()/remove()` chains (`cycles-manager.tsx:45,131`, `screenings-manager.tsx`, `meta-form.tsx`) and `void poll()` in payment callback can reject unhandled.

## G01 Secrets/gitignore — PASS
`.env*` ignored except `.env.example`; no secrets in history; build output ignored.

## G02 typecheck/build — PASS
`tsc --noEmit` exit 0. `next build` exit 0 (warnings: `/learn` prerender retry, Edge Supabase warning).

## G03 Supabase Site URL / redirect allowlist — NOT VERIFIABLE (dashboard)
Direct testing earlier: OAuth authorize 302 for both www and non-www callback; admin `generate_link` returned `redirect_to: https://propeida.online` (non-www) while canonical is www — mismatch to fix in dashboard.

## G04 SMTP/SPF/DKIM/DMARC — PARTIAL (corrected)
DKIM, SPF (`send.propeida.online`), MX and DMARC `p=none` all present. Spam placement is reputation, not DNS. Custom SMTP is configured (Resend).

## G05 Auth email rate limit — NOT VERIFIABLE (dashboard)
Public settings endpoint omits it. Three consecutive signups succeeded, so the 2/hour built-in limit is no longer active.

## G06 Monitoring — PARTIAL (Medium)
GA4 + custom events + weekly CI + new error reporting/health. No uptime monitor or alerting rule configured externally; privacy copy fixed.

## F05 Migrations — PASS
143 local = 143 applied, 0 unregistered, 0 duplicate versions.

## F06 Privacy copy — PASS
Now discloses GA4 and real local-storage uses.

## Summary

| Item | Status |
|---|---|
| C01 | PARTIAL (Low) |
| C02 | PARTIAL (Medium) |
| C03 | PARTIAL (Medium) |
| C04 | PARTIAL (Medium) |
| C05 | PASS |
| C06 | PARTIAL (Low) |
| G01 | PASS |
| G02 | PASS |
| G03 | NOT VERIFIABLE |
| G04 | PARTIAL |
| G05 | NOT VERIFIABLE |
| G06 | PARTIAL (Medium) |
| F05 | PASS |
| F06 | PASS |