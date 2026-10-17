# Deferred work ledger

Everything deliberately postponed, with its unblock condition. Nothing here is forgotten — items leave this list only by being built or explicitly rejected. Updated 2026-10-15.

## Content (authoring labor, not code)

- [ ] **JAMB bank**: English → Maths → electives → Lekki Headmaster set. Unblocks: JAMB mocks, cohort countdown meaning, exam-date scheduling relevance.
- [ ] **JAMB core-booklet hand-rescue pile** (before banking from core booklets): Bio 5 polish items (2000 Q10 blob, 1994 Q30 data, 1992 Q40 D / 1998 Q35 D tails) + Chem list in `content-folder/_work/chem-rescue-notes.md` (1983 Q16 list misparse, 2002 Q1 watermark dup, 2003 Q1/Q9, 1990 Q2 figure flag, missing-number spot-checks) + Physics list in `content-folder/_work/phys-rescue-notes.md` (8 banner-leak tails incl. 2004 Q7 stem fragment, 16 missing numbers, 1984 fragment renumber, 1992 Q1×3 relabel, 81 orphans, 1993 Q26 options collapsed, 1991 Q9 π glyph, 2004 Q2/Q13 glitches) + Commerce list in `content-folder/_work/com-rescue-notes.md` (2001 Q11 orphan → recreate as 2002 Q11; overwritten 2002 Q10 options; fragment-prefix / bare-EOL-marker / no-space-fusion tails across 1994–2004) + CRK list in `content-folder/_work/crk-rescue-notes.md` (1989 double-print collapse 100→50; 1992 Q22/Q23 comma-marker overwrite; 1992 Q40 `4.0` renumber; 1993 Q17 missing; 2001 Q22 missing + Q12 print `E.`→D; 2002 Q1/Q2/Q7 damage; 2003 Q1 displaced stem + Q2 double-`C.` + Q11 `B`/`C` both `7` + Q37 no options; 2004 Q26/Q27 displaced; 61 fused-marker + 49 fragment-prefix + 27 stem-embedded option recoveries; 3 orphans) + Economics list in `content-folder/_work/econ-rescue-notes.md` (re-parse 968→1055 rows, orphans 82→23; 67 fused-option + 36 fragment-prefix + 77 genuine-loss; 1984 Q7 cost-table rows mis-numbered as Q1/2/3; 5 dropped junk-number blocks incl. 3 real lost Qs; missing 1987{26,29} 1992{5,12} 1993{19,39} 1998{43} 1999{12,47} 2000{15} 2002{36} 2004{9}; needs a dedicated sub-column-splitting parser pass — bigger than CRK) + Government list in `content-folder/_work/gov-rescue-notes.md` (re-parse 973→1048 rows; baseline was mis-sectioned — phantom 1953 section of 56 rows, 1990/1993/1998 empty, 1992=85/1997=90 over-full → now 21 clean sections 1983–2004; **parser fix: bare-year guard** — a content line containing a year no longer starts a phantom section; root cause `B London conference of 1953` / `the Republican Constitution in October 1963` split 1989 into 1953/1963, restored to 50 Qs; 107 fragment-prefix + 51 fused + 57 genuine-loss + 3 orphans; missing 1985{6} 1986{27} 1992{19}; dup 1989:41; 2 junk blocks 1997; needs the same sub-column option-splitting pass as Economics). + Mathematics list in `content-folder/_work/maths-rescue-notes.md` (re-parse 1010→1079 rows; baseline mis-sectioned — 2003=86/2004=0 → now 21 clean sections; **figure-heavy**: 72 orphans + 36 dropped junk-number blocks (real stems merged with figure values, i.e. lost questions) + 38 dups; 35 fused + 15 fragment-prefix + 40 genuine-loss on numeric options; superscript/fraction glyph garble; needs a figure-aware stem-binding + table-suppression pass) + Accounts list in `content-folder/_work/acc-rescue-notes.md` (re-parse 366→499 rows; **parser fix: out-of-range data-reference salvage** — Accounts 2001 mis-prints `questions 241 and 42` for `41 and 42`, a wrapped ref that looked like `questions 241` and set a dangling data-collect swallowing Q41–50, then discarded them at the next section; now the impossible number is salvaged to its last two digits; 2001 Q41–50 restored, all other booklets byte-identical; 27 fused + 12 fragment-prefix + 27 genuine-loss + 16 orphans; doubled 2002 section from a watermark-fragment banner; 8 dropped junk-number stems; needs same-year section-merge + table suppression).
- [x] **JAMB no-space option-fusion parser pass (2026-10-16)**: `split_fused()`/`put_option()` in `scripts/jamb-parse.py` re-segment packed option lines (`A. Fashion.B. Innovation.`, `...limbs C. development...`, and fused continuation lines) at the expected next letter. Guarded so acronyms (`N.P.C.`, `A.C.`, `AB.`) never split — a marker must follow a lower-case letter/digit, or a period that itself follows one. Split-seeded slots append instead of overwriting (recovers scrambled blocks, e.g. Bio 1999 Q11 → C "development of long hind limbs"). Re-parsed all 9 core booklets: short-option rows **1319 → 730** (~589 repaired); every changed row gained options, none lost, zero content loss. New baseline (rows/short): Bio 1058/92, Chem 1063/91, Commerce 500/9, CRK 1096/57, Econ 1055/115, Gov 1048/78, Maths 1079/118, Phys 1063/112, Accounts 499/55. Remaining fusion classes (uppercase-preceded glued markers, bare marker without period, fragment-prefix) stay in the hand-rescue pile above.
- [ ] **WAEC bank**: content import only; code already exam-agnostic.
- [ ] **Question→topic mappings**: grow via admin tagging; unlock quality for interleaving + prerequisite routing at volume.
- [ ] **Misconception maps**: grow via admin authoring; shared-struggle activates per question at ≥20 picks.
- [x] **Worked examples / vocab beyond seed (wave 1, 2026-10-14)**: probability with-replacement (fraction-bars visuals) + trig angle-of-elevation (plane visual) as second worked blocks — renderer now serves full worked sets; 12-word vocab expansion (phrasal verbs + idioms, merged word lists). Comprehension wave 2: 3 passages + 6 minimal pairs live.
- [ ] **Worked examples wave 2**: surds/indices/quadratics second problems; concord/parts-of-speech minimal-pair coverage.
- [ ] **Piano-tense explanation fix**: claims "has practiced" is present perfect continuous — it is present perfect simple. Needs content review, not code.
- [ ] **IBASS manual extraction**: verbatim topic tables (Biology, Government, Literature, CRS/IRS, Geography), canonical 2026 Literature list, 60/40/40/40 bulletin line, scoring formula, negative-marking policy. See docs §12 🔴 list.
- [ ] **Verified JAMB 2027 dates**: March 15–25 (FG proposed) vs April 16–25 (reported) still disputed; countdowns stay honest until a bulletin confirms.

