# Deferred work ledger

Everything deliberately postponed, with its unblock condition. Nothing here is forgotten — items leave this list only by being built or explicitly rejected. Updated 2026-10-12.

## Content (authoring labor, not code)

- [ ] **JAMB bank**: English → Maths → electives → Lekki Headmaster set. Unblocks: JAMB mocks, cohort countdown meaning, exam-date scheduling relevance.
- [ ] **WAEC bank**: content import only; code already exam-agnostic.
- [ ] **Question→topic mappings**: grow via admin tagging; unlock quality for interleaving + prerequisite routing at volume.
- [ ] **Misconception maps**: grow via admin authoring; shared-struggle activates per question at ≥20 picks.
- [ ] **Worked examples / vocab beyond seed**: trig/probability accuracy check against notes; more English vocab sets; comprehension evidence-tapping; minimal-pair grammar; interactive maths diagrams.
- [ ] **Piano-tense explanation fix**: claims "has practiced" is present perfect continuous — it is present perfect simple. Needs content review, not code.
- [ ] **IBASS manual extraction**: verbatim topic tables (Biology, Government, Literature, CRS/IRS, Geography), canonical 2026 Literature list, 60/40/40/40 bulletin line, scoring formula, negative-marking policy. See docs §12 🔴 list.
- [ ] **Verified JAMB 2027 dates**: March 15–25 (FG proposed) vs April 16–25 (reported) still disputed; countdowns stay honest until a bulletin confirms.

## Engine follow-ups (code, no content dependency)

- [ ] **Exam-date-anchored scheduling**: gaps as function of days-to-exam (Cepeda mandate). Blocked on: verified dates above.
- [ ] **Prerequisite consumption**: route repeats down `topic_prerequisites` chains. Needs mapping volume first.
- [ ] **Interleaving**: mixed-topic sets after basics exist. Needs mapping volume first.
- [ ] **`session_answers.misconception_code`**: practice-path repeat detection needs an RPC change; lessons already track codes.
- [ ] **Repair-note links in practice feedback**: lesson feedback has them; practice feedback doesn't yet.
- [ ] **Streak redefinition**: planned actions, not logins (behavior change — decide + migrate carefully).
- [ ] **Bulk misconception import**: per-distractor judgment can't batch safely; revisit only with a review queue.
- [ ] **Bulk block operations** in the lesson editor (duplicate lesson, move blocks across lessons).
- [ ] **Mock calculator affordance**: docs demand on-screen calculator parity with the hall; mock player lacks it.
- [ ] **Question editorial workflow**: lessons have draft→review→published; questions don't yet.
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

## Hygiene (no product impact, do opportunistically)

- [ ] Dead `get_leaderboard` RPC and dormant explore tables in prod DB.
- [ ] `tsconfig.tsbuildinfo` is tracked despite gitignore (untrack it).
- [ ] `.landing-source/` bulk committed — consider removal now the static site is gone.
- [ ] Daily-question engine has no UI surface since the wipe.
- [ ] Campaign system still references the UNILORIN unlock era — reconcile or retire.
