-- Phase 6 teach-deeper: track which misconception each lesson attempt
-- revealed, so repeats can be detected and routed to root-fix content.
-- (Session answers gain the same once session_answers carries a code
-- column; lesson evidence leads because the table is new.)

alter table learning_attempts
  add column if not exists misconception_code text null;
