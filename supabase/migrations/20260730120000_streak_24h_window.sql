alter table streaks
  rename column last_activity_date to last_activity_at;

alter table streaks
  alter column last_activity_at type timestamptz using last_activity_at::timestamptz;

alter table streaks
  add column streak_started_at timestamptz;

update streaks
  set last_activity_at = null
  where current_streak = 0;

update streaks
  set streak_started_at = last_activity_at - (current_streak - 1) * interval '1 day'
  where current_streak > 0 and last_activity_at is not null;

drop function if exists update_streak;

create or replace function update_streak(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_last_activity timestamptz;
  v_current_streak integer;
  v_longest_streak integer;
  v_streak_started timestamptz;
begin
  select last_activity_at, current_streak, longest_streak, streak_started_at
  into v_last_activity, v_current_streak, v_longest_streak, v_streak_started
  from streaks
  where user_id = p_user_id;

  if not found then
    insert into streaks (user_id, current_streak, longest_streak, last_activity_at, streak_started_at)
    values (p_user_id, 1, 1, now(), now());
    return;
  end if;

  if v_last_activity is not null and now() - v_last_activity < interval '24 hours' then
    return;
  end if;

  if v_last_activity is not null and now() - v_last_activity < interval '48 hours' then
    v_current_streak := v_current_streak + 1;
  else
    v_current_streak := 1;
    v_streak_started := now();
  end if;

  if v_current_streak > v_longest_streak then
    v_longest_streak := v_current_streak;
  end if;

  update streaks
  set current_streak = v_current_streak,
      longest_streak = v_longest_streak,
      last_activity_at = now(),
      streak_started_at = coalesce(v_streak_started, streak_started_at)
  where user_id = p_user_id;
end;
$$;
