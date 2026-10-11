# Propeida product requirements

**Status:** proposed product direction  
**Vision:** the best learning platform for anyone — any subject, any level, any goal.  
**First release paths:** JAMB UTME and Post-UTME (Nigerian secondary-school and prospective university students)

> JAMB is the proving ground, not the boundary. Every system in this document — paths, lessons, mastery, review, feedback, AI coach — is curriculum-agnostic. A new path (WAEC, NECO, GCSE, SAT, professional exams, skills) binds a new syllabus to the same engine; nothing in the core is rebuilt.

## 1. Product thesis

Propeida helps students **learn a topic, retain it, and perform under exam conditions**. It is not a question bank with a chatbot attached, and it is not an engagement feed.

The learning loop is:

```text
Diagnose → learn one small idea → see a worked example → practise →
receive actionable feedback → retrieve it again later → demonstrate it in a mock
```

The product should feel playful, warm, and encouraging—using Fredoka/Nunito typography, friendly illustrations, colour, progress maps, and meaningful celebrations—while always making the next learning action clear.

### Principles

1. **Learning before novelty.** A feature earns its place only if it improves understanding, retention, confidence, or exam performance.
2. **The core works without AI.** Reviewed lessons, explanations, practice, review scheduling, and mocks are available without an AI dependency.
3. **Practice is part of teaching.** Questions diagnose and strengthen knowledge; they are not only a score machine.
4. **Different subjects need different experiences.** Mathematics is not English, and neither should use a generic card-and-quiz template.
5. **Fun supports effort.** Rewards celebrate productive learning behaviour, never endless tapping, logins, or time spent.
6. **Trust is non-negotiable.** Answer keys, exam rules, and curriculum content are reviewed and versioned.
7. **Science decides, evidence tunes.** Learning science and official standards determine what we build; local student evidence tunes it after launch. Engagement metrics never override either.
8. **No gates before learning.** Subjects organize Propeida; exams merely configure it. Nothing — no path picker, no hub, no exam gate, no "coming soon" wall — may stand between a learner and their next learning action. An exam matters at exactly two moments: mock assembly (blueprint) and the countdown date. Any design that asks the learner who they are before letting them learn fails review, no matter how it is framed.

### The promise

One sentence the student understands, the team builds to, and marketing can print:

> **Every session ends with proof you learned something — and you only ever see the next step.**

It stands on two pillars. Both are specified; neither is optional:

- **Pillar A — proof of learning (the mechanism).** Retention engine, review scheduler, delayed checks, misconception repair. Engineering builds this. Success criterion: delayed recall and mock movement, never session counts.
- **Pillar B — never behind (the feeling).** No mountains, no ranks, no streak threats; presence, shared struggle, and a close-out that always finishes something. Design protects this. Success criterion: return-after-failure and repair-attempt rates.

Feature test: *does this give the student proof of learning, or protect them from the mountain?* If neither — cut it.

## 2. Product structure

### Entry and path choice

The first authenticated experience asks: **“What are you preparing for?”**

| Path | Promise | Initial destination |
|---|---|---|
| JAMB UTME | Learn subjects deeply, practise, and prepare for the CBT | JAMB learning home |
| Post-UTME | Prepare for a target school’s screening style and requirements | Post-UTME learning home |

Each card explains what the learner will do. The selected path is saved as a preference and becomes the default return destination. A visible **Switch path** control remains available in the app shell. Do not force returning users through the selection screen.

### Shared shell, distinct study spaces

Account, notifications, support, payment, and the path switcher are shared. The main navigation and home content are path-specific:

| JAMB | Post-UTME |
|---|---|
| Learn | Target school |
| Today’s review | Today’s review |
| Topic practice | Targeted practice |
| JAMB mock | School-style mock |
| Progress | Readiness and progress |

