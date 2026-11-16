-- Repair for 20261116000004_mock_text_grading. The first push attempt
-- aborted at the `create or replace` on complete_mock_session (SQLSTATE
-- 42P13 - you cannot change the OUT parameters of a table function), and
-- supabase_migrations.schema_migrations already carries version
-- 20261116000004 with a partially-applied body. Rather than edit history,
-- bring the database to the intended final state with one migration that
-- is idempotent end to end.

alter table public.session_answers
  add column if not exists text_answer text null;

-- Same grant contract as everywhere else: definer functions for the app
-- surface revoke from anon, grant to authenticated and service_role.

drop function if exists record_session_extended_answer(uuid, uuid, text);

create function record_session_extended_answer(
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
