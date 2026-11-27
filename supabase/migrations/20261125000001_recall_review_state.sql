-- Active Recall v2, Phase 2: card-level memory state for the spaced queue.
--
-- One row per learner per card. Own-row reads only, no client writes. The
-- forgetting curve and update rules live in lib/recall-scheduler.ts (app
-- level, versioned) so tuning never needs a migration.
--
-- This is NOT a second scheduler: marks still land in learning_attempts and
-- fold into learner_topic_mastery through applySubjectEvidence. This table
-- only decides WHEN a card returns.

create table if not exists public.recall_review_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id uuid not null references public.recall_cards(id) on delete cascade,
  -- Stability: days until retrievability falls to 90%.
  stability real not null default 0.4,
  -- Difficulty on a 1..10 scale (FSRS convention, higher = harder).
  difficulty real not null default 5,
  reps int not null default 0,
  lapses int not null default 0,
  last_review_at timestamptz not null default now(),
  due_at timestamptz not null default now(),
  -- Last grade: 1 Again, 2 Hard, 3 Good, 4 Easy.
  grade smallint not null default 3,
  updated_at timestamptz not null default now(),
  primary key (user_id, card_id)
);

create index if not exists recall_review_state_due_idx
  on public.recall_review_state (user_id, due_at);

alter table public.recall_review_state enable row level security;

create policy "users read own recall review state"
  on public.recall_review_state for select
  to authenticated
  using (auth.uid() = user_id);

revoke insert, update, delete on public.recall_review_state from anon, authenticated;
grant select on public.recall_review_state to authenticated;
grant all on public.recall_review_state to service_role;
