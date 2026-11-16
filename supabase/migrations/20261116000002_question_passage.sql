-- Question media columns, tier 3 of the mock-format build-out.
--
-- JAMB comprehension sections put a reading passage in the booklet and
-- then ask several questions about it. The question bank never could
-- serve that: stems either inlined the whole passage as a wall of text,
-- or said "the passage below" while carrying no passage at all.
--
-- `question_passage` carries the passage inline with the item. Shape
-- (validated in app, not the database):
--   {
--     "title": "Comprehension passage",   -- optional
--     "text":  "The passage, in full prose.\n\nSecond paragraph.\n..."
--   }
--
-- Questions that belong to the same passage duplicate the identical
-- passage object on every item. Reads are cheap; rendering the same
-- passage four times is the correct behaviour and matches a repeated
-- header in print.

alter table public.questions
  add column if not exists question_passage jsonb null;

comment on column public.questions.question_passage is
  'Inline JAMB-style comprehension passage for the item. Null for non-comprehension items. Read by session serving and lessons; rendered above the stem when present.';

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
  question_table jsonb,
  question_passage jsonb
)
language sql
stable
as $$
  with base as (
    select q.id, q.subject_id, q.question_text, q.options, q.response_type, q.question_table, q.question_passage
    from questions q
    where q.exam_id = p_exam_id
      and q.status = 'published'
      and q.response_type = any(coalesce(p_response_types, array['mcq']::text[]))
      and (array_length(p_subject_ids, 1) is null or q.subject_id = any(p_subject_ids))
      and (p_difficulty is null or q.difficulty = p_difficulty)
  ),
  tagged as (
    select distinct base.id, base.subject_id, base.question_text, base.options, base.response_type, base.question_table, base.question_passage
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
    select id, subject_id, question_text, options, response_type, question_table, question_passage
    from base
    where coalesce(cardinality(p_topic_ids), 0) = 0
    union
    select id, subject_id, question_text, options, response_type, question_table, question_passage
    from tagged
    union
    select id, subject_id, question_text, options, response_type, question_table, question_passage
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
  select s.id, s.subject_id, s.question_text, s.options, s.response_type, s.question_table, s.question_passage
  from selection s
  where (not exists (select 1 from served u where u.question_id = s.id)
     or (select n from remaining) < p_limit)
  order by md5(s.id::text || p_seed)
  limit p_limit;
$$;

revoke all on function get_session_questions(uuid, uuid[], question_difficulty, integer, text, text[], uuid[]) from public, anon;
grant execute on function get_session_questions(uuid, uuid[], question_difficulty, integer, text, text[], uuid[]) to authenticated, service_role;
