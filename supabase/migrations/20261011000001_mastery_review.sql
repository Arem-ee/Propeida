-- Step 2 proof engine: learner mastery model + explicit review queue.
--
-- Granularity is SUBJECT-level today (topic_id nullable, reserved for the
-- topic graph + misconception work in a later step). session_answers remains
-- the raw evidence; these tables are the interpreted learner model.
-- Intervals follow an expanding ladder (1/3/7/14/30 days) per Cepeda et al.:
-- absolute gaps grow with retention horizon. Exam-date-anchored scheduling
-- (gap as a function of days-to-exam) lands with the exam-calendar binding.

create table learner_topic_mastery (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete restrict,
  topic_id uuid null,
  mastery_score integer not null default 0 check (mastery_score >= 0 and mastery_score <= 100),
  status text not null default 'fragile' check (status in ('fragile', 'developing', 'secured')),
  consecutive_successes integer not null default 0,
  last_evidence_at timestamptz,
  next_review_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One subject-level row per user while topic_id is null; full uniqueness
-- once topic rows exist (NULLs never compare equal in Postgres).
create unique index learner_mastery_subject_unique
  on learner_topic_mastery (user_id, subject_id)
  where topic_id is null;
create unique index learner_mastery_topic_unique
  on learner_topic_mastery (user_id, subject_id, topic_id)
  where topic_id is not null;
create index learner_mastery_due_idx
  on learner_topic_mastery (user_id, next_review_at);

create table review_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete restrict,
  topic_id uuid null,
  due_at timestamptz not null default now(),
  state text not null default 'due' check (state in ('due', 'done')),
  source_session_id uuid null references exam_sessions(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index review_queue_due_idx
  on review_queue (user_id, due_at)
  where state = 'due';

alter table learner_topic_mastery enable row level security;
alter table review_queue enable row level security;

-- Users own their learner model outright.
create policy "users manage own mastery"
  on learner_topic_mastery for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users manage own review queue"
  on review_queue for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
