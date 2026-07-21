create or replace function update_leaderboard()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_user_id uuid;
  v_school_id uuid;
  v_total_correct numeric;
  v_total_questions numeric;
  v_bayesian_score numeric;
begin
  select es.user_id, p.school_id into v_user_id, v_school_id
  from exam_sessions es
  join profiles p on p.id = es.user_id
  where es.id = new.session_id;

  select
    coalesce(sum(r.score), 0),
    coalesce(sum(round(r.score / nullif(r.accuracy, 0))), 0)
  into v_total_correct, v_total_questions
  from results r
  join exam_sessions es on es.id = r.session_id
  where es.user_id = v_user_id and es.status = 'completed';

  v_bayesian_score := round((v_total_correct + 5) / (v_total_questions + 10) * 100, 2);

  insert into leaderboard_entries (user_id, school_id, score, period, updated_at)
  values (v_user_id, v_school_id, v_bayesian_score, 'all_time', now())
  on conflict (user_id, period) do update set
    score = excluded.score,
    school_id = excluded.school_id,
    updated_at = excluded.updated_at;

  select
    coalesce(sum(r.score), 0),
    coalesce(sum(round(r.score / nullif(r.accuracy, 0))), 0)
  into v_total_correct, v_total_questions
  from results r
  join exam_sessions es on es.id = r.session_id
  where es.user_id = v_user_id and es.status = 'completed'
    and es.completed_at >= date_trunc('week', now());

  v_bayesian_score := round((v_total_correct + 5) / (v_total_questions + 10) * 100, 2);

  insert into leaderboard_entries (user_id, school_id, score, period, updated_at)
  values (v_user_id, v_school_id, v_bayesian_score, 'weekly', now())
  on conflict (user_id, period) do update set
    score = excluded.score,
    school_id = excluded.school_id,
    updated_at = excluded.updated_at;

  return new;
end;
$$;

create or replace function ensure_daily_question()
returns void
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_today date;
  v_question_id uuid;
begin
  v_today := current_date;

  if exists (select 1 from daily_questions where date = v_today) then
    return;
  end if;

  select q.id into v_question_id
  from questions q
  where q.id not in (
    select dq.question_id from daily_questions dq
    where dq.date >= v_today - 30
  )
  order by random()
  limit 1;

  if v_question_id is null then
    select q.id into v_question_id
    from questions q
    order by random()
    limit 1;
  end if;

  insert into daily_questions (question_id, date)
  values (v_question_id, v_today);
end;
$$;

create or replace function update_streak(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_last_activity date;
  v_current_streak integer;
  v_longest_streak integer;
begin
  select last_activity_date, current_streak, longest_streak
  into v_last_activity, v_current_streak, v_longest_streak
  from streaks
  where user_id = p_user_id;

  if not found then
    insert into streaks (user_id, current_streak, longest_streak, last_activity_date)
    values (p_user_id, 1, 1, current_date);
    return;
  end if;

  if v_last_activity = current_date then
    return;
  end if;

  if v_last_activity = current_date - 1 then
    v_current_streak := v_current_streak + 1;
  else
    v_current_streak := 1;
  end if;

  if v_current_streak > v_longest_streak then
    v_longest_streak := v_current_streak;
  end if;

  update streaks
  set current_streak = v_current_streak,
      longest_streak = v_longest_streak,
      last_activity_date = current_date
  where user_id = p_user_id;
end;
$$;

create or replace function grant_referral_reward(p_referrer_id uuid)
returns void
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_current_status subscription_status;
begin
  select subscription_status into v_current_status
  from profiles
  where id = p_referrer_id;

  if v_current_status = 'pro' then
    return;
  end if;

  update profiles
  set subscription_status = 'pro_trial',
      subscription_expires_at = now() + interval '7 days'
  where id = p_referrer_id
    and (subscription_expires_at is null or subscription_expires_at < now() + interval '7 days');
end;
$$;

create or replace function get_user_leaderboard_rank(p_user_id uuid, p_period leaderboard_period)
returns integer
language sql
stable
as $$
  select count(*)::integer + 1
  from leaderboard_entries
  where period = p_period
    and score > (select coalesce(score, 0) from leaderboard_entries where user_id = p_user_id and period = p_period);
$$;
