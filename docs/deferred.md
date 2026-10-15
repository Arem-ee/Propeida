# Deferred work ledger

Everything deliberately postponed, with its unblock condition. Nothing here is forgotten — items leave this list only by being built or explicitly rejected. Updated 2026-10-15.

## Content (authoring labor, not code)

- [ ] **JAMB bank**: English → Maths → electives → Lekki Headmaster set. Unblocks: JAMB mocks, cohort countdown meaning, exam-date scheduling relevance.
- [ ] **JAMB core-booklet hand-rescue pile** (before banking from core booklets): Bio 5 polish items (2000 Q10 blob, 1994 Q30 data, 1992 Q40 D / 1998 Q35 D tails) + Chem list in `content-folder/_work/chem-rescue-notes.md` (1983 Q16 list misparse, 2002 Q1 watermark dup, 2003 Q1/Q9, 1990 Q2 figure flag, missing-number spot-checks).
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
