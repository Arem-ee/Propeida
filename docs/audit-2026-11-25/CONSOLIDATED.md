# Production bug audit — consolidated (2026-11-25)

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