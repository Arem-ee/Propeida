# Propeida engagement: psychology, onboarding and habit formation
Author's note: research synthesised November 2026 from public literature and Duolingo's own engineering blog. Codebase audit reflects origin/main at time of writing. `app/onboarding/page.tsx` is in active flight from the current redesign and is intentionally not touched in this report.

## 1. The question

Make Propeida as habit-forming as Duolingo, without becoming a casino for teenagers sitting Nigeria's highest-stakes exam. Onboarding must be short enough that a busy 17-year-old decides this is easier than scrolling, and never leaves them staring at ten choices to make.

The answer is not "more gamification". The answer is **a tight loop (micro-commitment → visible progress → earned celebration), a thin onboarding, and one or two nudges per week - never more**. Duolingo is the benchmark for format, not the ceiling for copy or intensity.

## 2. What the evidence says

### Duolingo's own numbers and design
- Streak animations for new learners lifted 7-day retention by 1.7%.
- Streak Freezes (allowing a missed day) lifted daily actives by 0.38%; weekend Amulets lifted 7-day return by ~4% and cut streak loss by ~5%.
- Offering a Streak Wager lifted day-7 retention by ~14%.
- Learners on a 7-day streak are 3.6× more likely to finish their course.
- Loss aversion (Kahneman & Tversky) is the engine of the streak; without a freeze the feature becomes a punishment machine.

### Gamification meta-analyses (educational)
- Gamification effect on learning motivation: small but real (g ≈ 0.25-0.54). On cognitive outcomes, g ≈ 0.49. On behaviour, g ≈ 0.25.
- Biggest gains: **autonomy** (g ≈ 0.64) and **relatedness** (g ≈ 1.78); competence barely moves (g ≈ 0.28).
- **Competition and collaboration both work when cooperative framing is primary**; pure ranking leaderboards depress low performers and undermine autonomy for already-motivated learners.
- Gamification decays over time (novelty effect). It's a bridge to real practice, not a destination.

### Onboarding and cognitive load (the part you asked about directly)
- Median app onboarding: 5 screens. More than 4 steps in a tour halves completion.
- Education apps average 9 screens; utilities 4. Completion falls from ~90% (1-5 screens) to ~63% (21+).
- "Progressive disclosure" and Lee's Law (split long flows only when you actually need to split, and cut, not shuffle, the content) are the two strongest levers. Splitting the same questions over more screens raises **interaction cost** while leaving **decision cost** unchanged - that's the cognitive-load paradox.
- Forced checklists pre-feeding the product backfire (pre-commitment, privacy concerns). Skipping and self-paced setup **tripled adoption** in one controlled study (Scoop).
- Choice architecture: merging several minor decisions into one clustered decision raises adoption (85% vs 52% in one pre-registered study), as does default framing when the default is honest.
- NN/g: if possible, remove onboarding entirely and teach in context.

