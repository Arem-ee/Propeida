-- Fix: the staging trigger writes question_answers before the questions
-- row exists.
--
-- The trigger has to run BEFORE, because the CHECK constraint on
-- questions.correct_answer is evaluated after BEFORE triggers, and the
-- trigger is what empties the staging columns. But a BEFORE trigger
-- fires before the row is inserted, so the child row it writes
-- references a parent that does not exist yet, and the foreign key
-- rejects it. Every question write was failing with a 23503.
--
-- The foreign key is therefore deferred to the end of the transaction,
-- by which time the questions row is there. This is the standard
-- PostgreSQL answer for a child row written before its parent.

alter table question_answers
  drop constraint if exists question_answers_question_id_fkey;

alter table question_answers
  add constraint question_answers_question_id_fkey
  foreign key (question_id) references questions(id) on delete cascade
  deferrable initially deferred;

-- The backfill rows were written while the key was immediate, so they
-- are already valid; this only re-asserts the constraint state.
