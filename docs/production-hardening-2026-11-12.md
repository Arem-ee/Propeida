# Production hardening — 2026-11-12

Follow-up to `docs/content-inventory-2026-11-12.md` and the 2026-11-12
audit (user directive: "Propeida is literally not free — fix all of them").
Every item below is fixed in code **except the SQL migration, which ships
as a file and must be applied by a human** (§ migration). Build/typecheck/
lint all pass; see § verification.

## Fixed in code (this session)

| # | Finding | Severity | Fix |
|---|---|---|---|
| H1 | Paying PUTME-yearly customers locked out of school banks (`hasExamAccess` checked only `putme_pro`) | High | `lib/entitlements.ts` — `PRODUCT_PUTME = ['putme_pro', 'putme_pro_yearly']` |
| H2 | Published lessons + blocks anonymously readable via PostgREST ("learning has no gates" RLS vs. Pro paywall) | High | App: lesson reads moved to service-role client inside identity-proven action (`getLessonByPath`, gate lists, `getNextLessonInCurriculum`); paywalled deep links behave exactly as before. Data layer: new migration (§) |
| M1 | Open redirect `/login?redirect=/\evil.com` | Medium | New `lib/safe-redirect.ts` (rejects backslashes/control chars); used in `middleware.ts` and `app/(auth)/login/page.tsx` |
| M2 | Service worker cached authenticated data (Supabase REST, own `/api/*`, navigations) into Cache Storage | Medium | `public/sw.js` — Supabase and `/api/*` are network-only; navigations stream uncached (fallback `/offline`); static hashed assets unchanged; cache bumped to `propeida-v3` (activate purges old caches) |
| M3 | School banks opened with self-service `user_exam_access` (any signup); no `user_free_questions` pool branch (free practice on non-locked exams read 0 rows) | Medium | New migration (§): school bank requires PUTME entitlement (mirrors `hasExamAccess`); pool branch extended; national-bank read kept deliberately (free funnel, 2026-08-01 design decision — **do not remove without a locked-pool redesign**) |
| M4 | Middleware trusted a cookie-shape heuristic (`getSession()`, no signature verification); `/recall`, `/squad`, `/diagnostic` unprotected | Medium | `middleware.ts` — verified `getUser()`; prefixes extended; matcher synced. (Data paths were always enforced server-side; middleware is now honest UX gating) |
| M5 | `/preview/lesson-db/[subject]/[slug]` indexable, no published filter | Medium | Added `robots: noindex` metadata + `status='published'` filter |
| — | `/api/auth/welcome` sent welcome email for any attacker-chosen user id (existence oracle + spam/cost) | Low | Route now requires a session and sends only to the caller (`auth.getUser()`); 401 otherwise |
| — | Cron secret compared with `===` | Low | `lib/cron.ts` — constant-time `timingSafeEqual` |
| — | Paystack webhook read raw body before any size guard | Low | 413 when `content-length > 64 KB` |
| — | Welcome-email logs recorded PII (user id / email) | Low | `lib/emails/send.ts` — ids/emails stripped from log lines |
| — | `faq-json-ld` embedded unescaped `JSON.stringify` (theoretical `</script>` breakout) | Low | Escapes `<` as `\u003c` |
| — | Admin CSV upload: no file-size/row limits; `requireAdmin` failure surfaced as 500 | Low | 10 files / 2 MB each / 2,000 rows per file; auth failure → 401 |
| — | Referral claim race (profile `referred_by` updated before unique-constrained insert; concurrent claims 500 after mutating profile) | Low | `lib/actions/referral.ts` — insert-first; 23505 → clean error; profile update rolls back referral row on failure |
| — | Cron cohort report dropped everyone past user #1,000 | Low | `listUsers` now paginates (≤20 pages × 1000) |
| — | `web-push` endpoint never validated (server-side POST target) | Low | `/api/push/subscribe` — `https:` + FCM/Mozilla/Apple/WNS host allowlist |
| — | Dead support-payment code path (`/support` redirected to pricing) | Low | `initializeSupportTransaction` + `SUPPORT_*` constants removed |
| — | Onboarding diagnostic bypassed (direct `questions` count/RPC as free-tier gate) | Low | `lib/actions/onboarding.ts` — reads through service role (never answers) |
| — | JAMB past-paper PDFs (15), parsed dumps, `_work` solve dumps, `_dump` tracked in git (~35 MB) | IP risk | `git rm --cached`d (index, not disk); `.gitignore` now covers them; syllabus PDFs kept |

