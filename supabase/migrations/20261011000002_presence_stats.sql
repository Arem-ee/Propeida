-- Step 3 belonging: aggregate-only presence signals for the dashboard.
-- Security definer: returns counts only, never personal data.
-- UI shows these only above a minimum threshold (small cohorts show
-- nothing rather than an empty room).

create or replace function public.get_presence_stats()
returns table (
  weekly_active_students bigint,
  sessions_this_week bigint,
  secured_this_week bigint
)
language sql
security definer
set search_path = public
as $$
  select
    (select count(distinct user_id) from exam_sessions where started_at > now() - interval '7 days') as weekly_active_students,
    (select count(*) from exam_sessions where started_at > now() - interval '7 days') as sessions_this_week,
    (select count(*) from learner_topic_mastery where status = 'secured' and updated_at > now() - interval '7 days') as secured_this_week;
$$;

revoke all on function public.get_presence_stats() from public;
grant execute on function public.get_presence_stats() to authenticated;
