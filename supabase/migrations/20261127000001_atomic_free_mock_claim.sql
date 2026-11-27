-- Atomic free-mock allowance claim.
--
-- createSession used to count existing mock sessions and then insert a new
-- one. Two concurrent starts could both read "0 used" and both proceed.
-- A claim reserves a slot under an advisory lock keyed to (user, exam). The
-- source of truth stays the real session rows: a claim is short-lived and is
-- released as soon as the session is created or the creation fails.

create table if not exists public.free_mock_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_id uuid not null references public.exams(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists free_mock_claims_user_exam_idx
  on public.free_mock_claims (user_id, exam_id);

alter table public.free_mock_claims enable row level security;
revoke all on public.free_mock_claims from public, anon, authenticated;

create or replace function public.claim_free_mock(
  p_user_id uuid,
  p_exam_id uuid,
  p_limit integer
)
returns uuid
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_claim_id uuid;
  v_used integer;
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'User ID mismatch';
  end if;

  -- Serialize all claims for this (user, exam) so two concurrent starts
  -- cannot both observe a free slot.
  perform pg_advisory_xact_lock(
    ('x' || substr(md5(p_user_id::text || p_exam_id::text), 1, 16))::bit(64)::bigint
  );

  select count(*)::integer into v_used
  from (
    select s.id
      from exam_sessions s
     where s.user_id = p_user_id
       and s.exam_id = p_exam_id
       and s.mode = 'mock'
       and exists (select 1 from session_answers sa where sa.session_id = s.id)
    union all
    select c.id
      from free_mock_claims c
     where c.user_id = p_user_id
       and c.exam_id = p_exam_id
  ) used;

  if v_used >= greatest(p_limit, 0) then
    return null;
  end if;

  insert into free_mock_claims (user_id, exam_id)
  values (p_user_id, p_exam_id)
  returning id into v_claim_id;

  return v_claim_id;
end;
$$;

create or replace function public.release_free_mock_claim(p_claim_id uuid)
returns void
language plpgsql
security definer
set search_path = 'public'
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  delete from free_mock_claims
  where id = p_claim_id and user_id = auth.uid();
end;
$$;

revoke all on function public.claim_free_mock(uuid, uuid, integer) from public, anon;
revoke all on function public.release_free_mock_claim(uuid) from public, anon;
grant execute on function public.claim_free_mock(uuid, uuid, integer) to authenticated, service_role;
grant execute on function public.release_free_mock_claim(uuid) to authenticated, service_role;
