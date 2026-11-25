-- Lesson completion tracking.
--
-- learning_attempts records attempts but never marks a lesson finished, so the
-- Home "Continue learning" card could point at a lesson the learner had
-- already completed. This table records completion idempotently when the
-- lesson player reaches its close-out. Reads are own-row; writes are
-- server-authored only, so a client cannot mark a lesson complete itself.

create table if not exists public.lesson_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index if not exists lesson_completions_user_idx
  on lesson_completions (user_id, completed_at desc);

alter table lesson_completions enable row level security;

create policy "users read own lesson completions"
  on lesson_completions for select
  to authenticated
  using (auth.uid() = user_id);

grant select on lesson_completions to authenticated;
-- No INSERT/UPDATE grant: completeLesson writes through the service role.
