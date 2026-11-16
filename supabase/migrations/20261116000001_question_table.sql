-- Question media columns, tier 2 of the mock-format build-out.
--
-- Questions carried no picture of anything beyond their text, so a JAMB
-- item with a table ("the table below") reached the learner as a wall of
-- words. Adding `question_table` turns the table into a first-class
-- column on the question itself, readable by every serving path with no
-- fan-out joins.
--
-- Shape (validated by app, not the database):
--   {
--     "headers": ["Units", "Marginal utility"],
--     "rows":    [["1", "100"], ["2", "80"], ["3", "50"]],
--     "caption": "Table 1: The law of diminishing marginal utility"   -- optional
--   }
--
-- The column is nullable and invisible to client writes; nothing else
-- about the question changes.

alter table public.questions
  add column if not exists question_table jsonb null;

comment on column public.questions.question_table is
  'Column headers + rows for tabular question content (JAMB Economics, Statistics, Commerce). Null for non-tabular items. Read by session serving and lessons; served to learners who can see the table.';

-- The session-question selector has to hand the table to the app. Its
-- signature changes, so it is dropped and recreated with the same body
-- plus one added column to the return table. The grant is restored
-- explicitly (CREATE OR REPLACE cannot widen a return type, and DROP
-- removes grants).
drop function if exists get_session_questions(uuid, uuid[], question_difficulty, integer, text, text[], uuid[]);

create function get_session_questions(
  p_exam_id uuid,
  p_subject_ids uuid[],
  p_difficulty question_difficulty default null,
  p_limit integer default 10,
  p_seed text default '',
  p_response_types text[] default array['mcq']::text[],
  p_topic_ids uuid[] default null
)
returns table (
  id uuid,
  subject_id uuid,
  question_text text,
  options jsonb,
  response_type text,
  question_table jsonb
)
language sql
stable
as $$
  with base as (
    select q.id, q.subject_id, q.question_text, q.options, q.response_type, q.question_table
    from questions q
    where q.exam_id = p_exam_id
      and q.status = 'published'
      and q.response_type = any(coalesce(p_response_types, array['mcq']::text[]))
      and (array_length(p_subject_ids, 1) is null or q.subject_id = any(p_subject_ids))
      and (p_difficulty is null or q.difficulty = p_difficulty)
  ),
  tagged as (
    select distinct base.id, base.subject_id, base.question_text, base.options, base.response_type, base.question_table
    from base
    where coalesce(cardinality(p_topic_ids), 0) > 0
      and exists (
        select 1
        from question_topics qt
        where qt.question_id = base.id
          and qt.topic_id = any(p_topic_ids)
          and qt.role in ('practice', 'review')
      )
  ),
  selection as (
    select id, subject_id, question_text, options, response_type, question_table
    from base
    where coalesce(cardinality(p_topic_ids), 0) = 0
    union
    select id, subject_id, question_text, options, response_type, question_table
    from tagged
    union
    select id, subject_id, question_text, options, response_type, question_table
    from base
    where coalesce(cardinality(p_topic_ids), 0) > 0
      and (select count(*) from tagged) = 0
  ),
  served as (
    select distinct sa.question_id
    from session_answers sa
    join exam_sessions es on es.id = sa.session_id
    where es.user_id = auth.uid()
      and es.exam_id = p_exam_id
  ),
  remaining as (
    select count(*)::int as n
    from selection s
    where not exists (select 1 from served u where u.question_id = s.id)
  )
  select s.id, s.subject_id, s.question_text, s.options, s.response_type, s.question_table
  from selection s
  where (not exists (select 1 from served u where u.question_id = s.id)
     or (select n from remaining) < p_limit)
  order by md5(s.id::text || p_seed)
  limit p_limit;
$$;

revoke all on function get_session_questions(uuid, uuid[], question_difficulty, integer, text, text[], uuid[]) from public, anon;
grant execute on function get_session_questions(uuid, uuid[], question_difficulty, integer, text, text[], uuid[]) to authenticated, service_role;
