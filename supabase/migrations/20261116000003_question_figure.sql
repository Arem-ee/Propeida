-- Question media columns, tier 4 of the mock-format build-out.
--
-- JAMB seats a visibly large fraction of Geometry, Statistics and CDS on
-- figure-based items ("in the figure above" with no figure). The bank
-- could not carry a figure, and the player could not draw one.
--
-- `question_figure` stores a small descriptor pointing at a public
-- Storage object:
--   {
--     "src":  "questions/<question-id>/figure-1.svg",
--     "alt":  "A semi-circular diagram showing centre O...",
--     "width": 640, "height": 420,
--     "caption": "Figure 1"   -- optional
--   }
--
-- The Storage bucket is created at migration time. Reads are public by
-- design: figures are not secret, they are part of published questions.
-- Writes are admin-only, mirroring the question editorial gate.

insert into storage.buckets (id, name, public)
values ('question-figures', 'question-figures', true)
on conflict (id) do nothing;

alter table public.questions
  add column if not exists question_figure jsonb null;

comment on column public.questions.question_figure is
  'Descriptor for a Storage-hosted figure for the item (src/alt/width/height/caption). Public bucket question-figures; rendered inline by the players.';

create policy "authenticated learners read question figures"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'question-figures');

create policy "admin write question figures"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'question-figures'
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin)
  );

create policy "admin update question figures"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'question-figures'
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin)
  );

create policy "admin delete question figures"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'question-figures'
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin)
  );

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
  question_passage jsonb,
  question_figure jsonb
)
language sql
stable
as $$
  with base as (
    select q.id, q.subject_id, q.question_text, q.options, q.response_type,
           q.question_table, q.question_passage, q.question_figure
    from questions q
    where q.exam_id = p_exam_id
      and q.status = 'published'
      and q.response_type = any(coalesce(p_response_types, array['mcq']::text[]))
      and (array_length(p_subject_ids, 1) is null or q.subject_id = any(p_subject_ids))
      and (p_difficulty is null or q.difficulty = p_difficulty)
  ),
  tagged as (
    select distinct base.id, base.subject_id, base.question_text, base.options, base.response_type,
           base.question_table, base.question_passage, base.question_figure
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
    select id, subject_id, question_text, options, response_type,
           question_table, question_passage, question_figure
    from base
    where coalesce(cardinality(p_topic_ids), 0) = 0
    union
    select id, subject_id, question_text, options, response_type,
           question_table, question_passage, question_figure
    from tagged
    union
    select id, subject_id, question_text, options, response_type,
           question_table, question_passage, question_figure
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
  select s.id, s.subject_id, s.question_text, s.options, s.response_type,
         s.question_table, s.question_passage, s.question_figure
  from selection s
  where (not exists (select 1 from served u where u.question_id = s.id)
     or (select n from remaining) < p_limit)
  order by md5(s.id::text || p_seed)
  limit p_limit;
$$;

revoke all on function get_session_questions(uuid, uuid[], question_difficulty, integer, text, text[], uuid[]) from public, anon;
grant execute on function get_session_questions(uuid, uuid[], question_difficulty, integer, text, text[], uuid[]) to authenticated, service_role;
