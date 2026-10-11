# Propeida learning architecture

**Status:** target architecture  
**Implementation context:** Next.js App Router, TypeScript, Supabase Auth/Postgres/RLS, Paystack

## 1. Scope and architectural decision

The current application already has a secure exam-practice foundation: `exams`, `subjects`, `questions`, exam sessions, answers, results, entitlements, payment records, school-specific exam access, and public Explore data. The next architecture extends that model into a learning platform.

Do not replace the existing question/session/result model. Add a content graph, learner-model records, review queue, and path selection around it.

### Organizing principle (binding)

**Subjects organize; exams configure. There are no gates before learning.**

- The library (practice, lessons, review, mastery, shelf) is organized by subject and topic, which belong to no exam. A learner never declares an identity to enter.
- An exam record configures exactly two things: a mock blueprint (question counts, timing, subject roles) and a countdown/cohort date. It never grants, denies, or hides learning.
- Empty shelves hide themselves by absence of content, never by permission walls or "coming soon" branches. A subject with no questions simply doesn't appear as practicable.
- The review test for any navigation or onboarding design: *does this ask the learner who they are before letting them learn?* If yes, it is rejected regardless of framing.

## 2. Target shape

```text
Next.js web application
├── Marketing landing page
├── Auth and onboarding
├── Learning path selector
├── JAMB study space
│   ├── Learn / lesson player
│   ├── Today’s review
│   ├── Targeted practice
│   ├── CBT mocks and results
│   └── Progress map
├── Post-UTME study space
│   ├── Target school + exam configuration
│   ├── Learn / review / targeted practice
│   └── School-style mocks and readiness
├── Account, entitlement, payment, and optional AI coach
└── Admin content operations

Next.js server actions / route handlers
├── Authenticated learning APIs
├── Existing session and result APIs
├── Review scheduler and mastery services
├── Content delivery and asset signing
├── Paystack webhook / entitlement services
└── Optional AI gateway (server-only)

Supabase
├── Auth
├── Postgres + RLS
├── Storage for reviewed media assets
└── Scheduled jobs / Edge Functions where appropriate
```

## 3. Route architecture

Use routes, not `?hub=universities`, as the source of truth for the active study space. Query strings remain useful for filters, never for product identity.

```text
/start                         path selector for authenticated users without a selection
/jamb                          JAMB home
/jamb/learn                    subject/topic catalogue
/jamb/learn/[lessonSlug]       lesson player
/jamb/review                   due-review queue
/jamb/practice                 targeted practice configuration
/jamb/mock                     CBT mock configuration
/jamb/progress                 mastery map and recovery actions

/post-utme                     Post-UTME home
/post-utme/target              choose/change target school and exam
/post-utme/learn               relevant lessons
/post-utme/review              due-review queue
/post-utme/practice            school/exam-specific practice
/post-utme/mock                school-style mock
/post-utme/progress            readiness report

/account                       preferences, selected path, subscription, privacy
```

Existing generic routes (`/dashboard`, `/practice`, `/history`, `/leaderboard`) can redirect to the active path during transition. Preserve legacy session URLs and results URLs.

## 4. Data model

### Retain

- `profiles`, `exams`, `subjects`, `exam_subjects`, `questions`
- `exam_sessions`, `session_answers`, `results`
- `daily_questions`, `daily_question_attempts`, `streaks`, `leaderboard_entries`
- `schools`, `user_exam_access`, `entitlements`, `usage_counters`, `payments`
- `careers`, `courses`, `course_universities`, `explore_interactions`

### Add

The names below are proposed migrations. UUID primary keys, timestamps, foreign keys, RLS, and indexes are required for each user-scoped table.

