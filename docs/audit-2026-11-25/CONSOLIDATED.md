# Production bug audit — consolidated (2026-11-25)

> **Status note (2026-11-26):** the findings below are the audit as it was on 25 Nov. The action lists are historical; see [Current status](#current-status-2026-11-26) at the bottom for what has since been fixed and what remains open.

Checklist: [docs/audit-checklist-2026-11-25.md](../audit-checklist-2026-11-25.md)
Detailed reports: `security.md`, `data-integrity.md`, `reliability-config.md`, `performance.md`, `ux-content.md`.

Method: researched current bug-hunting checklists (OWASP Top 10:2025, OWASP API Top 10:2023, OWASP Business Logic cheat sheet, Next.js/OWASP Next.js, Supabase security, 2026 web-app audit guides), wrote a 54-item checklist, then audited every item with file:line evidence. No code changed.

## Tally

| Section | PASS | FAIL | PARTIAL | NOT VERIFIABLE |
|---|---|---|---|---|
| A Security (18) | 11 | 0 | 7 | 0 |
| B Data (8) | 1 | 3 | 4 | 0 |
| C/G Reliability (12) | 3 | 0 | 7 | 2 |
| D Performance (6) | 2 | 0 | 4 | 0 |
| E/F UX/content (10) | 2 | 0 | 7 | 1 |
| **Total** | **19** | **3** | **29** | **3** |

## P0 — fix now

1. **A05 open redirect** — three `safeNext()` copies accept `/\`. Replace with `safeInternalPath`.
2. **A02/A06 anonymous IDOR** — NULL `auth.uid()` bypass + anon EXECUTE on `get_dashboard_data`/`update_streak`/`ensure_exam_free_pool`; `getLessonByPath` paywall only when a user exists.
3. **B01 webhook replay** — `process_payment` re-arms `expires_at` from `now()`; webhook has no already-successful guard.
4. **B03 refund atomicity** — two writes; retry short-circuits on `status='refunded'`.
5. **B07 answer loss** — `/api/answers/sync` returns ok on total failure; client clears answers.
6. **F02 raw tokens** — `lesson-player.tsx:220` and results fields.

## P1

- **D01 KaTeX** 3.8 MB lesson chunk; lazy-load + CSS fallback + visual sweep.
- **A18** upgrade Next to 15.5.29.
- **C03/C04/C05** fail-closed middleware, log redaction, external timeouts, admin 401 masking, error reporting.
- **B02** mock-event unique index; practice completion row lock.
- **F01** physics em/en dashes.
- **F03** trust-metric owner decision.

## P2 (selected)

Unbounded admin lists; raw `<img>` and duplicate assets; `aria-pressed`; 320/360px check; duplicate auth exits; `global-not-found`; uncleaned admin timers; unused anon grants; Origin checks.

## Corrections applied during consolidation

- **G04 SPF:** the reliability report said SPF/MX missing. Direct DNS shows both on `send.propeida.online` (where Resend requires them), plus DKIM and DMARC. Spam placement is reputation, not DNS.
- **G03/G05:** live endpoint probes added (redirect allowlist accepts www and non-www; Site URL is non-www; built-in 2/hour limit no longer active).

## Recommended order

1. A05, A02/A06, A02 paywall (security)
2. B01, B03, B07 (money/data)
3. F02, D01 (user-facing + performance)
4. A18, C03–C05, B02
5. F01, F03 decision, P2 sweep

---

## Current status (2026-11-26)

The P0/P1 items above have been addressed in code. This section records the outcome; the historical findings are left intact above.

### Closed

| Item | Fix commit | Verification |
|---|---|---|
| A05 open redirect | `6cf732b` | `/\evil.com` falls back to `/home`; all callers use `safeInternalPath` |
| A02 anonymous IDOR + paywall | `cfed27e` | five RPCs guarded, anon grants revoked; direct call: first lesson `gated:false`, later `gated:true` |
| B01 webhook replay | `6cf732b` | already-successful early return + conditional entitlement upsert |
| B03 refund atomicity | `6cf732b` | `process_refund` single transaction; retry repairs partial state |
| B07 answer loss | `6cf732b` | sync reports per-item failures; mock submit blocks when answers are dirty |
| F02 raw tokens (results, topic descriptions, tables, passages, English blocks) | `6cf732b` | browser-verified stacking, no literal tokens |
| D01 KaTeX payload | `134dd7d` | 258 KB on-demand chunk; lesson initial files carry only the 26 KB CSS |
| A18 Next.js patch | `57c1fc3` | 15.5.29; `npm audit --omit=dev` 0 vulnerabilities |
| C03/C04/C05 reliability | `e4a51c6` | redacted logging, 10s Resend bound, 1 retry + 2s Upstash signal, admin 401/500 split |
| B02 mock-event and completion races | `09d528e` | unique index + row-locked completion RPC |
| F01 physics em/en dashes | `558d79a` | 789 em + 75 en replaced; seeded 33 lessons; live blocks 0 dashes |
| G06 error reporting + privacy copy | `79487fb` | `/api/report-error`, `/api/health`, throttled alerts, honest cookie disclosure |
| F05 migration ledger | `9bbf779` | 143 local = 143 applied, 0 duplicates, replay-safe |
| F02 raw inline-check options | `001966e` | 128 authored options had tokens; now routed through `MathText`, browser-verified |
| Login/onboarding gate race | `472da5a` | hard navigation after login; fresh user → `/onboarding`, completed → `/home` |

An additional user-facing bug found after the audit: the loading mascot was below the fold on tablet/desktop (`babe2f2`).

### Still open

- **F03 trust metrics** — `lib/site-config.ts` still serves `4,600+`, `3,500+`, `1,070+`, `20+` through `/api/stats`. Requires the owner's decision; deliberately untouched.
- **P2 hardening** — unbounded admin lists, raw `<img>` and duplicate assets, `aria-pressed` on mock options, 320/360px overflow check, duplicate auth exits, `global-not-found`, uncleaned admin timers, unused anon SELECT grants, Origin/Sec-Fetch checks.
- **B02 residual** — free-mock allowance and session creation are still check-then-act (see `data-integrity.md` race table).
- **B07 residual** — some mastery/streak and admin `void` writes are still best-effort, though they now log.
- **NOT VERIFIABLE** — Supabase Site URL is confirmed as the non-www host (dashboard fix pending); auth email rate limit and OTP expiry need dashboard access; runtime 320/360px and data-driven slug checks not run.

Deployment: `X-App-Commit` reaches the latest deployed commit; the most recent fixes land on the next Vercel deploy.