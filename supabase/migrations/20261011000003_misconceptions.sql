-- Step 4 misconception maps: distractor-level diagnosis (Eedi method).
--
-- Each row names the specific error a wrong option reveals, with its own
-- repair text. Authored by experts (attempt data is too thin to mine yet);
-- data-driven prioritization follows once per-question volumes qualify.
-- repair_note_id references revision-note ids (lib/notes) when a lesson
-- repair exists; null means the repair text stands alone.

create table question_misconceptions (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions(id) on delete cascade,
  option_key text not null check (option_key in ('a', 'b', 'c', 'd')),
  misconception_code text not null,
  misconception_name text not null,
  explanation text not null,
  repair_note_id text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (question_id, option_key)
);

create index question_misconceptions_question_idx
  on question_misconceptions (question_id);

alter table question_misconceptions enable row level security;

-- Feedback is shown post-answer to any signed-in learner; writes stay
-- privileged (service-role behind requireAdmin in the admin API).
create policy "authenticated learners read misconceptions"
  on question_misconceptions for select
  to authenticated
  using (true);
