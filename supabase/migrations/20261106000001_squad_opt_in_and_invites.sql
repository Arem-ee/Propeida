-- Squad opt-in, invites and atomic joins.
--
-- Squads remain cooperative and private inside the member list: no ranks, no
-- scores, no direct messages, no public roster. Joining is a deliberate act
-- by the learner — this sets a consent flag and lets them into one squad.
-- Invite codes are random UUIDs and are only visible to members.

alter table profiles
  add column if not exists squads_enabled boolean not null default false;

-- Same contract as notifications_enabled: the learner may toggle their own
-- consent, and nothing else.
grant update (squads_enabled) on table public.profiles to authenticated;

alter table squads
  add column if not exists invite_code uuid not null default gen_random_uuid();

create unique index if not exists squads_invite_code_unique
  on squads (invite_code);

-- One small atomic unit: find a squad with an open seat for this exam and
-- cycle, or create one, and put the learner in it. The advisory lock makes
-- concurrent requests behave as if they queued; the one-per-user unique index
-- remains the final guard.
create or replace function public.join_my_squad(
  p_exam_id uuid,
  p_exam_target text,
  p_cycle_year integer
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_squad uuid;
begin
  if v_user is null then
    raise exception 'authenticated session required' using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_exam_id::text, 20261106));

  select squad_id into v_squad
  from squad_members
  where user_id = v_user
  limit 1;

  if v_squad is not null then
    return v_squad;
  end if;

  select s.id into v_squad
  from squads s
  where s.exam_id = p_exam_id
    and s.cycle_year is not distinct from p_cycle_year
    and (select count(*) from squad_members m where m.squad_id = s.id) < s.max_members
  order by s.created_at asc, s.id asc
  limit 1;

  if v_squad is null then
    insert into squads (exam_id, exam_target, cycle_year, created_by)
    values (p_exam_id, p_exam_target, p_cycle_year, v_user)
    returning id into v_squad;
  end if;

  insert into squad_members (squad_id, user_id)
  values (v_squad, v_user);

  return v_squad;
end;
$$;

-- Join an existing squad with the code its members share. No new squad is
-- ever created from an invite: accepting one means joining people, not
-- generating a private room without a social act.
create or replace function public.join_squad_by_invite(p_code uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_squad uuid;
  v_exam uuid;
  v_max integer;
begin
  if v_user is null then
    raise exception 'authenticated session required' using errcode = '42501';
  end if;

  select id, exam_id, max_members into v_squad, v_exam, v_max
  from squads
  where invite_code = p_code;

  if v_squad is null then
    raise exception 'Invite not found' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_exam::text, 20261106));

  if exists (select 1 from squad_members where user_id = v_user) then
    raise exception 'You are already in a squad' using errcode = '23505';
  end if;

  if (select count(*) from squad_members where squad_id = v_squad) >= v_max then
    raise exception 'That squad is full' using errcode = '23514';
  end if;

  insert into squad_members (squad_id, user_id)
  values (v_squad, v_user);

  return v_squad;
end;
$$;

create or replace function public.leave_my_squad()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'authenticated session required' using errcode = '42501';
  end if;

  with left_squads as (
    delete from squad_members
    where user_id = v_user
    returning squad_id
  )
  delete from squads s
  using left_squads l
  where s.id = l.squad_id
    and not exists (select 1 from squad_members m where m.squad_id = s.id);
end;
$$;

revoke all on function public.join_my_squad(uuid, text, integer) from public, anon, authenticated;
revoke all on function public.join_squad_by_invite(uuid) from public, anon, authenticated;
revoke all on function public.leave_my_squad() from public, anon, authenticated;
grant execute on function public.join_my_squad(uuid, text, integer) to authenticated;
grant execute on function public.join_squad_by_invite(uuid) to authenticated;
grant execute on function public.leave_my_squad() to authenticated;
