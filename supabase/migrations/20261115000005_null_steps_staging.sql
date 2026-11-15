-- Follow-up to 20261115000002_repair_phase_b_sync.sql.
--
-- The repair restored the Phase-B null-out for correct_answer and explanation,
-- but not for the new steps staging column: question_answers is where the
-- worked steps are read at reveal time, but questions has plain table-level
-- SELECT for authenticated learners, so a populated questions.steps leaks the
-- worked steps to any sign-in.
--
-- Verified live on 2026-11-15: a probe insert with steps non-null left
-- questions.steps readable (correct_answer/explanation correctly nulled).
--
-- This migration nulls the steps staging column in the trigger after the
-- values are mirrored into question_answers. The CHECK constraint extension
-- lives in the following migration so existing rows can be copied out first.

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

  -- The staging columns never hold the answer or the steps.
  new.correct_answer := null;
  new.explanation    := null;
  new.steps          := null;

  return new;
end;
$$;
