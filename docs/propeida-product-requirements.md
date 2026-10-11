# Propeida product requirements

**Status:** proposed product direction  
**Audience:** Nigerian secondary-school and prospective university students  
**First release paths:** JAMB UTME and Post-UTME

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

“Universities” is not a learning path label. It becomes **Post-UTME**. Course/career/university exploration remains a useful supporting feature, especially for students deciding where to apply.

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
