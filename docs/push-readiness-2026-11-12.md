# Push-readiness audit — codebase to production (2026-11-12)

**Scope:** what stands between this repo and a public launch, and what
"pushing live" actually means. Nothing has been pushed or deployed.
**Method:** fresh build/lint/typecheck runs (2026-11-12), env inventory by
name, linkage inspection, working-tree inventory, migration inventory,
policy/IP review. No DB writes; no deploys; no secrets printed.

## The short answer

There is **no code defect standing between this repo and a push.** The app
builds clean, typechecks strict, has 0 lint errors, 0 known CVEs
(prod deps), a live Supabase project with all 118 migrations applied
(including the two content-access ones from today), and a passing
`verify:security` (117/117). The blockers are all process: **today's work
is uncommitted, Vercel's env is unverified, and the licensing exposure on
past-paper content was never closed.**

## Verified green (this session)

| Item | Evidence |
|---|---|
| `npm run build` | EXIT 0 — all routes build; middleware 90.9 kB |
| `npm run typecheck` (strict) | clean |
| `npm run lint` | 0 errors (46 warnings, pre-existing) |
| `npm audit --omit=dev` | 0 vulnerabilities |
| Phase 1–4 security regression (live linked project) | 25 + 28 + 40 + 24 = **117/0** |
| Migrations applied remotely | `20261112000001_content_access_rls`, `20261112000002_question_pool_check` — local env and CLI both resolve to **one and the same Supabase project** (verified by ref comparison) |
| Headline new gates | Anonymous users read zero lessons/blocks/questions; locked free user gets 9 free lessons + national-bank practice; school banks require PUTME Pro; paywall verified end-to-end with disposable users |
| `.gitignore` | past-paper PDFs/dumps excluded; `english-jamb-bank-expanded.json` (the unpublished bank) excluded |
| Preview route | noindex'd, published-only, anonymous reads nothing post-migration |

## Red blockers (in order)

1. **Nothing from the last 4 weeks is committed.** Working tree =
   `M 91 / ?? 113` (untracked) files; HEAD (`8ece2ff`) predates today's
   hardening. Pushing `main` today ships the **pre-audit code**: the open
   redirect, the wide-open anon lesson read, the caching service worker,
   the unauthenticated welcome route, the un-parameterised seed scripts —
   all live again. **Commit the audited tree first, then push.**
   - Commit set = `middleware.ts`, `lib/entitlements.ts`,
     `lib/safe-redirect.ts` (new), `lib/cron.ts`, `lib/actions/*`,
     `lib/emails/send.ts`, `lib/paystack.ts`, `next.config.ts` (unchanged,
     re-verified), `public/sw.js`, `components/seo/faq-json-ld.tsx`,
     `app/(auth)/login/page.tsx`, `app/(app)/learn/[subject]/[slug]/page.tsx`,
     `app/api/**` (auth/welcome, paystack/webhook, admin/questions/upload,
     push/subscribe, cron/cohort-report), `app/preview/lesson-db/**`,
     `middleware.ts`, `supabase/migrations/20261112000001_*` and
     `20261112000002_*`, `scripts/seed-english-jamb-bank.mjs`,
     `scripts/seed-maths-jamb-bank.mjs`,
     `scripts/check-maths-jamb-bank-extension.mjs`,
     `scripts/merge-maths-jamb-bank-extension.mjs`, `.gitignore`,
     `docs/production-hardening-2026-11-12.md`,
     `docs/english-bank-expanded-audit-2026-11-12.md`,
     `docs/english-skill-mapping.md`, `docs/content-inventory-2026-11-12.md`,
     `docs/content-audit.md`.
   - Also commit or deliberately leave out the content-folder banks at
     your discretion (`maths-jamb-bank-extension.json` is Propeida's own
     work and belongs in the repo; the expanded English bank stays out).