| Table | Purpose | Core fields |
|---|---|---|
| `learning_paths` | First-class product paths | `id`, `slug` (`jamb`, `post-utme`), `name`, `published` |
| `user_learning_paths` | A user’s activated paths and default | `user_id`, `path_id`, `is_default`, `activated_at`, `last_opened_at` |
| `topics` | Curriculum graph node | `id`, `subject_id`, `path_id` nullable, `slug`, `name`, `description`, `sort_order`, `published` |
| `topic_prerequisites` | Ordered dependencies | `topic_id`, `prerequisite_topic_id` |
| `lessons` | Reviewed instructional unit | `id`, `topic_id`, `slug`, `title`, `objective`, `estimated_minutes`, `version`, `published` |
| `lesson_blocks` | Ordered lesson content | `id`, `lesson_id`, `position`, `block_type`, `content`, `asset_id`, `question_id` nullable |
| `learning_assets` | Reviewed instructional media metadata | `id`, `storage_path`, `alt_text`, `asset_type`, `learning_purpose`, `license`, `status` |
| `question_topics` | Question-to-skill mapping | `question_id`, `topic_id`, `role` (`diagnostic`, `practice`, `review`, `mock`) |
| `question_misconceptions` | Explainable distractors/errors | `id`, `question_id`, `option_key`, `misconception_code`, `explanation`, `repair_lesson_id` nullable |
| `learner_topic_mastery` | Current learner model, not raw history | `user_id`, `topic_id`, `status`, `mastery_score`, `last_evidence_at`, `next_review_at`, `consecutive_successes` |
| `learning_attempts` | Lesson/review evidence | `id`, `user_id`, `topic_id`, `question_id` nullable, `lesson_id` nullable, `attempt_type`, `is_correct`, `confidence`, `created_at` |
| `review_queue` | Explicit, auditable daily review work | `id`, `user_id`, `topic_id`, `due_at`, `state`, `source_attempt_id`, `completed_at` |
| `student_targets` | Post-UTME intent | `id`, `user_id`, `school_id`, `exam_id`, `priority`, `active` |
| `ai_usage_events` | Metering and safety audit | `id`, `user_id`, `question_id` nullable, `action`, `input_tokens`, `output_tokens`, `cost_usd`, `outcome`, `created_at` |

### Content block types

Use a constrained union, not arbitrary HTML:

```text
intro | text | image_explainer | audio_explainer | worked_example |
guided_question | independent_question | reflection | vocabulary_card |
passage | diagram | callout | recap
```

The renderer validates each block against a schema. This permits high-quality editing, safe content display, analytics by block type, and future native/mobile reuse.

### Important indexes

- `learner_topic_mastery(user_id, next_review_at)` for due reviews;
- `review_queue(user_id, due_at) where state = 'due'`;
- `learning_attempts(user_id, topic_id, created_at desc)`;
- `topics(subject_id, path_id, sort_order)`;
- `question_topics(topic_id, question_id)`;
- `student_targets(user_id) where active = true`.

## 5. Learning services

### Path resolver

1. Read `user_learning_paths.is_default`.
2. If no active path, redirect to `/start`.
3. Permit a user to activate and switch paths without losing progress.
4. Scope home/dashboard, nav, review, practice, and mocks to the resolved path.

### Mastery and review engine

Start with an explainable rules engine rather than opaque machine learning.

```text
Independent correct answer → raise topic mastery; schedule longer interval
Supported correct answer   → small increase; require independent evidence
Incorrect / skipped        → lower confidence; schedule nearer review and repair lesson
Repeated misconception     → recommend prerequisite or targeted mini-lesson
```

The job computes recommendations from learner evidence but retains the raw attempts. Rules, intervals, and mastery thresholds belong in versioned configuration so they can be evaluated and changed safely.

### Question selection

1. Prefer due review for topics with weak or aging evidence.
2. Select unseen questions where possible.
3. Avoid an identical-question loop; sample different questions mapped to the same topic.
4. In practice mode, select a balance of current topic, prerequisites, and earlier interleaved topics.
5. In mock mode, use the actual exam blueprint and timing—not mastery optimisation.

### Feedback service

The answer key and reviewed explanation come from the database. The service may append a misconception-specific repair action. It must never expose answer data before submission.

## 6. Optional AI gateway

AI calls go through a server-only endpoint; never expose a provider key or allow direct browser-to-model calls.

```text
Client action → authenticated API route → entitlement + quota check →
retrieve reviewed question/lesson context → prompt template → model →
response validator → usage event + cached response → client
```

Allowed actions are a closed list: `hint`, `simplify_explanation`, `explain_mistake`, `review_reasoning`, `make_study_plan`. The gateway:

- supplies authoritative reviewed context;
- forbids inventing answers, citations, facts, or exam rules;
- caps output tokens and response length;
- rate limits by user/action/question;
- caches identical grounded requests;
- records cost/quality telemetry; and
- returns the reviewed explanation as a fallback on failure.

Initial model choice: a low-cost, high-volume text model such as `gpt-6-luna`; model selection stays behind a server configuration key. AI is not in the critical path for lesson delivery, scoring, review scheduling, or mocks.

## 7. Security and content governance

- Retain Supabase RLS for user-owned records. Every new user table has policies constrained to `auth.uid()`.
- Admin/content mutations remain server/service-role operations; public clients read published content only.
- Do not ship correct answers for live questions to clients before answer submission.
- Store assets in a private or policy-controlled bucket if they are paid content; use signed delivery where needed.
- Version lessons, explanations, and question mappings. A content correction must not rewrite historical student evidence silently.
- Maintain an editorial workflow: draft → review → published → retired, with source/reference and reviewer fields for high-stakes content.
- Minimise student data sent to AI. Do not send name, email, or unrelated history; send only the lesson/question context required by the selected action.

## 8. Interface system

