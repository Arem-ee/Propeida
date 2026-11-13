-- Free-tier sizing: one full practice set per exam, plus one fresh set for
-- the free mock attempt (pool = 2x the mock composition, as before).
--
-- JAMB becomes a locked-pool exam: 60 English + 40 per learner-chosen
-- elective (up to 3) = a 180-question practice set; the pool holds 360 so
-- practice and the single free mock both draw fresh questions regardless
-- of order. Electives are read from the learner's profile
-- subject_combinations; learners without a saved combination fall back to
-- the three non-English subjects with the deepest published banks.
-- subject_weighting['jamb'] only carries {english: 60} as the
-- locked-pool marker (see isLockedPoolExam) -- the elective expansion
-- lives in the RPC, because the electives are per-learner.

update app_config
set value = value || jsonb_build_object('jamb', jsonb_build_object('english', 60))
where key = 'subject_weighting';

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
  v_elective_slugs text[];
  v_slug text;
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
      where uefp.user_id = p_user_id and exam_id = p_exam_id
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
      where uefp.user_id = p_user_id and exam_id = p_exam_id
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

  -- JAMB shape: the elective subjects are per-learner, so the pool is
  -- English (60) + each chosen elective (40), capped at 3 electives --
  -- one full 180-question practice set, doubled by v_fill for the mock.
  if v_exam_slug = 'jamb' then
    select array_agg(coalesce(nullif(s.slug, ''), s.name)) into v_elective_slugs
    from (
      select unnest(coalesce(p.subject_combinations, '{}')) as combo
      from profiles p
      where p.id = p_user_id
    ) c
    join subjects s on (s.slug = c.combo or s.name = c.combo)
    where s.id in (
      select es.subject_id from exam_subjects es where es.exam_id = p_exam_id
    ) and s.slug <> 'english';

    if v_elective_slugs is null or cardinality(v_elective_slugs) = 0 then
      select array_agg(t.slug) into v_elective_slugs
      from (
        select s.slug, count(q.id) as n
        from subjects s
        join exam_subjects es on es.subject_id = s.id and es.exam_id = p_exam_id
        left join questions q on q.subject_id = s.id
          and q.exam_id = p_exam_id and q.status = 'published'
        where s.slug <> 'english'
        group by s.id, s.slug
        order by n desc, s.slug
        limit 3
      ) t;
    end if;

    for v_slug, v_count in
      select ('english'::text, 60)
      union all
      select unnest(v_elective_slugs[1:least(3, coalesce(cardinality(v_elective_slugs), 0))] || '{}'), 40
    loop
      v_target := v_target + (v_count * v_fill);

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
        limit v_count * v_fill
      ) q;
    end loop;
  else
    -- Fixed-format exams: pool = v_fill x the weighting (one full set for
    -- practice + one for the free mock attempt).
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
  end if;

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
    where uefp.user_id = p_user_id and exam_id = p_exam_id
    order by uefp.assigned_at;
end;
$$;

grant execute on function ensure_exam_free_pool(uuid, uuid) to authenticated;
