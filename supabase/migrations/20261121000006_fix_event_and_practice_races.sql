-- Close two race conditions in session handling.
--
-- 1. A user could start two sessions for the same mock event: the app-level
--    "already done" check only looked at completed sessions and two
--    concurrent calls both passed. Enforce one attempt per (event, user)
--    in the database.
--
-- 2. Practice completion updated the session then inserted the result as
--    two separate client writes with no row lock. Two concurrent calls both
--    passed the status check; the loser failed on the unique result row
--    after it had already marked the session completed. Move both writes
--    into one locked, atomic RPC, mirroring complete_mock_session().

-- One attempt per user per mock event. The index is partial so ordinary
-- practice/mock sessions (mock_event_id is null) are unrestricted.
create unique index if not exists exam_sessions_one_per_event_user_idx
  on exam_sessions (mock_event_id, user_id)
  where mock_event_id is not null;

create or replace function complete_practice_session(p_session_id uuid)
returns table (score integer, accuracy numeric, performance_by_subject jsonb, completed_at timestamptz)
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_session exam_sessions%rowtype;
  v_score integer;
  v_total integer;
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

  if not found or v_session.mode <> 'practice' or v_session.status <> 'in_progress' then
    raise exception 'Active practice session not found';
  end if;

  select count(*)::integer,
         count(*) filter (where sa.is_correct)::integer
  into v_total, v_score
  from session_answers sa
  where sa.session_id = p_session_id;

  v_accuracy := case when v_total > 0 then round(v_score::numeric / v_total, 2) else 0 end;

  select coalesce(jsonb_object_agg(subject_id, jsonb_build_object(
    'correct', correct_count,
    'total', total_count
  )), '{}'::jsonb)
  into v_performance
  from (
    select q.subject_id::text as subject_id,
           count(*) filter (where sa.is_correct)::integer as correct_count,
           count(*)::integer as total_count
    from session_answers sa
    join questions q on q.id = sa.question_id
    where sa.session_id = p_session_id
    group by q.subject_id
  ) subject_totals;

  v_completed_at := now();

  update exam_sessions
  set status = 'completed', completed_at = v_completed_at
  where id = p_session_id;

  insert into results (session_id, score, accuracy, performance_by_subject)
  values (p_session_id, v_score, v_accuracy, v_performance);

  return query select v_score, v_accuracy, v_performance, v_completed_at;
end;
$$;

revoke all on function complete_practice_session(uuid) from public, anon;
grant execute on function complete_practice_session(uuid) to authenticated, service_role;
