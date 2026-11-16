-- Mock with derivation/text items, tier 5 of the mock-format build-out.
--
-- JAMB sessions today are MCQ by construction: serving defaults to
-- array['mcq']::text[] and record_session_answer accepts only a-e, so a
-- text/derivation item can never make it into a mock and be scored.
-- That gap closes here:
--
--   1. session_answers learns text_answer (the learner's own words).
--   2. record_session_extended_answer() stores extended answers - the
--      MCQ-only record_session_answer stays untouched for paper flow.
--   3. complete_mock_session() now grades only mcq items. Non-mcq items
--      keep is_correct = NULL (a pending verdict, not an incorrect one)
--      and are reported in the score as pending_count in the results
--      performance_by_subject payload - a subject with 1 derivation shows
--      { correct, total, pending } with total = mcq count only, and
--      pending = the derivation count.
--
-- The session serving default stays mcq-only on purpose: this migration
-- does not let any existing exam set flip to text/derivation by accident.
-- Exams opt in per configuration, then flow completely through the same
-- path.

alter table public.session_answers
  add column if not exists text_answer text null;

comment on column public.session_answers.text_answer is
  'The learner''s own words for a text/derivation item. Graded by review, not by equality; is_correct stays NULL for these items.';

create or replace function record_session_extended_answer(
  p_session_id uuid,
  p_question_id uuid,
  p_text_answer text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from exam_sessions
    where id = p_session_id
      and user_id = auth.uid()
      and status = 'in_progress'
  ) then
    raise exception 'Session is not open';
  end if;

  insert into session_answers (session_id, question_id, selected_answer, text_answer, is_correct)
  values (p_session_id, p_question_id, null, nullif(btrim(p_text_answer), ''), null)
  on conflict (session_id, question_id) do update
    set text_answer = excluded.text_answer,
        selected_answer = null,
        is_correct = null;
end;
$$;

revoke all on function record_session_extended_answer(uuid, uuid, text) from public, anon;
grant execute on function record_session_extended_answer(uuid, uuid, text) to authenticated, service_role;

-- complete_mock_session: only mcq items count toward score and accuracy.
-- Extended items are left ungraded (is_correct IS NULL) and reported as
-- pending in the performance_by_subject payload.

drop function if exists complete_mock_session(uuid);

create function complete_mock_session(p_session_id uuid)
returns table (score integer, accuracy numeric, performance_by_subject jsonb, completed_at timestamptz, pending_count integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session exam_sessions%rowtype;
  v_score integer;
  v_total integer;
  v_pending integer;
  v_accuracy numeric;
  v_performance jsonb;
  v_completed_at timestamptz;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select * into v_session
  from exam_sessions
  where id = p_session_id and user_id = auth.uid()
  for update;

  if not found or v_session.mode <> 'mock' or v_session.status <> 'in_progress' then
    raise exception 'Active mock session not found';
  end if;

  -- Grade only mcq items; extended items stay is_correct IS NULL.
  update session_answers sa
  set is_correct = (sa.selected_answer is not null and sa.selected_answer = qa.correct_answer)
  from question_answers qa
  join questions q on q.id = qa.question_id
  where sa.session_id = p_session_id
    and qa.question_id = sa.question_id
    and q.response_type = 'mcq';

  select count(*) filter (where q.response_type = 'mcq')::integer,
         count(*) filter (where q.response_type = 'mcq' and sa.is_correct)::integer,
         count(*) filter (where q.response_type <> 'mcq')::integer
  into v_total, v_score, v_pending
  from session_answers sa
  join questions q on q.id = sa.question_id
  where sa.session_id = p_session_id;

  v_accuracy := case when v_total > 0 then round(v_score::numeric / v_total, 2) else 0 end;

  select coalesce(jsonb_object_agg(subject_id, jsonb_build_object('correct', correct_count, 'total', total_count, 'pending', pending_count)), '{}'::jsonb)
  into v_performance
  from (
    select q.subject_id::text as subject_id,
           count(*) filter (where sa.is_correct and q.response_type = 'mcq')::integer as correct_count,
           count(*) filter (where q.response_type = 'mcq')::integer as total_count,
           count(*) filter (where q.response_type <> 'mcq')::integer as pending_count
    from session_answers sa
    join questions q on q.id = sa.question_id
    where sa.session_id = p_session_id
    group by q.subject_id
  ) subject_totals;

  v_completed_at := case
    when v_session.time_limit_seconds is not null
      and now() > v_session.started_at + make_interval(secs => v_session.time_limit_seconds)
    then v_session.started_at + make_interval(secs => v_session.time_limit_seconds)
    else now()
  end;

  update exam_sessions
  set status = 'completed', completed_at = v_completed_at
  where id = p_session_id;

  insert into results (session_id, score, accuracy, performance_by_subject)
  values (p_session_id, v_score, v_accuracy, v_performance);

  return query select v_score, v_accuracy, v_performance, v_completed_at, v_pending;
end;
$$;

revoke all on function complete_mock_session(uuid) from public, anon;
grant execute on function complete_mock_session(uuid) to authenticated, service_role;
