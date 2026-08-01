-- Locked per-exam free question pools for fixed-format mock exams.
-- An exam gets this model automatically when it has an entry in the
-- subject_weighting app_config (currently unilorin-post-utme).
-- First free engagement with the exam (practice or mock) permanently locks
-- a weighted sample of question IDs for that (user_id, exam_id); every later
-- free practice session and both free mock attempts draw from this same set.

create table if not exists user_exam_free_pools (
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_id uuid not null references exams(id) on delete cascade,
  question_id uuid not null references questions(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (user_id, exam_id, question_id)
);

create index if not exists user_exam_free_pools_user_exam_idx
  on user_exam_free_pools (user_id, exam_id);

alter table user_exam_free_pools enable row level security;

create policy "users read own exam free pools"
  on user_exam_free_pools
  for select
  to authenticated
  using (user_id = auth.uid());

grant select on user_exam_free_pools to authenticated;

create or replace function ensure_exam_free_pool(p_user_id uuid, p_exam_id uuid)
returns setof uuid
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_exam_slug text;
  v_weighting jsonb;
  v_entry jsonb;
  v_subject_slug text;
  v_count integer;
  v_target integer := 0;
  v_pool_size integer;
  v_need integer;
  v_lock_key bigint;
begin
  if p_user_id <> auth.uid() then
    raise exception 'User ID mismatch';
  end if;

  -- Existing pool is permanent: return it as-is, never regenerate
  select count(*) into v_pool_size
  from user_exam_free_pools
  where user_id = p_user_id and exam_id = p_exam_id;

  if v_pool_size > 0 then
    return query
      select uefp.question_id
      from user_exam_free_pools uefp
      where uefp.user_id = p_user_id and uefp.exam_id = p_exam_id
      order by uefp.assigned_at;
    return;
  end if;

  -- Serialize concurrent first-time generation for this (user, exam)
  v_lock_key := ('x' || substr(md5(p_user_id::text || p_exam_id::text), 1, 16))::bit(64)::bigint;
  perform pg_advisory_xact_lock(v_lock_key);

  -- Re-check after acquiring the lock
  select count(*) into v_pool_size
  from user_exam_free_pools
  where user_id = p_user_id and exam_id = p_exam_id;

  if v_pool_size > 0 then
    return query
      select uefp.question_id
      from user_exam_free_pools uefp
      where uefp.user_id = p_user_id and uefp.exam_id = p_exam_id
      order by uefp.assigned_at;
    return;
  end if;

  select slug into v_exam_slug from exams where id = p_exam_id;
  if v_exam_slug is null then
    raise exception 'Exam not found';
  end if;

  select value into v_weighting from app_config where key = 'subject_weighting';
  if v_weighting is null or not (v_weighting ? v_exam_slug) then
    raise exception 'Exam is not a locked-pool exam';
  end if;

  v_entry := v_weighting -> v_exam_slug;

  -- Per-subject weighted sampling
  for v_subject_slug, v_count in
    select key, (value::int)
    from jsonb_each(v_entry)
  loop
    v_target := v_target + v_count;

    insert into user_exam_free_pools (user_id, exam_id, question_id)
    select p_user_id, p_exam_id, q.id
    from (
      select q2.id
      from questions q2
      join subjects s on s.id = q2.subject_id
      where q2.exam_id = p_exam_id
        and s.slug = v_subject_slug
        and not exists (
          select 1 from user_exam_free_pools p
          where p.user_id = p_user_id and p.exam_id = p_exam_id and p.question_id = q2.id
        )
      order by random()
      limit v_count
    ) q;
  end loop;

  -- Top up from the exam bank if per-subject banks fell short of the weighted target
  select count(*) into v_pool_size
  from user_exam_free_pools
  where user_id = p_user_id and exam_id = p_exam_id;

  if v_pool_size < v_target then
    v_need := v_target - v_pool_size;

    insert into user_exam_free_pools (user_id, exam_id, question_id)
    select p_user_id, p_exam_id, q.id
    from (
      select q2.id
      from questions q2
      where q2.exam_id = p_exam_id
        and not exists (
          select 1 from user_exam_free_pools p
          where p.user_id = p_user_id and p.exam_id = p_exam_id and p.question_id = q2.id
        )
      order by random()
      limit v_need
    ) q;
  end if;

  return query
    select uefp.question_id
    from user_exam_free_pools uefp
    where uefp.user_id = p_user_id and uefp.exam_id = p_exam_id
    order by uefp.assigned_at;
end;
$$;

grant execute on function ensure_exam_free_pool(uuid, uuid) to authenticated;

-- The old 30-lifetime-question cap RPC is no longer called anywhere (the
-- locked-pool model replaces it for pool-model exams); remove the mechanism
-- entirely so the two limits can never conflict.
drop function if exists increment_usage_counter(uuid, uuid, text);
