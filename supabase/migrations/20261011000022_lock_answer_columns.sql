-- Actually lock the answer key.
--
-- 20261011000019 revoked SELECT on questions.correct_answer and
-- questions.explanation at the column level, and it did not work.
-- PostgreSQL resolves a column's privileges from the column's own ACL
-- when one exists, and otherwise from the table's ACL. A REVOKE on a
-- column that only had a table-level grant left the column ACL empty
-- (attacl stayed NULL), so every request fell back to the table grant
-- and the answer key stayed readable. Verified on the live database:
-- pg_attribute.attacl for correct_answer was NULL and
-- has_column_privilege('authenticated', 'questions', 'correct_answer',
-- 'SELECT') was still true.
--
-- The working form is: withdraw the table-level SELECT, then grant it
-- back column by column, leaving the answer columns out. A column-level
-- grant creates a column ACL, and that ACL takes precedence over the
-- table's for those columns.
--
-- The server is unaffected: every path that needs the answer reads it
-- with the service-role client or through a security definer function
-- (get_session_review, get_session_answer_reveal,
-- get_question_review_queue), and neither is limited by this grant.
-- get_session_questions is not a definer, but it only touches columns
-- granted below.
--
-- Any column added to questions in future must be added to the grant
-- list, or it will not be readable by signed-in learners.

revoke select on questions from anon, authenticated;

grant select (
  id,
  subject_id,
  exam_id,
  question_text,
  options,
  difficulty,
  created_at,
  source,
  cognitive_level,
  status,
  verified_state,
  verified_by,
  verified_at,
  review_note,
  response_type,
  rubric_criteria
) on questions to anon, authenticated;
