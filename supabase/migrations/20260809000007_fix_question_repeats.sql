-- =====================================================================
-- Fix free mock question repetition (20260809000007)
--
-- Root cause
-- ----------
-- user_exam_free_pools locked exactly ONE mock-sized weighted sample
-- (34 english + 34 mathematics + 32 current-affairs = 100 questions)
-- for free unilorin-post-utme users, while every mock serves 100
-- questions. Every free mock was therefore the same 100 questions.
-- Measured live: mean 72.7% overlap across 43 consecutive-mock pairs,
-- 30 of which were 100% identical sets.
--
-- Fix
-- ---
-- 1. Doubling: seed free pools with 2x the weighted mock size
--    (68 english / 68 mathematics / 64 current-affairs = 200).
--    Two M-question mocks drawn from a 2M pool share M^2/2M = M/2
--    questions in expectation WITHOUT exclusion, and share ZERO once
--    served-question exclusion is applied (mock #2 can only come from
--    the 100 never-served pool questions). Bank coverage is ample:
--    english 328, mathematics 310, current-affairs 436 >= 68/68/64.
-- 2. Served-question exclusion: get_session_questions() now excludes
--    every question the caller was served in any PRIOR session of the
--    same exam, but only while enough unserved questions remain
--    (>= p_limit); otherwise it falls back to the full pool so a
--    session can never fail to deal. The function is security-invoker,
--    so RLS scopes free callers to their pool and paid callers to the
--    whole bank; both benefit. No signature change -> no grant changes.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Doubled free pools (2x weighted mock size)
-- ---------------------------------------------------------------------
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
  v_fill integer := 2;
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

  -- Per-subject weighted sampling, 2x the single-mock weighting
  for v_subject_slug, v_count in
    select key, (value::int)
    from jsonb_each(v_entry)
  loop
    v_target := v_target + (v_count * v_fill);

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
      limit v_count * v_fill
    ) q;
  end loop;

  -- Top up from the exam bank if per-subject banks fell short of the target
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

-- Existing pools were seeded at 1x the weighted mock size; top each up by
-- one more weighted mock per subject so every live free user gets 2x.
do $$
declare
  v_subject_slug text;
  v_count integer;
begin
  for v_subject_slug, v_count in
    select j.key, (j.value::int)
    from app_config a
    cross join lateral jsonb_each(a.value -> 'unilorin-post-utme') j
    where a.key = 'subject_weighting'
  loop
    execute format($f$
      insert into user_exam_free_pools (user_id, exam_id, question_id)
      select u.user_id, u.exam_id, q.id
      from (select distinct user_id, exam_id from user_exam_free_pools) u
      join lateral (
        select q2.id
        from questions q2
        join subjects s on s.id = q2.subject_id
        where q2.exam_id = u.exam_id
          and s.slug = %L
          and not exists (
            select 1 from user_exam_free_pools p
            where p.user_id = u.user_id and p.question_id = q2.id
          )
        order by random()
        limit %s
      ) q on true
      on conflict do nothing
    $f$, v_subject_slug, v_count);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------
-- 2. Served-question exclusion in get_session_questions()
-- ---------------------------------------------------------------------
create or replace function get_session_questions(
  p_exam_id uuid,
  p_subject_ids uuid[],
  p_difficulty question_difficulty default null,
  p_limit integer default 10,
  p_seed text default ''
)
returns table (
  id uuid,
  subject_id uuid,
  question_text text,
  options jsonb
)
language sql
stable
as $$
  with served as (
    select distinct sa.question_id
    from session_answers sa
    join exam_sessions es on es.id = sa.session_id
    where es.user_id = auth.uid()
      and es.exam_id = p_exam_id
  ),
  remaining as (
    select count(*)::int as n
    from questions q
    where q.exam_id = p_exam_id
      and (array_length(p_subject_ids, 1) is null or q.subject_id = any(p_subject_ids))
      and (p_difficulty is null or q.difficulty = p_difficulty)
      and not exists (select 1 from served s where s.question_id = q.id)
  )
  select q.id, q.subject_id, q.question_text, q.options
  from questions q
  where q.exam_id = p_exam_id
    and (array_length(p_subject_ids, 1) is null or q.subject_id = any(p_subject_ids))
    and (p_difficulty is null or q.difficulty = p_difficulty)
    and (
      not exists (select 1 from served s where s.question_id = q.id)
      or (select n from remaining) < p_limit
    )
  order by md5(q.id::text || p_seed)
  limit p_limit;
$$;