### Design tokens

- Keep the landing page’s Fredoka headings and Nunito body type across authenticated experiences.
- Use playful illustrations and friendly micro-celebrations, but reserve saturated colour for action and state.
- Establish semantic colours for secure, in-progress, needs-review, and locked—not just an attractive palette.
- Respect reduced-motion preferences; motion should orient or reward, never interrupt a question.

### Component library to build

`PathCard`, `PathSwitcher`, `LearningHome`, `LessonPlayer`, `LessonBlockRenderer`, `WorkedExample`, `DiagramExplainer`, `VocabularyCard`, `ReviewQueue`, `MasteryMap`, `RecoveryCard`, `QuestionPlayer`, `FeedbackCard`, `MockLauncher`, `ReadinessReport`, `AiHelpSheet`.

## 9. Delivery plan

### Phase 0 — foundation

- Add `learning_paths`, `user_learning_paths`, path resolver, and redirects from the legacy hub.
- Rename visible “Universities” UI to “Post-UTME.”
- Build shared playful authenticated shell and path selector.

### Phase 1 — one complete learning vertical

- Create content schema, admin workflow, asset storage, and lesson player.
- Author and review one complete JAMB Mathematics topic cluster.
- Add question/topic mapping, worked examples, and misconception records.

### Phase 2 — deliberate practice

- Add learning attempts, mastery, review queue, targeted practice, and recovery cards.
- Rework dashboard around Continue / Today’s review / Practise / Mock / Progress.

### Phase 3 — Post-UTME

- Add target-school selection and school-specific learning/mocks.
- Reuse the learning core; only blueprint, content, and navigation differ.

### Phase 4 — paid AI coach

- Add server gateway, quotas, metering, eval set, cache, and fallback.
- Launch only after the non-AI experience has measurable learning benefit.

## 10. Evaluation plan

Before broad rollout, define a student cohort and compare the new flow with current practice-only usage:

- delayed topic recall after 7 and 21 days;
- independent accuracy after a worked example;
- number of repeated misconceptions resolved;
- mock-score movement by topic;
- completion of planned reviews;
- student-reported clarity/confidence; and
- cost per successful AI help action, where AI is enabled.

Do not use raw screen time as a success metric.

## 11. Curriculum authority and traceability

Content truth flows one way: **standards body → syllabus objective → Propeida lesson/question**. Never the reverse, never from blogs. The model is curriculum-agnostic: JAMB below is the first binding, not the shape of the system. A WAEC, NECO, SAT, or professional-skills path reuses every table and service here and only supplies new standards documents, objectives, and items. Routes generalize the same way (`/<path>`, `/<path>/learn`, `/<path>/review` …); `/jamb` and `/post-utme` are the first two slugs in `learning_paths`, not special cases.

### First binding: JAMB (proving ground)

### Source hierarchy

1. **JAMB IBASS** (`ibass.jamb.gov.ng`) — canonical for syllabus topics/objectives, recommended texts, brochure requirements, eligibility. It is a JavaScript SPA: extraction is a manual browser task, and every export is stamped with session year, URL, and access date.
2. **NERDC e-Curriculum portal + FME press-release list** — canonical for what is taught (version-stamped; the 2025 revision renamed cores). JAMB selects from this space but is not a 1:1 copy — never assert alignment the data doesn't show.
3. **University admission notices (per school, per year)** — canonical for Post-UTME mode, weights, cut-offs, sitting rules. Model as `school_screenings(school_id, year, mode, jamb_weight, screening_weight, olevel_weight, cutoff, sittings_allowed)`.
4. **Mirrors and blogs** — convenience copies only. `jamb-gov.org` is not `jamb.gov.ng`. Never cite as authority in-app.

### Verification convention

Every exam fact in code, content, or UI carries a status: ✅ official source · 🔶 high-confidence secondary · 🔴 unverified — must not ship as fact. Current 🔴 list: verbatim 60/40/40/40 bulletin line; Biology/Government/Literature/CRS/Geography full topic tables; canonical 2026 Literature list; scoring formula and negative-marking policy; year-by-year NERDC schemes.

### Content freshness rules

- Prescribed texts are **year-tagged data**: *The Lekki Headmaster* is current for 2025/2026 Use of English; *The Life Changer* is a past text. A new JAMB announcement retires the old tag, never edits it in place.
- Cut-offs, fees, dates, and screening modes are **year-tagged rows**, never constants.
- Mock blueprints encode the verified format: 4 subjects, 2-hour single sitting, on-screen calculator available; per-question mark values are never displayed as official.
- Distractor→misconception maps (`question_misconceptions`) are authored per distractor with a named misconception code and repair-lesson link, following Eedi's design rules: unambiguous, single-skill, and impossible to answer correctly while holding the target misconception.
