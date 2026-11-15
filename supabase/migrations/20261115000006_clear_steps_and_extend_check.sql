-- Clear the staging columns on questions rows that were seeded with the
-- Mathematics pilot bank before the trigger learned to null steps.
--
-- All 32 affected rows were verified 2026-11-15 to be fully mirrored in
-- question_answers (correct_answer, explanation, and steps all present).
-- The staging columns are redundant copies: clearing them loses nothing.
--
-- Afterwards, extend the proof-null CHECK so this cannot silently regress:
-- a populated steps staging column would be readable by every learner.

update questions
set correct_answer = null,
    explanation   = null,
    steps          = null
where correct_answer is not null
   or explanation is not null
   or steps is not null;

alter table questions
  drop constraint if exists questions_answer_is_staged;
alter table questions
  add constraint questions_answer_is_staged
  check (correct_answer is null and explanation is null and steps is null);