Deliberately **not** changed (with reasons):
- National question-bank read for authenticated users — load-bearing free-tier funnel; see M3.
- CSP `script-src 'unsafe-inline'` — required for Next boot without nonces.
- `X-App-Commit` header — informational build SHA.
- Rate-limiter fails open on Redis outage (documented best-effort).
- `activeIds.slice(0, 1000)` in cohort report — send cap is 90/day anyway.
- Supabase project settings (auth allowlist, SMTP, CAPTCHA) — outside the repo.

## § Migration — applied 2026-11-12

`supabase/migrations/20261112000001_content_access_rls.sql` —
`supabase db push --linked` confirmed it (only pending migration;
`remote: "20261112000001"` afterwards). It creates
`has_active_entitlement()` / `is_free_lesson()` / `lesson_readable()`,
re-creates the `lessons`/`lesson_blocks` policies (entitled learners or
free first lesson only; anon gets nothing), re-creates the `questions`
policy (national kept; school exams now require PUTME entitlement) and
revokes anon SELECT on the three tables.

**Self-inflicted incident, fixed same-session:** 20261112000001's questions
policy referenced `user_free_questions`, which phase-2 deliberately locked
down for authenticated. The missing table grant failed every RLS evaluation
with 42501, so authenticated question reads returned **403 for everyone**
(free users included — the free practice/onboarding path was dead on the
live DB for ~10 minutes). Diagnosed via a disposable-user probe, fixed by
`20261112000002_question_pool_check.sql` (moves both pool lookups behind a
security-definer helper `is_own_free_pool_question`). Applied via
`supabase db push --linked --yes`; PostgREST re-verified: locked free user
reads 521 national JAMB questions, 0 school-bank questions, 9 free lessons;
anonymous gets 401/403 on everything.

**Verified after apply** (disposable users, all cleaned up):
- anonymous: questions/lessons/blocks → denied (401/403)
- 24h auto-trial user (signup grant): full access (by design)
- locked free user (auto-trial entitlements purged): 9 lessons (one per
  subject), 0 school questions, 521 national questions — paywall and free
  funnel both correct
- new content-gate checks pass as written

**Lesson-gate caveat confirmed as designed:** every new signup gets a 24h
`putme_pro` + `jamb_pro` referral_trial entitlement (auto-granted at
signup) — i.e. signup ⇒ 24h of full access, then the paywall. The
`has_active_entitlement()` behaviour above is correct for that design.

## Verification

- `npm run typecheck` — clean (strict).
- `npm run lint` — 0 errors (46 warnings, all pre-existing unused-var noise).
- `npm run build` — green.
- `npm audit --omit=dev` — 0 vulnerabilities.
- `npm run verify:security` (ran live against the linked project after the
  migrations were applied, 2026-11-12) — **phase 1: 25/25, phase 2: 28/28,
  phase 3: 40/0, phase 4: 24/0 → 117/117 checks pass, 0 failures.**
- `supabase/verification/verify_reconciliation.sql` — **not run**: needs
  `psql` (not installed locally) or CI (`.github/workflows/security.yml`
  runs it weekly against the linked project; CI also needs the assertions
  re-checked against the two new migrations since it asserts policy shape).
- Committed? **No** — nothing committed. Staged deletions from `git rm
  --cached` are intentionally staged for the next commit. Git history still
  contains the past-paper PDFs; a purge requires history rewrite +
  force-push, which was **not** done.

## Still open (decisions/approvals)

1. ~~Apply the migration + re-run verification~~ — done 2026-11-12
   (migrations `20261112000001` + `20261112000002` applied to the linked
   project; `verify:security` 117/117 green). Remaining: re-run
   `verify_reconciliation.sql` in CI (needs `psql`; not available locally).
2. Past-paper licensing review for any public release — content stays
   internal until IP counsel signs off.
3. National-bank visibility is the 2026-08-01 design decision; if the free
   funnel is to be locked to the 50-question pool instead, that is a product
   decision + redesign, not a bugfix.
4. English expanded bank (4,090) remains internal-review staged material;
   Maths extension (125) remains unseeded pending your sign-off.
5. CI `security.yml` runs `npm run verify:security` weekly — keep green.
