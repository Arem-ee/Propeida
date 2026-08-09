-- Analytics metrics audit fix (2026-08-09).
--
-- get_platform_stats() inflated every marketing counter:
--   * questions_answered counted ALL session_answers rows — including
--     unanswered/skipped questions (4,868 of 12,368 rows had no answer) and
--     answers from abandoned in-progress sessions.
--   * practice_sessions counted ALL exam_sessions rows — 132 of 220 were
--     in-progress (practice sessions never change status).
--   * mock_sessions counted all mock rows, in-progress included.
--   * active_students_30d counted users who merely STARTED a session, even
--     when they abandoned it without finishing.
-- Now: answered-only question counts, sessions with at least one answered
-- question, completed mocks, and "active" = completed a session or answered a
-- daily question in the last 30 days.

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
       union
       select user_id from daily_question_attempts
       where answered_at > now() - interval '30 days'
     ) active_users) as active_students_30d,
    (select count(*) from profiles) as students_total;
$$;

revoke all on function public.get_platform_stats() from public;
grant execute on function public.get_platform_stats() to anon, authenticated;

-- Admin analytics: exact all-time event counts. The admin page used to group
-- only the latest 500 rows, silently undercounting high-volume events.
-- Service-role only (matches the "Admins can read analytics events" policy).
create or replace function public.get_analytics_event_counts()
returns table (event_name text, count bigint)
language sql
security definer
set search_path = public
as $$
  select e.event_name, count(*) as count
  from analytics_events e
  group by e.event_name
  order by count(*) desc;
$$;

revoke all on function public.get_analytics_event_counts() from public, anon, authenticated;
grant execute on function public.get_analytics_event_counts() to service_role;