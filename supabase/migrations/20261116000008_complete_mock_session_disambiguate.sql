-- complete_mock_session is ambiguous after the Tier 5 repair: the OUT
-- table declares `pending_count integer`, and inside the body the
-- per-subject aggregation alias also named its count `pending_count`,
-- so PL/pgSQL matched both and refused the call with
-- "column reference pending_count is ambiguous". Renaming the inner
-- alias fixes it without touching the client-facing return shape.

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

  select coalesce(jsonb_object_agg(subject_id, jsonb_build_object(
    'correct', correct_count,
    'total', total_count,
    'pending', pend_count
  )), '{}'::jsonb)
  into v_performance
  from (
    select q.subject_id::text as subject_id,
           count(*) filter (where sa.is_correct and q.response_type = 'mcq')::integer as correct_count,
           count(*) filter (where q.response_type = 'mcq')::integer as total_count,
           count(*) filter (where q.response_type <> 'mcq')::integer as pend_count
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
