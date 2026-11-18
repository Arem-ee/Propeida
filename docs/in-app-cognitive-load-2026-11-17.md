# In-app cognitive load audit — measured against production
Author's note: codebase walkthrough against origin/main, 2026-11-17. Complement to `docs/engagement-psychology-2026-11-17.md` (onboarding); this report covers every authenticated surface a learner touches after signup.

## 1. What the evidence says about in-app load

Inside the app, the primary cost is **decision latency before the first keystroke** — the moment of choosing before opening a session. Three empirical anchors apply:

- Hick's Law: choice time rises logarithmically with equally plausible options. Double the options does not double decision time; it adds one log-unit. That means fewer, better-weighted choices beat exhaustive lists, but they have to be **realistically likely**, not just small.
- Cognitive Load Theory (Sweller): only extraneous load (caused by bad presentation) can be engineered away. Intrinsic load (the task itself is hard: JAMB Maths) cannot.
- Choice overload (Iyengar & Lepper's jam study): 24 flavours → 30% purchase; 6 → 10% purchase but vastly higher follow-through. Choice pressure does not compel people; it stops them.
- NN/g decision-support guidance: highlight the most probable path, not every path equally.

The rule I apply to Propeida: **one screen, one choice a non-motivated learner must make.** Everything else is progressive disclosure (visible, but secondary) or removed.

## 2. Surface-by-surface audit

### Home (`/home`)
**Verdict: good shape. One real choice.** Hero card (continue session / due review / weakest subject / start lesson) is the only prominent decision. Secondary grid: cohort, weakest, continue, stats — four finite options, fine.
**Load risk found and fixed:** presence-students pill and cohort card compete with the streak chip for top-row space. They're now structured so the count of students studying appears before the countdown, not after — but both stay (salience, not overload). The verified-flag gate keeps days-to-exam off unless syllabus-verified.
**Remaining:** the "mixed review with questions from all N subjects" line names a number of subjects the learner may have weak recall for. Salience > quantity; leave as is.

### Learn hub (`/learn`)
**Verdict: clean.** 9 shipped subjects. No choices beyond picking one. Empty for unpublished subjects with honest empty state.

### Learn subject page
**Verdict: good.** "You start with this lesson" hero with a specific recommendation, then topic list under long-form heading.
**Follow-up small fix worth doing:** hide Pro-locked lessons behind a single disclosure toggle rather than rendering a lock icon per locked item; one lock signal instead of 30.

### Practice session
**Verdict: preselected defaults now.** Exam picks the path-filtered first exam; subjects previously started empty for cold users and filled only from a deep link. Now preselected from the learner's profile `subject_combinations` (this session), which is their own declared intent, not guesswork.
**Load risk fixed today:** the "Start practising" button was silently disabled with no inline explanation when zero subjects selected — the exact cue that triggers drop-off to TikTok. Now one tap preselected from their combination.
**Difficulty and count:** fine at 10/Mixed.

### Mock launcher
**Verdict: preselected now, like practice.** Identical mechanism; the JAMB paper previously started blank which for a tired learner is the biggest activation cliff in the product.
**The 180-question JAMB gate is non-negotiable** (JAMB exists); mitigation is English-locked+3-elective UX, already correct.

### Progress
**Verdict: skimmable.** mastery bar per subject is under ~8 rows. Fine.

### Recall, Targets, Squad
**Verdict: single-decision surfaces.** Recall shows one card at a time. Targets picks one school. Squad is one squad per learner. No hedging surface.

### Account
**Verdict: moderate load.** Profile preferences pack ~12 inline toggles. Low frequency; acceptable.

## 3. Where load actually resets (not what we think)

The cognitive-load problem is almost never the screen count; it is the **zero-commitment-begin moment**. Every path must have a one-tap begin already preselected from the user's declared intent. That is now true in:
- Practice sessions (subject preselected)
- Mock session (subject preselected)
- Onboarding (5 screens → direct exam card)
- Home (one hero next action)

What remains: the **learn subject page** still requires the learner to pick a topic if they didn't follow the recommendation. It's optimised for "recommended" as the default path; acceptable.

## 4. What to do next (ordered)

1. **Hide Pro-locked lesson icons behind one disclosure** on learn pages (one lock signal, not 30).
2. **Move cohort presence chip below the hero** (net = one fewer top-row element competing for attention when the learner is deciding).
3. **Practice "resume" button placement** above the setup panel when a session is in progress (salience order decision-order, not code-order).
4. **One "continue today's lesson" CTA** on home for learners whose current lesson is identified (Che — only if home is freed from hand-of-redesign concerns).

## 5. What research says is the wrong fix

- Redesigning the grid into tiles vs list — grid-vs-list is a preference question, not a load question.
- Hiding subjects entirely (split screens) — this is removing choice, not load; the breadth is why they are here.
- Auto-playing audio — audio is the single fastest way to make a cramped-study app unusable in a shared room; never.
- Removing the 180-question JAMB mock — that is the actual JAMB exam, and an underprepared learner who knows the real load is the product, not a bug.

## 6. Summary

In-app decision load is in good shape after this week's three changes. The remaining debts are small and organised. The rule to hold the line with: **every first touch must be one tap away from one decision already chosen for them, and they can always change it.**
