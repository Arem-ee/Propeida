-- Lesson close-out transfer task: learner puts the concept in their own
-- words, as if teaching a friend who missed class. Stored for the learner's
-- own review and for the close-out "teach back" moment in the lesson player.

create table lesson_reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  explanation_text text not null,
  created_at timestamptz not null default now()
);

create index lesson_reflections_user_lesson_idx
  on lesson_reflections (user_id, lesson_id, created_at desc);

alter table lesson_reflections enable row level security;

-- Users manage their own reflections: write at close-out, read for review.
create policy "users manage own lesson reflections"
  on lesson_reflections for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
