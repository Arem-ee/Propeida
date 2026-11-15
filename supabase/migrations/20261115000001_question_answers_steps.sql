-- Question-bank worked steps
--
-- 2026-11-14 the owner locked down the standard: questions whose solution is
-- a procedure (maths, and the calculation-heavy parts of Physics, Chemistry
-- and Principles of Accounts) explain the answer as worked steps, not prose.
-- Recorded in docs/question-bank-ingestion.md ("Explanation format for maths and
-- calculation questions"). Step shape mirrors lesson worked_example blocks:
--   { "operation": string, "reason": string, "result": string,
--     "predictPrompt"?: string }
--
-- The learner-facing answer path stays locked exactly as it is today:
-- question_answers is service-role only, no client grants, no RLS. The new
-- steps column is born with the same protections, and the sync trigger
-- mirrors them from questions.

-- Bearer column for the admin write path (mirrors explanation_public_notes
-- when those get their own migration).
alter table question_answers
  add column if not exists steps jsonb;

comment on column question_answers.steps is
  'Optional worked steps for calculation answers: array of { operation, reason, result, predictPrompt }. Same shape as lesson worked_example steps.';

-- The admin write path upserts through questions, so mirror the new column
-- through the same sync the explanation uses.
alter table questions
  add column if not exists steps jsonb;

comment on column questions.steps is
  'Worked steps as stored inline in the import tool; mirrored into question_answers by the sync trigger. See docs/question-bank-ingestion.md.';

create or replace function sync_question_answers()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.correct_answer is not null
     and (tg_op = 'INSERT'
          or new.correct_answer is distinct from old.correct_answer
          or new.explanation is distinct from old.explanation
          or new.steps is distinct from old.steps) then
    insert into question_answers (question_id, correct_answer, explanation, steps)
    values (new.id, new.correct_answer, new.explanation, new.steps)
    on conflict (question_id) do update
      set correct_answer = excluded.correct_answer,
          explanation   = excluded.explanation,
          steps          = excluded.steps;
  end if;
  return new;
end;
$$;

-- Practice feedback path: return the steps too when present.
drop function if exists get_session_answer_reveal(uuid, uuid);
create or replace function get_session_answer_reveal(
  p_session_id uuid,
  p_question_id uuid
)
returns table (correct_answer text, explanation text, steps jsonb)
language sql
security definer
set search_path = public
as $$
  select qa.correct_answer, qa.explanation, qa.steps
  from exam_sessions es
  join session_answers sa on sa.session_id = es.id and sa.question_id = p_question_id
  join question_answers qa on qa.question_id = sa.question_id
  where es.id = p_session_id
    and es.user_id = auth.uid()
    and ((es.mode = 'practice' and sa.selected_answer is not null) or es.status = 'completed');
$$;

-- Review path: return steps too when present.
drop function if exists get_session_review(uuid);
create or replace function get_session_review(p_session_id uuid)
returns table (
  question_id uuid,
  subject_id uuid,
  question_text text,
  options jsonb,
  selected_answer text,
  is_correct boolean,
  correct_answer text,
  explanation text,
  steps jsonb,
  time_taken_seconds integer
)
language sql
security definer
set search_path = public
as $$
  select q.id, q.subject_id, q.question_text, q.options, sa.selected_answer,
         sa.is_correct, qa.correct_answer, qa.explanation, qa.steps, sa.time_taken_seconds
  from exam_sessions es
  join session_answers sa on sa.session_id = es.id
  join questions q on q.id = sa.question_id
  join question_answers qa on qa.question_id = q.id
  where es.id = p_session_id
    and es.user_id = auth.uid()
    and es.status = 'completed'
  order by sa.id;
$$;

revoke all on function sync_question_answers() from public, anon, authenticated;
revoke all on function get_session_answer_reveal(uuid, uuid) from public, anon;
revoke all on function get_session_review(uuid) from public, anon;
