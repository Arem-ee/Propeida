-- 24-Hour Full Question Bank Unlock campaign.
--
-- Design:
--   * campaigns        — one row per campaign (slug, window, include_new_users).
--   * campaign_access  — per-user grant rows with an absolute expires_at.
--   * Access is TIME-BASED ONLY: has_campaign_access() is true iff the user
--     has a grant row whose expires_at > now() AND the campaign window is
--     still open (ends_at > now()). Nothing is ever written to the
--     entitlements/profiles tables, so Pro/subscription state is untouched.
--   * start_campaign() takes a snapshot of every eligible existing user
--     (confirmed, non-banned, role=authenticated) and grants each a row with
--     expires_at = starts_at + p_hours. Users who sign up after the start are
--     NOT granted automatically; only start_campaign(p_include_new_users =>
--     true) also covers users created inside the campaign window.
--   * End early with end_campaign() (sets ends_at = now()), which instantly
--     revokes access through the same time-based checks.
--
-- Enforcement layers:
--   1. Server actions: hasExamAccess() (lib/entitlements.ts) also returns
--      true for campaign users, so createSession() serves the FULL question
--      bank instead of the free pool.
--   2. DB RLS: the questions SELECT policy includes a campaign branch (via
--      has_campaign_access()), so get_session_questions() — which runs under
--      caller RLS — returns complete bank rows for campaign users.

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  include_new_users boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.campaign_access (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  granted_at timestamptz not null default now(),
  expires_at timestamptz not null,
  unique (user_id, campaign_id)
);

create index idx_campaign_access_user on public.campaign_access (user_id, expires_at);
create index idx_campaign_access_campaign on public.campaign_access (campaign_id);

-- Default grants: nothing is exposed until explicitly granted below.
drop policy if exists "campaigns are readable" on public.campaigns;
drop policy if exists "campaign_access is readable by owner" on public.campaign_access;

alter table public.campaigns enable row level security;
alter table public.campaign_access enable row level security;

-- Authenticated users may read campaign metadata (for status banners) and
-- their own grant rows (for the expired-access screen). No client writes.
create policy "campaigns are readable"
  on public.campaigns for select to authenticated
  using (true);

create policy "campaign_access is readable by owner"
  on public.campaign_access for select to authenticated
  using (user_id = auth.uid());

revoke all on public.campaigns from anon;
revoke all on public.campaign_access from anon;

