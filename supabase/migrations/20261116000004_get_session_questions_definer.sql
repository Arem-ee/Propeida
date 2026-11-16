-- Security-definer get_session_questions + inlinable has_campaign_access.
--
-- Why: the session question selector was `language sql stable` (security
-- invoker), so every row it read paid the full questions RLS policy on each
-- of the two or three pool passes it makes (the base filter is evaluated
-- for `tagged` and `selection`, and the final `md5` sort materialises the
-- pool anyway). Per-row subplans included an uncorrelated-but-joined
-- has_campaign_access() call and an unindexed user_exam_free_pools probe;
-- with the bank at 10-100x this is the hottest RPC in the app.
--
-- The function now runs as security definer and authorises ONCE per row
-- inside the filter, reusing the same semantics as the questions RLS policy
-- (admin, active campaign, published national exam, own free pool, or
-- school exam + access + active putme entitlement). No result is returned
-- for a row the learner could not already read under the policy. Behaviour
-- is intentionally identical: same signature, same columns, same topic
-- fallback, same served-exclusion, same md5 ordering for a given seed.
--
-- has_campaign_access is also converted from plpgsql to an inlinable
-- SQL stable function so the planner can flatten it into a single EXISTS
-- per query instead of a planner-opaque boundary per row.
--
-- Verify:  psql> select prosrc from pg_proc where proname = 'get_session_questions';
--          call as service_role with seed 'audit-seed-1', expect 6bde7005-a7ff-4766-b5ab-10e90931f889 first.

create or replace function public.has_campaign_access()
returns boolean
language sql
stable
security definer
set search_path = 'public'
as $$
  select exists (
      select 1
      from public.campaign_access ca
      join public.campaigns c on c.id = ca.campaign_id
      where ca.user_id = auth.uid()
        and ca.expires_at > now()
        and c.ends_at > now()
    )
    or exists (
      select 1
      from public.campaigns c
      join auth.users u on u.id = auth.uid()
      where c.include_new_users
        and c.ends_at > now()
        and u.created_at >= c.starts_at
        and u.created_at <= c.ends_at
        and u.role = 'authenticated'
        and u.banned_until is null
        and u.email_confirmed_at is not null
    );
$$;

drop function if exists public.get_session_questions(uuid, uuid[], question_difficulty, integer, text, text[], uuid[]);

create function public.get_session_questions(
  p_exam_id uuid,
  p_subject_ids uuid[],
  p_difficulty question_difficulty default null,
  p_limit integer default 10,
  p_seed text default '',
  p_response_types text[] default array['mcq']::text[],
  p_topic_ids uuid[] default null
)
returns table (
  id uuid,
  subject_id uuid,
  question_text text,
  options jsonb,
  response_type text,
  question_table jsonb,
  question_passage jsonb,
  question_figure jsonb
)
language sql
stable
security definer
set search_path = 'public'
as $$
  with base as (
    select q.id, q.subject_id, q.question_text, q.options, q.response_type,
           q.question_table, q.question_passage, q.question_figure
    from public.questions q
    where q.exam_id = p_exam_id
      and q.status = 'published'
      and q.response_type = any(coalesce(p_response_types, array['mcq']::text[]))
      and (array_length(p_subject_ids, 1) is null or q.subject_id = any(p_subject_ids))
      and (p_difficulty is null or q.difficulty = p_difficulty)
      and (
        exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
        or public.has_campaign_access()
        or exists (select 1 from public.exams e where e.id = q.exam_id and e.school_id is null)
        or public.is_own_free_pool_question(q.id)
        or (
          exists (
            select 1
            from public.exams e
            join public.user_exam_access uea
              on uea.exam_id = e.id and uea.user_id = auth.uid()
            where e.id = q.exam_id
              and e.school_id is not null
          )
          and exists (
            select 1
            from public.entitlements ent
            where ent.user_id = auth.uid()
              and ent.status = 'active'
              and (ent.expires_at is null or ent.expires_at > now())
              and ent.product in ('putme_pro', 'putme_pro_weekly', 'putme_pro_yearly')
          )
        )
      )
  ),
  tagged as (
    select distinct base.id, base.subject_id, base.question_text, base.options, base.response_type,
           base.question_table, base.question_passage, base.question_figure
    from base
    where coalesce(cardinality(p_topic_ids), 0) > 0
      and exists (
        select 1
        from public.question_topics qt
        where qt.question_id = base.id
          and qt.topic_id = any(p_topic_ids)
          and qt.role in ('practice', 'review')
      )
  ),
  selection as (
    select id, subject_id, question_text, options, response_type,
           question_table, question_passage, question_figure
    from base
    where coalesce(cardinality(p_topic_ids), 0) = 0
    union
    select id, subject_id, question_text, options, response_type,
           question_table, question_passage, question_figure
    from tagged
    union
    select id, subject_id, question_text, options, response_type,
           question_table, question_passage, question_figure
    from base
    where coalesce(cardinality(p_topic_ids), 0) > 0
      and (select count(*) from tagged) = 0
  ),
  served as (
    select distinct sa.question_id
    from public.session_answers sa
    join public.exam_sessions es on es.id = sa.session_id
    where es.user_id = auth.uid()
      and es.exam_id = p_exam_id
  ),
  remaining as (
    select count(*)::int as n
    from selection s
    where not exists (select 1 from served u where u.question_id = s.id)
  )
  select s.id, s.subject_id, s.question_text, s.options, s.response_type,
         s.question_table, s.question_passage, s.question_figure
  from selection s
  where (not exists (select 1 from served u where u.question_id = s.id)
     or (select n from remaining) < p_limit)
  order by md5(s.id::text || p_seed)
  limit p_limit;
$$;

revoke all on function public.get_session_questions(uuid, uuid[], question_difficulty, integer, text, text[], uuid[]) from public, anon;
grant execute on function public.get_session_questions(uuid, uuid[], question_difficulty, integer, text, text[], uuid[]) to authenticated, service_role;