### Critical honesty: what research does **not** support
- Streak resets without a repair mechanism (demotivating; pushes learners out exactly when they already feel bad).
- Guilt-laden notifications ("You disappointed me"). Duolingo itself is explicit about this: learners, not the app, control the tone.
- XP for app opens, logins or dates-on-calendar alone. This is the classic overjustification effect - it trades intrinsic for extrinsic motivation.
- Infinite stranger-vs-stranger leaderboards (autonomy and competence both suffer).
- Notifications more than once or twice per day; urgency language without evidence ("Your exam is in 2 days" only when it's true).

## 3. Where Propeida already does this well (keep, don't rebuild)

- **Mascot voice everywhere** - celebration is framed as "the work adding up", never "don't lose your streak".
- **Win toasts** (streak, milestone, lesson-done, session-done, onboarded) with mascot framing and once-a-day streak celebration.
- **Personal home**: weakest-subject nudge ("Your answers show where you should start"), cohort countdown (verified date only), social proof threshold, continues where you left off.
- **Spaced recall** and **squads** - relatedness and competence drivers already in place.
- **Worked steps with verification discipline** - competence signal that isn't a gimmick.
- Copy: no guilt language in signup/reminder emails; WhatsApp channel as aspiration, not FOMO.

## 4. Where Propeida loses attention unnecessarily (with codebase evidence)

### A. The onboarding is wider than it needs to be
Ten steps: welcome → exam → subjects → name → course → heard-about → study-time → target-score → accessibility → summary.
Only 5 carry real signal (welcome, exam, subjects, accessibility, summary). The other 5 are extractable later.
**Recommendation (to the redesign flow, not here):** cut to 5 essential screens (welcome → exam → subjects → name → summary), drop/remember later `heard-about`, `study-time`, `target-score`, `course`, and default `accessibility` to none (editable in Settings later). Everything a first-time learner wants to know is one screen away; everything we want to know is one settings screen away.

### B. The mock asks too much upfront
Two interactions separate signup from answering a question: subject picker ("JAMB needs English plus 3 more") and the exam launcher. The JAMB paper hides **zero** questions until the picker is satisfied. This is the right gate (paper must exist) but zero feedback before the learner commits.
**Recommendation:** make the picker visibly finite and partial-by-default - English preselected locked, Chemistry/Physics pre-filled as one honest empty state ("the most common combo") so a learner opens the page and taps *Start* once.

### C. The home screen hides the big certainty hook
Streak flame lives in the hero path; cohort countdown exists only when verified; the NEG doc can't promise "84 days to JAMB" for an unverified cycle. Fine - correct discipline. But the streak number is small relative to Duolingo, and the weekly time-anchor (recommended goals) is missing entirely.
**Recommendation:** one daily cadence line on home - e.g. "2 lessons due today; picking the hardest topic wins" - tied to actual due items, never manufactured.

### D. No daily goal, so no Duolingo "just one more"
Duolingo's entire habit engine is a goal you can hit in under 10 minutes. Propeida has practice sessions and mocks but **no small, named daily target**.
**Recommendation (copy + a query, no new schema):** surface "today's one topic" on home as a single action; the reward is a correct answer with a mascot, plus a streak toast when it fires.

## 5. Prioritised plan

### Tier 1 - free wins now (copy + ordering, no new schema)
1. Shorten onboarding copy to 5 screens when the redesign lands (list ready, §4-A).
2. Subject picker (§4-B): pre-fill Chemistry/physics as the default recommended combo; show one-line intent under each button ("You'd miss Chemistry the most if you skip it").
3. Home daily line (§4-D): one action item - the top due topic; no alternative choices.
4. Notifications cadence check: keep to ≤2/week; every nudge names the topic, never a grade.

### Tier 2 - next sprint (needs sign-off)
5. Streak repair for 1 missed day/month (freeze via the streaks table; earns back the forgiveness model). `streaks` already exists; freeze column missing.
6. Weekly pulse notification: "here's the one topic you did worst on this week" - salience + competence, not guilt.
7. Post-mock "celebrate one win" review: surface 1 strong answer with the mascot at the top of the close-out screen (competence hook, not a loss frame).

### Tier 3 - strategic (don't build until Tier 1/2 verified live)
8. Cohort leaderboard within a 4-6 person squad (collaboration over competition, per meta-analyses). Only after squad nudge funnel is stable.
9. Placement burst at onboarding (a 90-second adaptive warm-up) to seed initial mastery and make the "weakest subject" nudge accurate from day 1. The diagnostic page exists; it is overkill for a daily habit metric.

## 6. What not to do (explicit)

- No guilt copy, no shame push notifications, ever.
- No XP for opening the app, logging in, or reading without answering.
- No stranger-vs-stranger leaderboards.
- No dynamic streak numbers that inflate with effortless taps.
- No "your exam is in X days" unless the countdown is syllabus-verified.
- Never reward speed over correctness in the celebration copy.

## 7. Measurement

- Onboarding completion rate (currently unknown; instrument): target > 85%.
- 7-day return (target > 40%) and streak-active (≥ 2 days) rate.
- Practice sessions per active user per week (engagement shape).
- Custom events already exist (`/api/events`) - extend with `onboarding_complete`, `streak_qualified`, `practice_started` if/when slice 1 is shipped.

## 8. Summary

Duolingo works because it turns "study" into a small, repeatable ritual that pays out on every keystroke, then forgives you when life intervenes. Propeida already has the celebration layer and the personal-reason-to-return (your weak subject is always waiting). The gap is **friction at entry** and **no tiny daily goal**. Close those two and the loop closes itself.