2. **Vercel env is unverified and the local env shows the wrong shape for
   a live launch.**
   - Local `PAYSTACK_SECRET_KEY` is a **test** key (`sk_test_…`); local
     public key is not `pk_live_…`. Local `NEXT_PUBLIC_BASE_URL` is not
     https. If Vercel carries the same values, checkout and redirects break
     for real customers. Vercel env can't be read from this machine — verify
     in the Vercel dashboard: `NEXT_PUBLIC_SUPABASE_URL`, `ANON_KEY`,
     `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`,
     `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`, `PAYSTACK_SECRET_KEY`,
     `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`,
     `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`,
     `NEXT_PUBLIC_ANALYTICS_ENABLED`.
   - `CRON_SECRET` is **absent locally** and both Vercel crons
     (`/api/cron/cohort-report` Sundays 17:00 UTC, `/api/cron/squad-nudge`
     17:30) require `Authorization: Bearer $CRON_SECRET`, failing closed.
     If Vercel doesn't define it, both crons 401 forever, silently. Set it
     on Vercel or accept that the weekly digest never sends.
   - `vercel.json` schedules two crons; only matching secrets make them
     functional.

3. **Licensing exposure on live content — an existing condition this push
   does not create, but a public launch must square away.**
   The production database currently serves the published 297-question
   English bank, which per `docs/content-audit.md` contains **160 actual
   JAMB 2015 and 2018 past-paper questions**, publicly readable by any
   signed-up free user (national funnel — intentional product decision)
   and visible to the public during the free 24h trial at signup.
   JAMB's past questions are JAMB's IP. Options: (a) IP counsel reviews/licenses;
   (b) replace past-paper items with original items (the 4,090 cannot help —
   same problem, worse); (c) ship silently at your own risk. **This one is
   yours to decide; it is not something the push itself fixes.**

4. **`supabase link` target vs production** — local `.env` and the CLI
   link resolve to the **same** project, and today's migrations landed
   there. If the linked project is production, fine — the push is aligned.
   If it's staging, production is missing both content-access migrations:
   apply them there before the push, or the code deploy ships while the
   data layer stays open. Confirm with `supabase project list` / the
   dashboard.

5. **Pin Node.** No `engines` in `package.json`; CI uses Node 22, local
   dev runs Node 24 without error. Add `"engines": { "node": ">=22 <25" }`
   for predictable Vercel builds.

6. **Reconciliation SQL never ran against these two migrations.**
   `supabase/verification/verify_reconciliation.sql` asserts policy shape;
   it expects ≥37 passing assertions and is not installed locally. Run it in
   CI (it's wired into `.github/workflows/security.yml` weekly, or via the
   SQL editor) and check that the new `questions`/`lessons` policies don't
   trip its assertions.

## Post-push checklist (once you push)

1. `vercel` dashboard → confirm the deployment is READY and production
   alias points at the new SHA (header `X-App-Commit` will match the push).
2. Smoke: `/` (landing), `/signup`, `/login`, then exactly one paid-path
   probe — signup → trial auto-grant shows Pro badge → one mock starts →
   timer/orientation sane → results page renders.
3. Free-tier probe in prod: create disposable user → confirm 9 free lessons,
   0 school-bank questions, non-first lesson shows the paywall.
   (Repeat the `rls-probe` steps, or call me.)
4. Paystack: real-card smoke of ₦1 (PUTME monthly) if smoke-charging is
   acceptable, else Paystack dashboard test-mode verification → webhook
   200 → entitlement row appears.
5. Crons: trigger one manually or wait for Sunday 17:00 UTC; confirm the
   email report arrives (only if `CRON_SECRET` is set).
6. Watch Vercel error rate for 24 h; keep the option to roll back one click.
7. Decide the licensing path for the 297-question bank; the expanded bank
   stays unpublished regardless.

## Push command sketch (you run it, not me)

```powershell
# 1. stage the audited tree (explicit paths beat `git add -A`)
git add middleware.ts lib app components public supabase scripts docs .gitignore package.json
# 2. verify the tree builds from a clean checkout before pushing
git stash --keep-index; npm ci; npm run build   # or trust the working-copy build
git stash pop
git commit -m "Production hardening: paywall at data layer, security fixes, maths extension"
# 3. push
git push origin main
# 4. watch the Vercel deployment; then run the post-push checklist
```
