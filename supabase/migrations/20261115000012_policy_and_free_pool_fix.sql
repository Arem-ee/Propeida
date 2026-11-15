-- Fix two live gaps that stop a learner from reading a question at all.
--
-- 1. ensure_exam_free_pool's JAMB branch selected from a table alias `p`
--    that was never introduced, so every call failed with
--    "missing FROM-clause entry for table p". The declared combination now
--    reads jsonb properly. The session's own subject picks are unchanged.
-- 2. The questions policy (20261115000003) referenced user_free_questions,
--    a table the authenticated role cannot read since the phase-2 lockdown.
--    Every authenticated question read therefore failed with 42501, including
--    the national-bank branch. The pool lookup now goes through the
--    security definer helper is_own_free_pool_question(), and weekly PUTME
--    counts as an active PUTME product.

-- 1. Free pool ------------------------------------------------------------

create or replace function ensure_exam_free_pool(
  p_user_id uuid,
  p_exam_id uuid,
  p_subject_ids uuid[] default null
)
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
  v_declared text[];
  v_session_slugs text[];
  v_candidates text[];
  v_slug text;
  v_have integer;
  v_take integer;
  v_total integer;
  v_allowed_slugs text[];
begin
  if p_user_id <> auth.uid() then
    raise exception 'User ID mismatch';
  end if;

  select slug into v_exam_slug from exams where id = p_exam_id;
  if v_exam_slug is null then
    raise exception 'Exam not found';
  end if;

  select value into v_weighting from app_config where key = 'subject_weighting';
  if v_weighting is null or not (v_weighting ? v_exam_slug) then
    raise exception 'Exam is not a locked-pool exam';
  end if;

  select count(*) into v_pool_size
  from user_exam_free_pools
  where user_id = p_user_id and exam_id = p_exam_id;

  -- Fixed-format exams: existing pool is permanent, returned as-is.
  if v_pool_size > 0 and v_exam_slug <> 'jamb' then
    return query
      select uefp.question_id
      from user_exam_free_pools uefp
      where uefp.user_id = p_user_id and exam_id = p_exam_id
      order by uefp.assigned_at;
    return;
  end if;

  -- Serialize concurrent generation for this (user, exam).
  v_lock_key := ('x' || substr(md5(p_user_id::text || p_exam_id::text), 1, 16))::bit(64)::bigint;
  perform pg_advisory_xact_lock(v_lock_key);

  if v_exam_slug = 'jamb' then
    -- English is compulsory: it is not a choice and never needs one.
    -- Electives: declared combination first (learner's own choice), then
    -- the session's subject picks, capped at 3. No fallback subjects.
    select coalesce(array_agg(t.slug order by t.pos), '{}') into v_declared
    from (
      select s.slug, c.pos
      from profiles p
      cross join lateral jsonb_array_elements_text(coalesce(p.subject_combinations, '[]'::jsonb)) with ordinality as c(combo, pos)
      join subjects s on (s.slug = c.combo or s.name = c.combo)
      where p.id = p_user_id
        and s.id in (
          select es.subject_id from exam_subjects es where es.exam_id = p_exam_id
        )
    ) t;

    select coalesce(array_agg(s.slug order by pk.pos), '{}') into v_session_slugs
    from unnest(coalesce(p_subject_ids, '{}')) with ordinality as pk(id, pos)
    join subjects s on s.id = pk.id;

    v_candidates := '{}';
    foreach v_slug in array v_declared || v_session_slugs loop
      if v_slug <> 'english' and not (v_slug = any(v_candidates))
         and cardinality(v_candidates) < 3 then
        v_candidates := v_candidates || v_slug;
      end if;
    end loop;

    v_allowed_slugs := array['english'] || v_candidates;

    for v_slug in select unnest(array['english'] || v_candidates) loop
      select count(*) into v_total
      from user_exam_free_pools
      where user_id = p_user_id and exam_id = p_exam_id;

      if v_total >= 360 then
        exit;
      end if;

      select count(*) into v_have
      from user_exam_free_pools p
      join questions q on q.id = p.question_id
      join subjects s on s.id = q.subject_id
      where p.user_id = p_user_id and p.exam_id = p_exam_id
        and s.slug = v_slug;

      v_take := least(
        (case when v_slug = 'english' then 60 else 40 end) * v_fill - v_have,
        360 - v_total
      );

      if v_take > 0 then
        insert into user_exam_free_pools (user_id, exam_id, question_id)
        select p_user_id, p_exam_id, q.id
        from (
          select q2.id
          from questions q2
          join subjects s on s.id = q2.subject_id
          where q2.exam_id = p_exam_id
            and s.slug = v_slug
            and not exists (
              select 1 from user_exam_free_pools p
              where p.user_id = p_user_id and p.exam_id = p_exam_id and p.question_id = q2.id
            )
          order by random()
          limit v_take
        ) q;
      end if;
    end loop;

    -- Bank top-up stays inside the funded subjects only: undeclared
    -- subjects never enter the free pool.
    select count(*) into v_pool_size
    from user_exam_free_pools
    where user_id = p_user_id and exam_id = p_exam_id;

    if v_pool_size < 360 then
      v_need := 360 - v_pool_size;

      insert into user_exam_free_pools (user_id, exam_id, question_id)
      select p_user_id, p_exam_id, q.id
      from (
        select q2.id
        from questions q2
        join subjects s on s.id = q2.subject_id
        where q2.exam_id = p_exam_id
          and s.slug = any(v_allowed_slugs)
          and not exists (
            select 1 from user_exam_free_pools p
            where p.user_id = p_user_id and p.exam_id = p_exam_id and p.question_id = q2.id
          )
        order by random()
        limit v_need
      ) q;
    end if;
  else
    select count(*) into v_pool_size
    from user_exam_free_pools
    where user_id = p_user_id and exam_id = p_exam_id;

    if v_pool_size > 0 then
      return query
        select uefp.question_id
        from user_exam_free_pools uefp
        where uefp.user_id = p_user_id and exam_id = p_exam_id
        order by uefp.assigned_at;
      return;
    end if;

    v_entry := v_weighting -> v_exam_slug;

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
  end if;

  return query
    select uefp.question_id
    from user_exam_free_pools uefp
    where uefp.user_id = p_user_id and exam_id = p_exam_id
    order by uefp.assigned_at;
end;
$$;

grant execute on function ensure_exam_free_pool(uuid, uuid, uuid[]) to authenticated, service_role;

-- 2. Questions policy ---------------------------------------------------

drop policy if exists "questions are accessible by exam access" on public.questions;

create policy "questions are accessible by exam access"
  on public.questions for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid()) and p.is_admin
    )
    or public.has_campaign_access()
    or (
      status = 'published'
      and (
        exists (
          select 1
          from public.exams e
          where e.id = questions.exam_id
            and e.school_id is null
        )
        or public.is_own_free_pool_question(questions.id)
        or (
          exists (
            select 1
            from public.exams e
            join public.user_exam_access uea
              on uea.exam_id = e.id
             and uea.user_id = (select auth.uid())
            where e.id = questions.exam_id
              and e.school_id is not null
          )
          and exists (
            select 1
            from public.entitlements ent
            where ent.user_id = (select auth.uid())
              and ent.status = 'active'
              and (ent.expires_at is null or ent.expires_at > now())
              and ent.product in ('putme_pro', 'putme_pro_weekly', 'putme_pro_yearly')
          )
        )
      )
    )
  );