-- ----------------------------------------------------------------------------
-- start_campaign: create/reopen a campaign and grant every eligible existing
-- user (snapshot at start time) a 24h (configurable) access row.
-- ----------------------------------------------------------------------------
create or replace function public.start_campaign(
  p_slug text,
  p_name text,
  p_hours integer default 24,
  p_include_new_users boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_campaign_id uuid;
  v_starts_at timestamptz := now();
  v_ends_at timestamptz := now() + make_interval(hours => p_hours);
begin
  if p_slug is null or p_slug = '' or p_name is null or p_name = '' then
    raise exception 'slug and name are required';
  end if;
  if p_hours < 1 or p_hours > 168 then
    raise exception 'p_hours must be between 1 and 168';
  end if;

  insert into public.campaigns (slug, name, starts_at, ends_at, include_new_users)
  values (p_slug, p_name, v_starts_at, v_ends_at, p_include_new_users)
  on conflict (slug) do update set
    starts_at = v_starts_at,
    ends_at = v_ends_at,
    include_new_users = p_include_new_users,
    updated_at = now()
  returning id into v_campaign_id;

  -- Snapshot grant: every eligible user that exists at start time.
  insert into public.campaign_access (campaign_id, user_id, granted_at, expires_at)
  select v_campaign_id, u.id, v_starts_at, v_ends_at
  from auth.users u
  where u.role = 'authenticated'
    and u.banned_until is null
    and u.email_confirmed_at is not null
    and not exists (
      select 1 from public.campaign_access ca
      where ca.campaign_id = v_campaign_id and ca.user_id = u.id
    );

  return v_campaign_id;
end;
$$;

-- ----------------------------------------------------------------------------
-- end_campaign: end the campaign immediately. Because every access check
-- compares ends_at > now(), this revokes access right away (no row deletes —
-- the rows remain so the "expired recently" UI can show the upgrade screen).
-- ----------------------------------------------------------------------------
create or replace function public.end_campaign(p_slug text)
returns timestamptz
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_ends_at timestamptz;
begin
  update public.campaigns
  set ends_at = now(), updated_at = now()
  where slug = p_slug and ends_at > now()
  returning ends_at into v_ends_at;

  if v_ends_at is null then
    raise exception 'No active campaign with slug %', p_slug;
  end if;

  return v_ends_at;
end;
$$;

-- ----------------------------------------------------------------------------
-- has_campaign_access: the single source of truth for "does this user have
-- temporary full-bank access right now" (time-based, both row and window).
-- Used by lib/entitlements.ts and by the questions RLS policy.
-- ----------------------------------------------------------------------------
create or replace function public.has_campaign_access()
returns boolean
language plpgsql
stable
security definer
set search_path = 'public'
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    return false;
  end if;

  return exists (
    select 1
    from public.campaign_access ca
    join public.campaigns c on c.id = ca.campaign_id
    where ca.user_id = v_uid
      and ca.expires_at > now()
      and c.ends_at > now()
  ) or exists (
    -- Optional: users who signed up DURING the campaign window.
    select 1
    from public.campaigns c
    join auth.users u on u.id = v_uid
    where c.include_new_users
      and c.ends_at > now()
      and u.created_at >= c.starts_at
      and u.created_at <= c.ends_at
      and u.role = 'authenticated'
      and u.banned_until is null
      and u.email_confirmed_at is not null
  );
end;
$$;

-- ----------------------------------------------------------------------------
-- get_campaign_status: row for the calling user — current access, expiry, and
-- whether their most recent campaign ended within the last 7 days (drives the
-- "access expired" upgrade screen).
-- ----------------------------------------------------------------------------
create or replace function public.get_campaign_status()
returns table (
  has_access boolean,
  expires_at timestamptz,
  campaign_slug text,
  campaign_name text,
  recently_expired boolean
)
language plpgsql
stable
security definer
set search_path = 'public'
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    return;
  end if;

  return query
  select
    (ca.expires_at > now() and c.ends_at > now()) as has_access,
    ca.expires_at,
    c.slug,
    c.name,
    (c.ends_at <= now() and c.ends_at > now() - interval '7 days' and ca.user_id is not null) as recently_expired
  from public.campaign_access ca
  join public.campaigns c on c.id = ca.campaign_id
  where ca.user_id = v_uid
  order by c.ends_at desc
  limit 1;
end;
$$;

-- ----------------------------------------------------------------------------
-- Questions RLS: during a campaign, campaign users may read the full bank of
-- any exam (same column set as always — answer keys are still hidden because
-- the column grants are unchanged).
-- ----------------------------------------------------------------------------
drop policy if exists "questions are accessible by exam access" on public.questions;

create policy "questions are accessible by exam access"
  on public.questions for select
  to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.is_admin
    )
    or public.has_campaign_access()
    or exists (
      select 1 from exams e
      where e.id = questions.exam_id
        and (e.school_id is null
          or exists (
            select 1 from user_exam_access uea
            where uea.exam_id = questions.exam_id
              and uea.user_id = auth.uid()
          ))
    )
    or exists (
      select 1 from user_exam_free_pools p
      where p.question_id = questions.id
        and p.user_id = auth.uid()
    )
  );

-- Executions: server actions and authenticated RLS branch can run the checks;
-- start/end are admin-only (service_role / API routes with requireAdmin).
revoke execute on function public.start_campaign(text, text, integer, boolean) from public, anon, authenticated;
revoke execute on function public.end_campaign(text) from public, anon, authenticated;
revoke execute on function public.has_campaign_access() from public, anon;
revoke execute on function public.get_campaign_status() from public, anon;

grant execute on function public.start_campaign(text, text, integer, boolean) to service_role;
grant execute on function public.end_campaign(text) to service_role;
grant execute on function public.has_campaign_access() to authenticated;
grant execute on function public.get_campaign_status() to authenticated;
grant execute on function public.has_campaign_access() to service_role;
grant execute on function public.get_campaign_status() to service_role;