## Engine follow-ups (code, no content dependency)

- [ ] **Exam-date-anchored scheduling**: gaps as function of days-to-exam (Cepeda mandate). Blocked on: verified dates above.
- [ ] **Prerequisite consumption**: route repeats down `topic_prerequisites` chains. Needs mapping volume first.
- [ ] **Interleaving**: mixed-topic sets after basics exist. Needs mapping volume first.
- [x] **`session_answers.misconception_code`**: recorded at write time by `record_session_answer` (mapped picks only), backfilled for history; practice feedback now shows repeat counts and routes repeats to root-fix via the shared `findPrerequisiteRepair` helper (lessons refactored onto it).
- [x] **Repair-note links in practice feedback**: already shipped earlier (misconception card + shared-struggle + repair link in the player and results review).
- [ ] **Streak redefinition**: planned actions, not logins (behavior change — decide + migrate carefully).
- [ ] **Bulk misconception import**: per-distractor judgment can't batch safely; revisit only with a review queue.
- [ ] **Bulk block operations** in the lesson editor (duplicate lesson, move blocks across lessons).
- [x] **Mock calculator affordance**: SafeCalculator already in the mock player (safe arithmetic, no eval, ÷0 handling); fixed silent second-decimal-point misparse.
- [x] **Question editorial workflow**: `status` (draft/in_review/published/rejected) + `verified_state` (unverified 🔴/source_cited 🔶/human_verified ✅) on questions; `get_session_questions`, `ensure_free_question_pool`, and all direct selection queries serve published-only (probe-verified); publish gate refuses unverified items; admin list filter + `/admin/questions/review` queue + edit-form fields. Existing bank backfilled published/human_verified.
- [x] **Question editorial follow-ups**: bulk publish from the queue (batch refused with names if any item is unverified — gate holds under volume); `question_reviews` append-only trail (who/when/state/note) with backfill, shown in queue + edit form.
- [ ] **Asset storage + signed delivery**: needed when first instructional media exists.
- [ ] **Realtime presence heartbeat**: only if weekly aggregates ever feel insufficient.
- [ ] **AI coach**: server gateway, closed actions, quotas, evals — after non-AI retention is proven AND self-hosting is affordable. Suggest endpoint drafts against the registry when that day comes.
- [ ] **Classifier eval set**: 50 hand-labeled questions to measure any future model against.

## Belonging + growth (later phases)

- [ ] **Witnessed achievement**: opt-in learner stories (phase two, consent-gated).
- [ ] **Cooperative challenges + seasonal mock weeks**: needs cohort volume.
- [ ] **Peer help surface**: moderated, reportable, off by default. Never unmoderated DMs.
- [ ] **Post-UTME target UI**: tables + UNILORIN 2025 row live; student-facing school targeting arrives with the path work.
- [ ] **Downloads offline packs**: meter + install prompt live; subject packs need a sync design.
- [ ] **Evaluation cohort runs**: 7/21-day delayed recall study per docs §10 (process + instrumentation, not just code).

## Hygiene (done 2026-10-14; keep at zero)

- [x] Dead `get_leaderboard` RPC (+ rank/update/recompute fns, trigger, `public_leaderboard_top10` view, table) and `explore_interactions` dropped.
- [x] `profiles.avatar_index` dropped (picker removed).
- [x] Daily-question engine dropped entirely (tables + 3 RPCs + dashboard block + bulk-delete cascade): product forbids daily questions, and no UI rendered it. `get_platform_stats` active-leg is completed-sessions only.
- [x] `tsconfig.tsbuildinfo` untracked (gitignored); `.landing-source/` untracked but kept on disk (designer material, static site lives in `public/landing`).
- [x] Verification script updated to the post-drop inventory.
- [ ] Campaign system: live and functional (practice gating, admin start/end) — left alone; reconcile only if the unlock model changes.
