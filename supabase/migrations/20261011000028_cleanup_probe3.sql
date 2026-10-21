-- Remove the developer-path probe: the test question and the table that
-- recorded the RLS/grant state.

delete from questions where question_text = 'DEVSQL PROBE';

drop table if exists public._probe3;
