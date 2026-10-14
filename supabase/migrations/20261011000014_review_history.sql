-- Verification trail: every explicit verification stamps an append-only
-- row (who, when, which state, what was checked). A published question's
-- ✅ is auditable, not just asserted. questions.verified_*/review_note
-- stay as the current-state cache; this table is the history.

create table if not exists question_reviews (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions(id) on delete cascade,
  reviewer uuid,
  verified_state text not null check (verified_state in ('unverified', 'source_cited', 'human_verified')),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists question_reviews_question_idx
  on question_reviews (question_id, created_at desc);

-- Backfill one row per already-verified question from the cached columns,
-- so the trail starts complete instead of starting at zero.
insert into question_reviews (question_id, reviewer, verified_state, note, created_at)
select id, verified_by, verified_state, review_note, coalesce(verified_at, now())
from questions
where verified_state <> 'unverified';
