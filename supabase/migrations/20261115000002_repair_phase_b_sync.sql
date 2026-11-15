-- Repair the Phase-B staging-column protection that the Steps migration
-- accidentally rolled back.
--
-- sync_question_answers() decides whether the questions staging columns may
-- carry the answer. Phase A (20261011000029) moved the answer to
-- question_answers at write time via an AFTER trigger and a
-- NOT NULL / mirror-both policy. Phase B (20261011000030) made the trigger
-- BEFORE, copied the values into question_answers, and then nulled the
-- staging columns itself, which is what the questions_answer_is_staged
-- CHECK constraint is about. The Steps migration rebuilt the function
-- (to sync the new steps column) but dropped those two null-outs; the CHECK
-- then rejected every insert that carried a correct_answer downstream.
-- This repair restores the Phase-B behaviour while keeping the new
-- steps mirror.
--
-- The function is replaced in place. The BEFORE trigger installed by Phase B
-- is untouched.

create or replace function sync_question_answers()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.correct_answer is not null then
    insert into question_answers (question_id, correct_answer, explanation, steps)
    values (new.id, new.correct_answer, new.explanation, new.steps)
    on conflict (question_id) do update
      set correct_answer = excluded.correct_answer,
          explanation = excluded.explanation,
          steps = excluded.steps;
  end if;

  -- The staging columns never hold the answer. They exist only so the
  -- write paths keep working unchanged.
  new.correct_answer := null;
  new.explanation := null;

  return new;
end;
$$;
