-- Phase B: the answer leaves questions for good.
--
-- Phase A (20261011000029) created question_answers and mirrored writes
-- into it, but questions.correct_answer and questions.explanation still
-- held their values so every path that read them kept working. This
-- migration finishes the move. It must only run AFTER the code that
-- reads question_answers is deployed.
--
-- 1. The trigger becomes a one-way valve: whatever an admin writes into
--    questions.correct_answer is moved into question_answers and the
--    column is emptied. The staging columns stay so the import, paste,
--    create, edit and clone paths need no change.
-- 2. A CHECK constraint then makes it impossible for those columns to
--    hold a value at all. CHECK is evaluated after BEFORE triggers, so a
--    trigger-mediated write passes, while a write that bypasses the
--    trigger (a raw COPY, or the trigger being disabled) is rejected by
--    the database. This is what makes the staging columns safe to leave
--    readable: they are provably always null.
-- 3. The stale values already in questions are cleared.
-- 4. questions goes back to plain table-level SELECT, so a column added
--    to it in future is readable without touching a grant list.
--
-- Note on column privileges: PostgreSQL cannot deny a column that a
-- role holds through the table. Revoking SELECT on a column that has no
-- column-level grant leaves it readable through the table's grant, so
-- the CHECK constraint, not a revoke, is what keeps the answer out of
-- questions.

create or replace function sync_question_answers()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.correct_answer is not null then
    insert into question_answers (question_id, correct_answer, explanation)
    values (new.id, new.correct_answer, new.explanation)
    on conflict (question_id) do update
      set correct_answer = excluded.correct_answer,
          explanation = excluded.explanation;
  end if;

  -- The staging columns never hold the answer. They exist only so the
  -- existing write paths keep working unchanged.
  new.correct_answer := null;
  new.explanation := null;

  return new;
end;
$$;

drop trigger if exists trg_sync_question_answers on questions;

create trigger trg_sync_question_answers
before insert or update on questions
for each row execute function sync_question_answers();

-- Clear the values the old trigger kept in step. The new trigger skips
-- rows whose answer is null, so this does not blank question_answers.
-- explanation is still NOT NULL from the original schema, and the
-- trigger now empties it, so the constraint has to go first.
alter table questions alter column explanation drop not null;

update questions set correct_answer = null, explanation = null;

-- The answer cannot live in questions. Any write that does not go
-- through the trigger is refused by the database.
alter table questions
  drop constraint if exists questions_answer_is_staged;
alter table questions
  add constraint questions_answer_is_staged
  check (correct_answer is null and explanation is null);

-- questions goes back to plain table-level SELECT: no grant list, and a
-- column added in future is readable with no further ceremony.
revoke select (id, subject_id, exam_id, question_text, options, difficulty, created_at, source, cognitive_level, status, verified_state, verified_by, verified_at, review_note, response_type, rubric_criteria)
  on questions from anon, authenticated;

grant select on questions to anon, authenticated;