“Universities” is not a learning path label. It becomes **Post-UTME**. (Career/course/university discovery was removed: it is guidance, not learning, and a discovery feed actively works against the promise. School requirements and cut-offs return later as reference data inside the Post-UTME path — see the architecture's `school_screenings` — not as a browsing surface.)

## 3. The non-AI learning core

### The learning home

The home screen must answer one question: **what is the best next thing for this student to do?**

Its primary modules, in order:

1. **Continue learning** — resume the active lesson or recovery path.
2. **Today’s review** — due retrieval prompts, capped at an achievable daily set.
3. **Practise a skill** — targeted questions linked to a learned topic.
4. **Mock exam** — timed application in the actual CBT format.
5. **Progress map** — a visual, calm view of secure, developing, and not-yet-started topics.

Streaks and leaderboards are secondary. A streak means “completed the planned learning/review action,” not “opened the app.”

### Lesson contract

Every lesson is short, structured, and authored against a defined learning objective:

1. **Warm-up / diagnostic:** one question that exposes prior knowledge.
2. **Teach:** a concise explanation, visual, or reading segment.
3. **Worked example:** an annotated solution or model response.
4. **Supported attempt:** one prompt with hints/scaffolding.
5. **Independent attempt:** one or two questions without support.
6. **Feedback and next action:** identify the misconception or success, then schedule review.

The system never call a topic “mastered” from one correct answer. The initial standard is: correct independent retrieval on more than one occasion, with a delay between attempts and sufficient confidence/accuracy.

### Subject-specific learning patterns

#### Mathematics

Mathematics needs a concrete-to-representational-to-abstract progression, not a page of formulas followed by a timer.

| Need | Product pattern |
|---|---|
| Build intuition | Interactive diagram or simple visual model before symbols where useful: number lines, fraction bars, algebra balance, coordinate plane, probability tree, graph. |
| See method and reasoning | Tappable worked examples; each line names the operation and its reason. |
| Avoid passive copying | Hide the next step, ask the student to predict it, then reveal and explain. |
| Diagnose errors | Distractors map to known misconceptions, such as wrong sign, invalid cancellation, order-of-operations error, or using the wrong formula. |
| Gain fluency | Short mixed sets that interleave earlier skills with the current one. |
| Apply knowledge | Word problems with highlighted quantities, optional sketch space, and later a full CBT-style version. |

Visuals must expose the mathematical relationship—not merely decorate a page. Every illustration has a labelled connection to a symbol, operation, or representation; the learner should be able to move from the picture to the notation and back.

#### English Language

English needs deliberate vocabulary, comprehension, grammar, and expression work rather than generic multiple-choice drilling.

| Need | Product pattern |
|---|---|
| Vocabulary | A small word card with plain-language definition, audio, a visual/context scene where helpful, collocations, contrast word, and sentence use. Review it in varied contexts. |
| Comprehension | Short passages with a purpose before reading, tappable evidence in the text, question types labelled by skill, and a concise explanation of why the evidence supports an answer. |
| Grammar | Minimal-pair sentence comparisons; students change or rebuild a sentence, then see the rule and a counterexample. |
| Lexis and structure | Visual text maps for argument, cause/effect, sequence, viewpoint, and reference words. |
| Writing/reasoning | Short “choose the stronger sentence” or “state your evidence” prompts before longer writing work. |

Pictures should establish context, clarify a word, or make a text structure visible. They must not give away a comprehension answer or replace reading.

#### Other subjects

- **Sciences:** labelled processes, change-over-time diagrams, simulations only where interaction clarifies cause and effect, and prediction before reveal.
- **Humanities/current affairs:** maps, timelines, cause-and-effect chains, comparison cards, and source/evidence questions.
- **Post-UTME:** target-school-specific exam blueprints and timed practice, with shared subject learning underneath.

### Images and visual system

The visual style is friendly editorial illustration: Nigerian students with real facial features, hands, shoes, varied body shapes, hairstyles, and colourful but harmonious outfits. Illustration supports belonging and warmth.

Instructional visuals are separately designed assets:

- use a single learning objective per visual;
- label only the information needed for the task;
- pair diagram and concise narration/text; and
- test understanding after the visual rather than assuming that seeing equals learning.

## 4. Feedback and review

Every answered item produces one of the following:

- **Correct:** why the reasoning works, then an optional challenge or later review.
- **Incorrect known misconception:** name the error kindly, show the missing relationship, and offer one short repair activity.
- **Incorrect unknown pattern:** record it for review and direct the learner to the prerequisite lesson.
- **Skipped:** preserve it as a review candidate without treating it as failure.

Review scheduling should use deterministic rules first. A correct independent response increases the review interval; an incorrect/skipped response brings the item or underlying skill back sooner. The system schedules concepts and skills, not just identical questions, to prevent answer memorisation.

## 5. AI is an optional coach

AI is a paid enhancement layered over reviewed content. It does not establish the answer key or curriculum truth.

### Free experience

- all core reviewed explanations and recovery paths;
- a small, clearly limited AI taste (for example, a few help actions weekly); and
- no feature essential to learning locked behind AI.

### Paid AI coach

- explain this step more simply;
- give a hint without revealing the answer;
- explain the student’s chosen wrong answer;
- respond to a typed reasoning attempt against a supplied rubric; and
- turn recorded weak topics into a constrained weekly plan.

No open-ended “ask anything” chatbot is a launch requirement. AI receives the reviewed item, answer key, explanation, and misconception tag; it is instructed to stay grounded in those inputs and use a short output limit.

## 6. Monetisation

| Free | Paid learning plan | AI add-on / included premium tier |
|---|---|---|
| Core lesson samples, review, basic diagnostics, reviewed explanations, limited practice/mocks | Full lesson library, full question bank, expanded mocks, deeper progress reports, school-specific Post-UTME preparation | Personalised hints, alternate explanations, reasoning feedback, study planning |

Paying should unlock depth, volume, and personalisation—not the ability to learn a foundational topic at all.

## 7. Success measures and guardrails

### North-star outcome

Students improve durable topic mastery and exam readiness.

### Product measures

- lesson completion followed by successful independent attempt;
- due-review completion rate;
- delayed recall accuracy by topic (not only same-session accuracy);
- weak-topic recovery rate;
- change in mock score and confidence over time;
- weekly active learners who complete a meaningful learning action.

### Guardrails

- Do not optimise minutes spent, raw streaks, or answer volume as primary success metrics.
- Monitor repeated failure loops, rage exits, and AI responses flagged as unhelpful.
- Measure performance separately by subject, topic, cohort, device/network conditions, and free/paid status.
- Pilot with real JAMB/Post-UTME students before broad rollout; compare delayed retention and mock outcomes against the current practice-only flow.

## 8. Evidence basis

- The [What Works Clearinghouse learning guide](https://ies.ed.gov/ncee/WWC/PracticeGuide/1) supports spaced learning, active retrieval, worked examples, combined graphical/verbal representations, and explanatory questions.
- The [retrieval-practice review](https://pubmed.ncbi.nlm.nih.gov/33006925/) finds benefits across material types, ages, and learner ability when information is recalled after learning.
- The [adolescent literacy practice guide](https://ies.ed.gov/ncee/wwc/practiceguide/8) supports explicit vocabulary instruction and explicit comprehension strategy instruction; it also recommends discussion of text meaning.
- [Worked examples in mathematics](https://educationendowmentfoundation.org.uk/news/eef-blog-using-worked-examples-to-support-mathematical-problem-solving) reduce unnecessary cognitive load and help students examine strategy choice.
- Visualisations are not automatically beneficial: their value depends on relevance, learner, and context. [Review of learning with diagrams and visualisations](https://pubmed.ncbi.nlm.nih.gov/42419770/)
- Feedback is most valuable when it gives a learner specific, actionable information about task, subject, or self-regulation strategy. [EEF feedback evidence](https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/feedback)

## 9. Delivery sequence

1. Replace the current query-string hub with persistent JAMB/Post-UTME learning paths and a polished path selector.
2. Deliver the reusable lesson player and one complete JAMB subject/topic vertical (recommended: Mathematics).
3. Add skill mastery, review scheduling, and targeted practice.
4. Reframe mocks, results, and history around actionable recovery.
5. Build Post-UTME target-school configuration and its dedicated home.
6. Add the paid AI coach only after reviewed content and the non-AI loop are validated.

## 10. Scientific foundations

This appendix is the authority behind the design above. Each entry states the finding precisely, cites the primary source, and names what it mandates in Propeida. Where evidence is vendor-claimed or single-study, it is flagged — see §12 for the verification convention.

### Retrieval and spacing

- **Practice testing and distributed practice are the two highest-utility strategies known** (rated "high utility" across ages, abilities, and materials; summarization, highlighting, rereading rated "low"). Dunlosky, Rawson, Marsh, Nathan & Willingham (2013), *Psychological Science in the Public Interest*. Mandate: every lesson ends in recall, every topic resurfaces on a schedule; no highlighter-first tools.
- **Testing beats restudying on delayed tests despite identical exposure** — repeated study after one successful recall adds nothing measurable, while repeated testing more than doubles recall (Karpicke & Roediger, 2008, *Science*; combined d≈4.03). Students are overconfident after restudy (Roediger & Karpicke, 2006). Mandate: study → recall → feedback in every block; short-answer before MCQ.
- **The optimal review gap grows with the retention interval** (roughly 20–40% of a 1-week interval down to 5–10% of a 1-year interval; Cepeda et al., 2006, 2008). **Equal spacing beats expanding spacing** for long-term retention (Karpicke & Roediger, 2007). Mandate: review gaps computed from exam date, not fixed "7 days"; scheduler logs interval pairs for later tuning.
- **Testing potentiates future learning** (the forward effect): interpolated quizzes roughly double recall of subsequently studied material and cut interference (Szpunar, McDermott & Roediger, 2008). Mandate: 3-question checks between sub-topics, not just end-of-lesson quizzes.
- **MCQ retrieval without feedback can entrench lures**; well-designed MCQs surface pre-existing misconceptions rather than implanting them, provided corrective feedback follows (Butler & Roediger, 2008; Butler, Karpicke & Roediger, 2007 — delayed feedback beats immediate on delayed tests). Mandate: every MCQ ships explanatory feedback; never bare answer keys.

### Cognitive load and multimedia

- **Novices learn procedures from worked examples, not from solving**; guidance that helps novices first shrinks, then *reverses* with expertise (Sweller, 1988; Kalyuga, Chandler & Sweller, 1998 — the expertise reversal effect). Mandate: worked example → faded completion → independent problems, with guidance fading as proficiency rises. This is real differentiation — not learning styles (see below).
- **Twelve multimedia principles** (Mayer, *Multimedia Learning*, 3rd ed. 2021): coherence, signaling, redundancy (graphics + narration beats graphics + narration + on-screen text), spatial and temporal contiguity, segmenting, pre-training, modality, multimedia, personalization, voice. Strongest effects for low-prior-knowledge learners. Mandate: the lesson-block QA checklist in the architecture doc.
- **Split-attention destroys the worked-example advantage** unless diagram and steps are physically integrated (Tarmizi & Sweller, 1988). Mandate: labels on diagrams, never legend-hunting.

### Feedback, mastery, and desirable difficulty

- **Frequent formative feedback with rule-governed corrective action** yields typical effects of 0.4–0.7 (Black & Wiliam, 1998, survey of ~250 studies; Fuchs & Fuchs, 1986: rule-governed review d≈0.92 vs. teacher-judgment d≈0.42). Later re-appraisals argue the headline range overstates (heterogeneous, dated base) — treat as directional, and follow the EEF Feedback guidance (+7 months, task-focused, specific, actionable). Mandate: the four-way feedback taxonomy (§4) plus auto-assigned repair, never score-only results.
- **Feedback is not uniformly positive**: high-information feedback helps most (d≈0.99); bare reinforcement/punishment helps least (d≈0.24); ~17% of feedback interventions backfire (Wisniewski, Zierer & Hattie, 2020, meta-analysis revising Hattie's 0.73 down to 0.48). Person-praise ("you're smart") can harm (Kluger & DeNisi, 1996). Mandate: feedback shows correct reasoning, contrasts the learner's error, assigns one next step, requires re-attempt. Model ROI on 0.48, not 0.73.
- **Mastery gating with correctives ≈ 1σ over conventional instruction; 1:1 tutoring ≈ 2σ** (Bloom, 1984 — based on two dissertations; modern tutoring effects are large but typically below 2σ, so cite Bloom as aspiration, mastery as benchmark). Mandate: ≥80% formative criterion with a *different* explanation + parallel re-test on failure, not same-item repetition.
- **Difficulties that slow acquisition speed retention**: interleaving (Rohrer & Taylor, 2007: interleaved 63% vs. blocked 20% on new problems a week later), varied conditions, generation before presentation (Bjork & Bjork, 2011, 2020). But difficulty is only *desirable* when the learner has the prerequisites to succeed — otherwise it is just difficulty. Mandate: interleave only after basics exist; pre-teach prerequisites; show learners their own retention curves to counter the fluency illusion.
- **Deliberate practice is teacher-designed, feedback-rich work at the edge of ability** — not hours logged (Ericsson, Krampe & Tesch-Römer, 1993; note the Macnamara replication debate: quality of practice explains far more than volume). Mandate: targeted weak-skill drills with explicit sub-goals; log error type and hint dependence, not just time.

### Scaffolding and differentiation

- **Scaffolding's six functions** (Wood, Bruner & Ross, 1976): recruit interest, reduce degrees of freedom, maintain direction, mark critical features, control frustration, demonstrate by completing the learner's partial attempt. Comprehension must precede production; all scaffolding fades. Mandate: encode each function as a system behavior; require unaided production before "mastered."
- **No learning-styles matching.** Pashler, McDaniel, Rohrer & Bjork (2008/2009), commissioned by the Association for Psychological Science, found virtually no properly-designed study supporting the meshing hypothesis (visual learners learning best visually, etc.) and called style-based instruction a waste of resources. Mandate: no VAK tracks or quizzes, ever. Differentiate by prior knowledge, pace, and misconception profile; give *all* learners dual-coded, practice-varied instruction.
- **For second-language readers, comprehension is lexical before it is intellectual**: ~95% known-word coverage is the minimum for supported reading, ~98% for independent reading (Laufer, 1989; Hu & Nation, 2000; Laufer & Ravenhorst-Kalovski, 2010; consensus formulation in Nation, 2001). Written English needs roughly 4,000 word families for 95% coverage, 8,000–9,000 for 98% (Nation, 2006). Thresholds are probabilistic and context-sensitive — apply as design guidance, not cutoffs. Mandate: pre-teach academic/subject vocabulary, in-text tap-glosses, graded simplified→authentic passages. Nigeria-specific vocabulary profiling is flagged follow-up research (§12).

## 11. Where the field falls short

Researched October 2026 against Nigerian platforms (uLesson, Myschool, TestDriller, ExamScholars, Prep50, Exambly, PassVerse, JambKit, O3Schools, JambSmartPrep) and global ones (Khan Academy, CENTURY, Eedi, Duolingo, IXL, Brilliant). These are the gaps Propeida is built to exploit:

1. **No memory engineering.** The field drills massed past questions; Khan "masters" then lets decay; only Duolingo ships a trainable forgetting model (Half-Life Regression, Settles & Meeder, 2016) — for vocabulary only. Nobody schedules JAMB-subject retention.
2. **Generic feedback instead of misconception diagnosis.** One explanation per question everywhere in Nigeria. Eedi proves distractor→misconception mapping for MCQ (Barton; Butler & Roediger, 2008; hypercorrection effect, Barton et al., 2021) — but is maths-only, UK-only, teacher-mediated. JAMB is almost entirely MCQ: the method transfers, and nobody has transferred it.
3. **Scores without mastery.** % correct, predicted scores (models unpublished), grind-gated thresholds — nobody certifies durable skill mastery (correct now + correct later + transfer variant).
4. **Engagement metrics as learning.** Streaks, XP, leaderboards, battles, prize challenges — Duolingo's own misuse literature documents minimal-effort farming and streak-loss churn. Gate rewards on mastery events, never on logins.
5. **Ungrounded AI tutors.** Every Nigerian "AI tutor" found is an unconstrained LLM wrapper with no published grounding corpus, syllabus constraint, or evals. Khanmigo's pilots show students route around Socratic design toward answer-getting. Constrain to syllabus, cite the item acted on, eval or it didn't happen.
6. **Watch-then-quiz with no hinge point.** Video nuggets never reroute on *which* wrong answer was picked. Every Propeida lesson opens with a diagnostic, branches on misconception, closes with a retention probe.
7. **No prerequisite repair or Post-UTME specificity.** Nobody models dependency chains or per-school screening modes. Own the behind-but-can-catch-up segment and the school-specific screen.

Standing correction: uLesson's own blog endorses "learning styles" — a live example of Gap 0 (myth-based personalization) in our home market.

## 12. Standards and exam facts inventory (first instantiation: JAMB)

Canonical sources only. The inventory model is universal — every future path gets its own instantiation with the same verification discipline. **Verification convention used throughout:** ✅ confirmed from official source · 🔶 high-confidence secondary (multiple independent sources + historical official statement) · 🔴 unverified — do not hard-code, flagged for manual extraction.

- **JAMB syllabus is official and per-subject**, living in IBASS (`ibass.jamb.gov.ng/e-syllabus`), 25 subjects ✅. Uniform structure: General Objectives → Topics/Contents/Notes with "Candidates should be able to…" objectives → Recommended Texts ✅ (verified from JAMB-formatted PDFs). Traceability model: `NERDC topic → JAMB objective → Propeida item`.
- **IBASS is a JavaScript SPA** — automated extraction fails; manual browser export of the 10 priority-subject PDFs (with session year + URL + access date) is required follow-up 🔴. Full verbatim tables still pending for Biology, Government, Literature, CRS/IRS, Geography 🔴. Mirrors (`jamb-gov.org`, syllabuses sites) are convenience copies, never canonical.
- **CBT format**: 4 subjects (English compulsory + 3), 2-hour single sitting ✅. Question counts 60 English + 40×3 = 180 total, pacing 40/27/27/26 🔶 (multiple independent secondaries + 2017 Registrar announcement; no verbatim bulletin line found). Total 400 (4×100); per-question weights are inferred, **never present as official** 🔶. On-screen calculator provided; physical calculators/phones/watches banned ✅. Mock is optional, paid, familiarisation-only ✅. 2026 UTME: 16–22 April, ~2.2m candidates ✅.
- **Current Use-of-English novel (2025, 2026): *The Lekki Headmaster* (Garba)** ✅ — replaces *The Life Changer*. Any bank content tagged otherwise is stale. Content freshness rule: prescribed texts are year-tagged data, never assumptions.
- **NERDC** publishes the taught curriculum (e-Curriculum portal + 2025 revised list: English, General Maths, one Trade subject, Citizenship & Heritage Studies, Digital Technologies as core) ✅ — but NERDC itself warns fake subject lists circulate; version-stamp curriculum year. **JAMB syllabus ≠ NERDC curriculum**: JAMB selects examinable topics and adds prescribed texts. Never assert 1:1 alignment.
- **Post-UTME modes vary by school and year** (all 2025/2026-cycle, official notices): UNILORIN in-person CBT (aggregate 50/30/20) ✅ · UNILAG online proctored 30-min test (50/20/30) ✅ · OAU online screening ✅ · UI in-person exam ✅ · FUTA/UNN documentary screening in observed cycles ✅. Model screening-mode per school per year; cut-offs year-tagged (UNILAG/OAU/UI 200; UNILORIN/FUTA 180; UNN 160; JAMB floors 150 universities / 100 poly ✅ 2026 Policy Meeting).
- **Never assert**: negative-marking policy 🔴 · exact scaling/rounding 🔴 · "JAMB-approved prep app" (no such endorsement exists) 🔴 · vendor efficacy claims without published methodology (Prep50 95%, JambKit +39, CENTURY UCL 30%, Eedi 90%+) 🔴.

## 13. Belonging without leaderboards

A learner on any path must feel they are not alone in Propeida. Leaderboards answer this need toxically — they prove others exist by ranking the reader below them. This section specifies affiliative social mechanics (presence, shared struggle, cooperation) and forbids competitive ones. It is load-bearing for the product thesis: a public rank would violate "never makes you feel behind," which is why competitors cannot copy these mechanics without breaking their own model.

### Grounding

- The need to belong is a fundamental human motivation, comparable in force to basic drives; thwarted belonging impairs persistence and performance (Baumeister & Leary, 1995, *Psychological Bulletin*).
- Descriptive social norms — evidence that *people like me do this* — move behavior more reliably than exhortation (Cialdini; "the library is full" beats "you should study").
- Normalizing error reduces performance anxiety, which itself blocks learning: a student told their mistake is common attempts the repair; a student told they rank 4,000th avoids the topic.

### The four mechanics

1. **Ambient presence.** Live and weekly aggregates, never names or ranks: students online now, students who studied this week, topics secured by the cohort. The building always feels full. Ships with launch; trivially cheap.
2. **Shared struggle.** Every misconception-level feedback moment carries its prevalence: *"63% of students also picked this on their first try — here's why it's tempting."* Requires the misconception maps (§10–11 of the architecture's `question_misconceptions`); prevalence is computed from attempts data and shown only above a minimum sample. Failure becomes communal, not isolating.
3. **Cohort journey.** Each exam cohort (e.g., Class of JAMB 2027) shares a timeline with collective milestones and seasonal moments (mock weeks, countdowns). Others' progress reassures because the goal is shared. Collective counters only ("the class secured 100,000 topics"); no per-student comparisons, ever.
4. **Witnessed achievement (phase two).** Opt-in stories of real learners overcoming hard topics — inspiration, not scores. Gated on explicit consent; never automatic.

### Forbidden anti-patterns

- Public ranks, percentile displays, or score comparisons between named or identifiable students.
- Streak-loss shaming, demotion mechanics, or any countdown that punishes absence.
- "Friends leaderboard" or school-vs-school ranking, however framed — cooperation between schools, never competition against them.
- Publishing any individual's activity, accuracy, or pace without explicit opt-in consent.

### Privacy and safety rules

- All presence and prevalence figures are aggregates with minimum-sample thresholds; small cohorts show no figures rather than revealing individuals.
- No direct messaging between minors at launch. Any future peer-help surface is moderated, reportable, and off by default.
- Belonging metrics measure the right thing: return-after-failure rate, repair-attempt rate, and self-reported belonging — never time-spent or tap counts.

## 14. One complete session

The atomic unit of Propeida. Not a fixed duration — a completable loop with a low floor and no ceiling. **Design target: the core loop feels finished at ~15 minutes** (a queue, a bus ride) and extends naturally to 45+ for whoever stays. That target is an assumption to validate after launch, not a fact; real session lengths tune entry points later.

```text
Open → one screen: "Continue: <lesson> (<n> min left)"
  No decisions, no dashboard of doom. One tap to start.

Warm-up retrieval (2–3 questions on last session)
  "Still got it?" — the proof engine warming up, and the first
  retention data point of the day.

One micro-lesson: single idea, worked example, one try
  Teach → supported attempt. Finishable standing in a queue.

Targeted practice (5–7 questions, misconception-aware feedback)
  Wrong answers get named repairs, not red X's. Shared-struggle
  prevalence appears here (§13).

The close-out (the hobby mechanic)
  "Session complete: <topic> → Secured ✓ · Review in <n> days ·
   <n> topics secured this week."
  A finished thing, a growing collection, a scheduled return —
  not a streak threatening to break, but a garden growing.
```

Rules: every session must be able to end with something secured; the close-out always states what was proven and when it returns; nothing in the session displays total remaining scope. Presence signals (§13.1) may appear at open and close — never as interruption mid-lesson.
