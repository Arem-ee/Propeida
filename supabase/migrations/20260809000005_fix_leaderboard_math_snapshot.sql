-- Leaderboard math: use the immutable completion snapshot for question totals.
--
-- update_leaderboard()/recompute_leaderboard_entries() previously counted
-- live session_answers rows per session. For 100-question mocks graded at
-- completion (performance_by_subject total = 100), live counts read 99 —
-- session_answers rows are authoritative at completion time but drift
-- afterwards, so live counts silently undercount question volume and skew
-- every affected Bayesian score (verified: 66 of 124 entries off by up to
-- ~1.0 point). The grading snapshot stored in results.performance_by_subject
-- is immutable and is what the user was graded against, so totals now come
-- from that snapshot.
--
-- Also: weekly entries are only kept while the user has in-week results;
-- otherwise the rewritten value is a stale prior (50.00), so the row is
-- removed instead.

create or replace function public.update_leaderboard()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_user_id uuid;
  v_exam_id uuid;
  v_total_correct numeric;
  v_total_questions numeric;
  v_bayesian_score numeric;
begin
  select es.user_id, es.exam_id into v_user_id, v_exam_id
  from exam_sessions es
  where es.id = new.session_id;

  if v_user_id is null or v_exam_id is null then
    return new;
  end if;

  select
    coalesce(sum(r.score), 0),
    coalesce(sum((select sum((p.value->>'total')::numeric)
                  from jsonb_each(coalesce(r.performance_by_subject, '{}'::jsonb)) p)), 0)
  into v_total_correct, v_total_questions
  from results r
  join exam_sessions es on es.id = r.session_id
  where es.user_id = v_user_id
    and es.exam_id = v_exam_id
    and es.status = 'completed';

  v_bayesian_score := round((v_total_correct + 5) / (v_total_questions + 10) * 100, 2);

  insert into leaderboard_entries (user_id, exam_id, score, period, updated_at)
  values (v_user_id, v_exam_id, v_bayesian_score, 'all_time', now())
  on conflict (user_id, exam_id, period) do update set
    score = excluded.score,
    updated_at = excluded.updated_at;

  select
    coalesce(sum(r.score), 0),
    coalesce(sum((select sum((p.value->>'total')::numeric)
                  from jsonb_each(coalesce(r.performance_by_subject, '{}'::jsonb)) p)), 0)
  into v_total_correct, v_total_questions
  from results r
  join exam_sessions es on es.id = r.session_id
  where es.user_id = v_user_id
    and es.exam_id = v_exam_id
    and es.status = 'completed'
    and es.completed_at >= date_trunc('week', now());

  if v_total_questions > 0 then
    v_bayesian_score := round((v_total_correct + 5) / (v_total_questions + 10) * 100, 2);

    insert into leaderboard_entries (user_id, exam_id, score, period, updated_at)
    values (v_user_id, v_exam_id, v_bayesian_score, 'weekly', now())
    on conflict (user_id, exam_id, period) do update set
      score = excluded.score,
      updated_at = excluded.updated_at;
  else
    delete from leaderboard_entries
    where user_id = v_user_id and exam_id = v_exam_id and period = 'weekly';
  end if;

  return new;
end;
$$;

create or replace function public.recompute_leaderboard_entries()
returns void
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_row record;
  v_total_correct numeric;
  v_total_questions numeric;
  v_bayesian_score numeric;
begin
  for v_row in
    select distinct es.user_id, es.exam_id
    from exam_sessions es
    where es.status = 'completed'
      and exists (select 1 from results r where r.session_id = es.id)
  loop
    select
      coalesce(sum(r.score), 0),
      coalesce(sum((select sum((p.value->>'total')::numeric)
                    from jsonb_each(coalesce(r.performance_by_subject, '{}'::jsonb)) p)), 0)
    into v_total_correct, v_total_questions
    from results r
    join exam_sessions es on es.id = r.session_id
    where es.user_id = v_row.user_id
      and es.exam_id = v_row.exam_id
      and es.status = 'completed';

    v_bayesian_score := round((v_total_correct + 5) / (v_total_questions + 10) * 100, 2);

    insert into leaderboard_entries (user_id, exam_id, score, period, updated_at)
    values (v_row.user_id, v_row.exam_id, v_bayesian_score, 'all_time', now())
    on conflict (user_id, exam_id, period) do update set
      score = excluded.score,
      updated_at = excluded.updated_at;

    select
      coalesce(sum(r.score), 0),
      coalesce(sum((select sum((p.value->>'total')::numeric)
                    from jsonb_each(coalesce(r.performance_by_subject, '{}'::jsonb)) p)), 0)
    into v_total_correct, v_total_questions
    from results r
    join exam_sessions es on es.id = r.session_id
    where es.user_id = v_row.user_id
      and es.exam_id = v_row.exam_id
      and es.status = 'completed'
      and es.completed_at >= date_trunc('week', now());

    if v_total_questions > 0 then
      v_bayesian_score := round((v_total_correct + 5) / (v_total_questions + 10) * 100, 2);

      insert into leaderboard_entries (user_id, exam_id, score, period, updated_at)
      values (v_row.user_id, v_row.exam_id, v_bayesian_score, 'weekly', now())
      on conflict (user_id, exam_id, period) do update set
        score = excluded.score,
        updated_at = excluded.updated_at;
    else
      delete from leaderboard_entries
      where user_id = v_row.user_id and exam_id = v_row.exam_id and period = 'weekly';
    end if;
  end loop;
end;
$$;

revoke execute on function public.recompute_leaderboard_entries() from public, anon, authenticated;
grant execute on function public.recompute_leaderboard_entries() to service_role;

select public.recompute_leaderboard_entries();