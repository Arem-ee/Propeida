-- Lesson player evidence: attempts made inside lessons (outside sessions).
-- session_answers remains the session evidence; this table is the lesson
-- evidence. Both fold into learner_topic_mastery through the same rules.

create table learning_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete restrict,
  question_id uuid null references questions(id) on delete set null,
  lesson_id text null,
  attempt_type text not null check (attempt_type in ('diagnostic', 'supported', 'independent')),
  is_correct boolean null,
  confidence text null check (confidence is null or confidence in ('sure', 'unsure')),
  created_at timestamptz not null default now()
);

create index learning_attempts_user_subject_idx
  on learning_attempts (user_id, subject_id, created_at desc);

alter table learning_attempts enable row level security;

create policy "users manage own lesson attempts"
  on learning_attempts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
