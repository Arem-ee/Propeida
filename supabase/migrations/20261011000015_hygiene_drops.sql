-- Hygiene: drop systems the product killed.
--
-- Leaderboard: removed from the product (belonging without ranks). The
-- trigger, functions, and table served no UI since the wipe.
-- Explore: surface deleted; interaction table dormant.
-- Daily question: explicitly forbidden by the product (no daily
-- questions, no login-streak pressure). Engine, tables, and dashboard
-- block removed; nothing in app code renders it.
-- profiles.avatar_index: avatar picker removed; identity is the initial.

-- 0. RLS policies pin their tables; drop them first.
drop policy if exists "leaderboard readable by authenticated" on leaderboard_entries;
drop policy if exists "users can delete their own explore interactions" on explore_interactions;
drop policy if exists "users can insert their own explore interactions" on explore_interactions;
drop policy if exists "users can read their own explore interactions" on explore_interactions;
drop policy if exists "users can read own daily question attempts" on daily_question_attempts;
drop policy if exists "daily_questions are publicly readable" on daily_questions;

-- 1. Leaderboard trigger + functions + table.
drop trigger if exists trg_update_leaderboard on results;
drop function if exists update_leaderboard();
drop function if exists recompute_leaderboard_entries();
drop function if exists get_leaderboard(p_period leaderboard_period, p_exam_id uuid);
drop function if exists get_user_leaderboard_rank(p_user_id uuid, p_period leaderboard_period);
drop function if exists get_user_leaderboard_rank(p_user_id uuid, p_period leaderboard_period, p_exam_id uuid);
drop view if exists public_leaderboard_top10;
drop table if exists leaderboard_entries;

-- 2. Explore leftovers.
drop table if exists explore_interactions;

-- 3. Dead profile column.
alter table profiles drop column if exists avatar_index;

-- 4. Daily-question engine.
drop function if exists submit_daily_question_answer(p_daily_question_id uuid, p_selected_answer text);
drop function if exists get_daily_question_reveal(p_daily_question_id uuid);
drop function if exists ensure_daily_question();
drop table if exists daily_question_attempts;
drop table if exists daily_questions;

-- 5. Dashboard payload without the daily block or avatar index.
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
        'is_admin', is_admin
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
    )
  ) into v_result;

  return v_result;
end;
$$;

-- 6. Platform stats: "active" is completed-session activity only. The
-- daily-attempt leg died with its table.
create or replace function public.get_platform_stats()
returns table (
  questions_answered bigint,
  practice_sessions bigint,
  mock_sessions bigint,
  active_students_30d bigint,
  students_total bigint
)
language sql
security definer
set search_path = public
as $$
  select
    (select count(*) from session_answers where selected_answer is not null) as questions_answered,
    (select count(*) from exam_sessions es
       where es.mode = 'practice'
         and exists (select 1 from session_answers sa
                     where sa.session_id = es.id and sa.selected_answer is not null)) as practice_sessions,
    (select count(*) from exam_sessions where mode = 'mock' and status = 'completed') as mock_sessions,
    (select count(*) from (
       select user_id from exam_sessions
       where status = 'completed' and completed_at > now() - interval '30 days'
     ) active_users) as active_students_30d,
    (select count(*) from profiles) as students_total;
$$;
