-- Step 5 cohort: exam cycles with honest dates + per-exam presence.
--
-- Dates are admin-editable rows, never constants: the 2027 JAMB window is
-- genuinely disputed (March 15-25 proposed by FG communique vs April 16-25
-- in secondary guides; JAMB itself only confirms a November registration
-- announcement). starts_at stays NULL until an official source confirms;
-- verified=false rows never render countdowns.

create table exam_cycles (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references exams(id) on delete cascade,
  year integer not null check (year >= 2000 and year <= 2100),
  starts_at timestamptz null,
  ends_at timestamptz null,
  verified boolean not null default false,
  source text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (exam_id, year)
);

alter table exam_cycles enable row level security;

-- Everyone reads the calendar; only service-role (admin) writes.
create policy "anyone reads exam cycles"
  on exam_cycles for select
  to anon, authenticated
  using (true);

-- Per-exam cohort presence: aggregate counts only, never people.
create or replace function public.get_cohort_stats(p_exam_id uuid)
returns table (
  weekly_active_students bigint,
  sessions_this_week bigint
)
language sql
security definer
set search_path = public
as $$
  select
    (select count(distinct user_id) from exam_sessions where exam_id = p_exam_id and started_at > now() - interval '7 days') as weekly_active_students,
    (select count(*) from exam_sessions where exam_id = p_exam_id and started_at > now() - interval '7 days') as sessions_this_week;
$$;

revoke all on function public.get_cohort_stats(uuid) from public;
grant execute on function public.get_cohort_stats(uuid) to authenticated;

-- Nearest upcoming cycle per exam (verified or not; UI decides display).
create or replace function public.get_upcoming_cycles()
returns table (
  exam_id uuid,
  exam_name text,
  exam_slug text,
  year integer,
  starts_at timestamptz,
  verified boolean
)
language sql
security definer
set search_path = public
as $$
  select distinct on (c.exam_id)
    c.exam_id, e.name, e.slug, c.year, c.starts_at, c.verified
  from exam_cycles c
  join exams e on e.id = c.exam_id
  order by c.exam_id, c.year desc;
$$;

revoke all on function public.get_upcoming_cycles() from public;
grant execute on function public.get_upcoming_cycles() to anon, authenticated;
