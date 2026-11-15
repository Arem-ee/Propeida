-- The mock review boundary, moved into the database.
--
-- The app fork (2026-11-15) hides question content from mock results in the
-- UI, but the two owner-facing RPCs still handed the whole paper and the key
-- to any authenticated caller who completed a mock and asked directly. The
-- server is the boundary that counts, so the server now keeps the papers
-- closed:
--
--   1. get_session_review is the practice-feedback instrument. Mock sessions
--      get zero rows at every stage: in progress and completed.
--   2. get_session_answer_reveal is gated to recorded practice answers only.
--      Completion no longer opens the mock.
--   3. Mock telemetry is served by a new definer function,
--      get_session_topic_breakdown, which returns aggregate topic rows and
--      never question ids, stems, options, answers, explanations or steps.

drop function if exists public.get_session_review(uuid);

create or replace function public.get_session_review(p_session_id uuid)
returns table (
  question_id uuid,
  subject_id uuid,
  question_text text,
  options jsonb,
  selected_answer text,
  is_correct boolean,
  correct_answer text,
  explanation text,
  steps jsonb,
  time_taken_seconds integer
)
language sql
security definer
set search_path = public
as $$
  select q.id, q.subject_id, q.question_text, q.options, sa.selected_answer,
         sa.is_correct, qa.correct_answer, qa.explanation, qa.steps, sa.time_taken_seconds
  from exam_sessions es
  join session_answers sa on sa.session_id = es.id
  join questions q on q.id = sa.question_id
  join question_answers qa on qa.question_id = q.id
  where es.id = p_session_id
    and es.user_id = auth.uid()
    and es.mode = 'practice'
    and es.status = 'completed'
  order by sa.id;
$$;

drop function if exists public.get_session_answer_reveal(uuid, uuid);

create or replace function public.get_session_answer_reveal(p_session_id uuid, p_question_id uuid)
returns table (correct_answer text, explanation text, steps jsonb)
language sql
security definer
set search_path = public
as $$
  select qa.correct_answer, qa.explanation, qa.steps
  from exam_sessions es
  join session_answers sa on sa.session_id = es.id and sa.question_id = p_question_id
  join question_answers qa on qa.question_id = sa.question_id
  where es.id = p_session_id
    and es.user_id = auth.uid()
    and es.mode = 'practice'
    and sa.selected_answer is not null;
$$;

-- Mock telemetry only: topic aggregates for the learner's own completed
-- mock. No question ids, no option keys, no right/wrong per item, no
-- answer-bearing columns of any kind.
create or replace function public.get_session_topic_breakdown(p_session_id uuid)
returns table (
  slug text,
  name text,
  subject_slug text,
  subject_name text,
  miss_count integer,
  total integer,
  accuracy_pct integer
)
language sql
security definer
set search_path = public
as $$
  with scoped as (
    select distinct sa.question_id, qt.topic_id, sa.is_correct
    from exam_sessions es
    join session_answers sa on sa.session_id = es.id
    join question_topics qt on qt.question_id = sa.question_id
    where es.id = p_session_id
      and es.user_id = auth.uid()
      and es.status = 'completed'
      and es.mode = 'mock'
  ),
  agg as (
    select topic_id,
           count(*)::integer as total,
           count(*) filter (where is_correct is true)::integer as right_count
    from scoped
    group by topic_id
  )
  select t.slug,
         t.name,
         s.slug as subject_slug,
         s.name as subject_name,
         (a.total - a.right_count)::integer as miss_count,
         a.total,
         case when a.total > 0
              then round((a.right_count::numeric / a.total) * 100)::integer
              else 0 end as accuracy_pct
  from agg a
  join topics t on t.id = a.topic_id
  join subjects s on s.id = t.subject_id
  where a.total - a.right_count > 0
  order by miss_count desc, total desc, t.name asc
  limit 6;
$$;

revoke all on function public.get_session_review(uuid) from public, anon;
revoke all on function public.get_session_answer_reveal(uuid, uuid) from public, anon;
revoke all on function public.get_session_topic_breakdown(uuid) from public, anon;
grant execute on function public.get_session_review(uuid) to authenticated, service_role;
grant execute on function public.get_session_answer_reveal(uuid, uuid) to authenticated, service_role;
grant execute on function public.get_session_topic_breakdown(uuid) to authenticated, service_role;
