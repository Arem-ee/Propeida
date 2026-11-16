-- Performance indexes identified by the production audit.
--
-- The hottest filters in the app have no index anywhere:
--
--   questions(exam_id, status)          every session deal, bank presence
--                                         probes, deepest-bank counts
--   user_exam_free_pools(question_id)   the questions RLS free-pool branch
--                                         probes this per question row
--   session_answers(question_id)          per wrong answer: struggle-pct
--                                         counts (two count-exact queries)
--   exam_sessions(started_at)             presence/cohort/ghost-nudge and
--                                         30-day stats all scan on time
--
-- Additive only. Safe to apply; questions() access patterns are unchanged,
-- the planner simply gains better paths. Use plain CREATE INDEX (not
-- CONCURRENTLY) so the statement is transactional on empty/small tables;
-- on a busy production database apply during low traffic.

create index if not exists questions_exam_status_idx
  on public.questions (exam_id, status);

create index if not exists user_exam_free_pools_question_idx
  on public.user_exam_free_pools (question_id);

create index if not exists session_answers_question_idx
  on public.session_answers (question_id);

create index if not exists exam_sessions_started_at_idx
  on public.exam_sessions (started_at);
