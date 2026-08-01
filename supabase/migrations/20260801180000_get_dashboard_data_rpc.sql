-- Single-roundtrip dashboard payload: profile, entitlements, streak,
-- recent sessions and today's daily question. Replaces ~8 separate
-- PostgREST roundtrips on every dashboard load.
create or replace function get_dashboard_data(p_user_id uuid)
returns json
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_entitlements json;
  v_result json;
begin
  if p_user_id <> auth.uid() then
    raise exception 'User ID mismatch';
  end if;

  perform ensure_daily_question();

  select coalesce(json_agg(row), '[]'::json)
  into v_entitlements
  from (
    select product, status, expires_at, source
    from entitlements
    where user_id = p_user_id
  ) row;

  select json_build_object(
    'profile', (
      select json_build_object(
        'username', username,
        'referral_code', referral_code,
        'school_id', school_id,
        'ai_features_enabled', ai_features_enabled,
        'is_admin', is_admin,
        'avatar_index', avatar_index
      )
      from profiles
      where id = p_user_id
    ),
    'entitlements', v_entitlements,
    'streak', (
      select json_build_object('current_streak', current_streak, 'longest_streak', longest_streak)
      from streaks
      where user_id = p_user_id
    ),
    'recent_sessions', (
      select coalesce(json_agg(row), '[]'::json)
      from (
        select es.id, es.mode, es.completed_at, e.name as exam_name, r.score, r.accuracy
        from exam_sessions es
        join exams e on e.id = es.exam_id
        join results r on r.session_id = es.id
        where es.user_id = p_user_id
          and es.status = 'completed'
        order by es.completed_at desc
        limit 5
      ) row
    ),
    'daily_question', (
      select json_build_object(
        'id', dq.id,
        'attempt', (
          select json_build_object('is_correct', dqa.is_correct)
          from daily_question_attempts dqa
          where dqa.user_id = p_user_id
            and dqa.daily_question_id = dq.id
        )
      )
      from daily_questions dq
      where dq.date = current_date
    )
  ) into v_result;

  return v_result;
end;
$$;

grant execute on function get_dashboard_data(uuid) to authenticated;
