-- Phase 2: analytics events + richer inquiry fields.
-- 1. analytics_events: lightweight, public-friendly event collector.
create table if not exists analytics_events (
  id bigint generated always as identity primary key,
  event_name text not null,
  event_data jsonb not null default '{}'::jsonb,
  user_id uuid references auth.users(id) on delete set null,
  url_path text,
  created_at timestamptz not null default now()
);

alter table analytics_events enable row level security;

create policy "Anyone can insert analytics events"
  on analytics_events for insert
  to anon, authenticated
  with check (true);

create policy "Admins can read analytics events"
  on analytics_events for select
  to authenticated
  using (auth.jwt() ->> 'role' = 'service_role');

create index if not exists idx_analytics_events_created_at on analytics_events (created_at desc);
create index if not exists idx_analytics_events_event_name on analytics_events (event_name, created_at desc);

-- 2. Richer inquiry fields on contact_submissions.
alter table contact_submissions add column if not exists full_name text;
alter table contact_submissions add column if not exists phone text;
alter table contact_submissions add column if not exists student_count integer;
alter table contact_submissions add column if not exists organization_type text;

-- 3. Extend platform stats with mock exam sessions (mode = 'mock').
drop function if exists public.get_platform_stats();

create function public.get_platform_stats()
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
    (select count(*) from session_answers) as questions_answered,
    (select count(*) from exam_sessions) as practice_sessions,
    (select count(*) from exam_sessions where mode = 'mock') as mock_sessions,
    (select count(distinct user_id) from exam_sessions where started_at > now() - interval '30 days') as active_students_30d,
    (select count(*) from profiles) as students_total;
$$;

revoke all on function public.get_platform_stats() from public;
grant execute on function public.get_platform_stats() to anon, authenticated;
