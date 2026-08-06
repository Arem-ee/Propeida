-- Public, aggregate-only platform statistics for the marketing site.
-- Security definer: returns counts only, never personal data.
-- Used by /api/stats for the "Questions practiced" counter and
-- community metrics on the landing page.
create or replace function public.get_platform_stats()
returns table (
  questions_answered bigint,
  practice_sessions bigint,
  active_students_30d bigint,
  students_total bigint
)
language sql
security definer
set search_path = public
as $$
  select
    (select count(*) from session_answers) as questions_answered,
    (select count(*) from exam_sessions) as practice_sessions,
    (select count(distinct user_id) from exam_sessions where started_at > now() - interval '30 days') as active_students_30d,
    (select count(*) from profiles) as students_total;
$$;

revoke all on function public.get_platform_stats() from public;
grant execute on function public.get_platform_stats() to anon, authenticated;
