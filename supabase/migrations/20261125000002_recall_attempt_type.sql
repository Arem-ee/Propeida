-- Repair: the recall_cards migration (20261107000009) documents marks as
-- learning_attempts with attempt_type 'recall', but the original constraint
-- from 20261011000005 allowed only diagnostic/supported/independent. Every
-- recall mark has been rejected by the check constraint since launch.
--
-- Widen the constraint to include 'recall'. No data rewrite: rows using the
-- old three values are unaffected; no new rows are backfilled.

alter table public.learning_attempts
  drop constraint if exists learning_attempts_attempt_type_check;

alter table public.learning_attempts
  add constraint learning_attempts_attempt_type_check
  check (attempt_type in ('diagnostic', 'supported', 'independent', 'recall'));
