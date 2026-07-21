create or replace function has_pro_access(p_subscription_status subscription_status, p_subscription_expires_at timestamptz)
returns boolean
language sql
stable
as $$
  select p_subscription_status = 'pro' or (p_subscription_status = 'pro_trial' and p_subscription_expires_at is not null and p_subscription_expires_at > now());
$$;

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_username text;
  v_referral_code text;
begin
  v_username := 'user_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);
  v_referral_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  while exists (select 1 from profiles where username = v_username) loop
    v_username := 'user_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);
  end loop;

  while exists (select 1 from profiles where referral_code = v_referral_code) loop
    v_referral_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  end loop;

  insert into profiles (id, username, referral_code)
  values (new.id, v_username, v_referral_code);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function handle_new_user();

create or replace function update_leaderboard()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_user_id uuid;
  v_school_id uuid;
begin
  select es.user_id, p.school_id into v_user_id, v_school_id
  from exam_sessions es
  join profiles p on p.id = es.user_id
  where es.id = new.session_id;

  insert into leaderboard_entries (user_id, school_id, score, period, updated_at)
  values (
    v_user_id,
    v_school_id,
    (select coalesce(sum(r.score), 0) from results r
     join exam_sessions es on es.id = r.session_id
     where es.user_id = v_user_id and es.status = 'completed'),
    'all_time',
    now()
  )
  on conflict (user_id, period) do update set
    score = excluded.score,
    school_id = excluded.school_id,
    updated_at = excluded.updated_at;

  insert into leaderboard_entries (user_id, school_id, score, period, updated_at)
  values (
    v_user_id,
    v_school_id,
    (select coalesce(sum(r.score), 0) from results r
     join exam_sessions es on es.id = r.session_id
     where es.user_id = v_user_id and es.status = 'completed'
       and es.completed_at >= date_trunc('week', now())),
    'weekly',
    now()
  )
  on conflict (user_id, period) do update set
    score = excluded.score,
    school_id = excluded.school_id,
    updated_at = excluded.updated_at;

  return new;
end;
$$;

create trigger on_result_created
  after insert on results
  for each row
  execute function update_leaderboard();
