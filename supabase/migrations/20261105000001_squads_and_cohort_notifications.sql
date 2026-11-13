-- Phase 0/1 foundation: squads (schema only, matching ships in Phase 2) +
-- cohort notification preference for ghost nudges and the weekly report.
--
-- Squads are cooperative, never competitive: no ranks, no scores, no DMs.
-- Row access is restricted to a member's own squad; all writes stay
-- server-side (service role) so a client cannot create or join arbitrarily.

alter table profiles
  add column if not exists notifications_enabled boolean not null default true;

-- Only the preference column is client-writable. The authorization columns
-- remain protected by guard_profile_privileges (20261027000001).
grant update (notifications_enabled) on table public.profiles to authenticated;

create table if not exists squads (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references exams(id) on delete cascade,
  exam_target text null,
  cycle_year integer null,
  created_by uuid null references auth.users(id) on delete set null,
  max_members integer not null default 4 check (max_members between 2 and 8),
  created_at timestamptz not null default now()
);

create table if not exists squad_members (
  squad_id uuid not null references squads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (squad_id, user_id)
);

-- MVP rule: one squad per learner. Matching can move people later by
-- deleting the membership row server-side.
create unique index if not exists squad_members_one_per_user
  on squad_members (user_id);

alter table squads enable row level security;
alter table squad_members enable row level security;

-- Security-definer membership check avoids recursive RLS on squad_members.
create or replace function public.is_squad_member(p_squad_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from squad_members
    where squad_id = p_squad_id and user_id = auth.uid()
  );
$$;

revoke all on function public.is_squad_member(uuid) from public, anon;
grant execute on function public.is_squad_member(uuid) to authenticated;

create policy "members read own squad"
  on squads for select
  to authenticated
  using (public.is_squad_member(id));

create policy "members read own squad roster"
  on squad_members for select
  to authenticated
  using (public.is_squad_member(squad_id));

-- Clients read only; inserts/updates/deletes are service-role only.
grant select on table squads to authenticated;
grant select on table squad_members to authenticated;
revoke insert, update, delete on table squads from public, anon, authenticated;
revoke insert, update, delete on table squad_members from public, anon, authenticated;
