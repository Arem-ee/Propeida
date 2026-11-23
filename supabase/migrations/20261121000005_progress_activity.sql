-- One round trip for the Activity panel: 30 days of learning activity plus
-- the current due-review backlog. All counts are user-scoped and guarded by
-- auth.uid(); no other learner's activity is reachable.

create or replace function get_progress_activity(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_days jsonb;
  v_due integer;
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'Authentication required';
  end if;

  with day_series as (
    select generate_series(
      current_date - interval '29 days',
      current_date,
      interval '1 day'
    )::date as day
  ),
  events as (
    select completed_at as happened_at
      from exam_sessions
     where user_id = p_user_id and completed_at is not null
    union all
    select created_at from learning_attempts where user_id = p_user_id
    union all
    select created_at from lesson_reflections where user_id = p_user_id
    union all
    select answered_at from daily_question_attempts where user_id = p_user_id
  ),
  counts as (
    select happened_at::date as day, count(*)::integer as n
    from events
    where happened_at >= current_date - interval '29 days'
    group by 1
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object('day', d.day::text, 'count', coalesce(c.n, 0))
      order by d.day
    ),
    '[]'::jsonb
  )
    into v_days
    from day_series d
    left join counts c on c.day = d.day;

  select count(*)::integer into v_due
  from review_queue
  where user_id = p_user_id and state = 'due';

  return jsonb_build_object('days', v_days, 'due', v_due);
end;
$$;

revoke all on function get_progress_activity(uuid) from public, anon;
grant execute on function get_progress_activity(uuid) to authenticated, service_role;
