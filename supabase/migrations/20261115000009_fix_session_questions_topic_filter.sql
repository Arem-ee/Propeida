-- Fix the session-question selector when no topic filter is requested.
--
-- 20261113000001 built `selection` only from `tagged` and the fallback branch,
-- and both branches required `p_topic_ids is not null`. Callers that omitted
-- the topic argument therefore got zero rows, which made every mock create an
-- empty session and then fail. An empty array worked because it is not null;
-- the callers now pass one as an immediate workaround until this migration
-- reaches the database.
--
-- The selector now treats NULL and an empty array as "no topic filter" and
-- reads the full published pool. A non-empty topic list still prefers tagged
-- questions and falls back to the full pool only when no tagged question
-- exists. Mock routing and the served-question boundary are unchanged.

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
  response_type text
)
language sql
stable
as $$
  with base as (
    select q.id, q.subject_id, q.question_text, q.options, q.response_type
    from questions q
    where q.exam_id = p_exam_id
      and q.status = 'published'
      and q.response_type = any(coalesce(p_response_types, array['mcq']::text[]))
      and (array_length(p_subject_ids, 1) is null or q.subject_id = any(p_subject_ids))
      and (p_difficulty is null or q.difficulty = p_difficulty)
  ),
  tagged as (
    select distinct base.id, base.subject_id, base.question_text, base.options, base.response_type
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
    -- No topic filter: the whole published pool is eligible.
    select id, subject_id, question_text, options, response_type
    from base
    where coalesce(cardinality(p_topic_ids), 0) = 0
    union
    -- Topic filter with matching tags: serve those first.
    select id, subject_id, question_text, options, response_type
    from tagged
    union
    -- Topic filter with no matching tags: never starve the learner.
    select id, subject_id, question_text, options, response_type
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
  select s.id, s.subject_id, s.question_text, s.options, s.response_type
  from selection s
  where (not exists (select 1 from served u where u.question_id = s.id)
     or (select n from remaining) < p_limit)
  order by md5(s.id::text || p_seed)
  limit p_limit;
$$;

grant execute on function get_session_questions(uuid, uuid[], question_difficulty, integer, text, text[], uuid[]) to authenticated, service_role;
