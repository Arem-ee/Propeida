-- Leaderboard math fix.
--
-- update_leaderboard() reconstructed each result's question total as
-- round(score / accuracy). accuracy is stored rounded to 2 decimals, so the
-- recovery is lossy (e.g. 1/99 with accuracy=0.01 recovered 100 questions),
-- and every mock with zero correct answers (accuracy = 0) was dropped
-- entirely by nullif(accuracy, 0) — its questions vanished from the total
-- while its (zero) correct count contributed nothing. Net effect: Bayesian
-- scores inflated toward the +5/+10 prior: all-zero users showed 50.00, and
-- one real user (Temietorhpe, 166 correct / 400 questions across 4 mocks)
-- showed 81.43 instead of the true 41.71.
--
-- Fix: count per-session question totals directly from session_answers (the
-- same table complete_mock_session grades against), so totals are exact and
-- zero-accuracy mocks no longer distort the aggregate.

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

  -- All-time score for this exam
  select
    coalesce(sum(r.score), 0),
    coalesce(sum((select count(*) from session_answers sa where sa.session_id = r.session_id)), 0)
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

  -- Weekly score for this exam
  select
    coalesce(sum(r.score), 0),
    coalesce(sum((select count(*) from session_answers sa where sa.session_id = r.session_id)), 0)
  into v_total_correct, v_total_questions
  from results r
  join exam_sessions es on es.id = r.session_id
  where es.user_id = v_user_id
    and es.exam_id = v_exam_id
    and es.status = 'completed'
    and es.completed_at >= date_trunc('week', now());

  v_bayesian_score := round((v_total_correct + 5) / (v_total_questions + 10) * 100, 2);

  insert into leaderboard_entries (user_id, exam_id, score, period, updated_at)
  values (v_user_id, v_exam_id, v_bayesian_score, 'weekly', now())
  on conflict (user_id, exam_id, period) do update set
    score = excluded.score,
    updated_at = excluded.updated_at;

  return new;
end;
$$;

-- The original trigger from migration 20260709000002 was never dropped, so
-- every result insert has been executing update_leaderboard() twice.
drop trigger if exists on_result_created on results;

-- Admin recompute: re-derive every stored entry from raw results. Runs with
-- the service role; used to backfill existing entries and for future audits.
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
      coalesce(sum((select count(*) from session_answers sa where sa.session_id = r.session_id)), 0)
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
      coalesce(sum((select count(*) from session_answers sa where sa.session_id = r.session_id)), 0)
    into v_total_correct, v_total_questions
    from results r
    join exam_sessions es on es.id = r.session_id
    where es.user_id = v_row.user_id
      and es.exam_id = v_row.exam_id
      and es.status = 'completed'
      and es.completed_at >= date_trunc('week', now());

    v_bayesian_score := round((v_total_correct + 5) / (v_total_questions + 10) * 100, 2);

    insert into leaderboard_entries (user_id, exam_id, score, period, updated_at)
    values (v_row.user_id, v_row.exam_id, v_bayesian_score, 'weekly', now())
    on conflict (user_id, exam_id, period) do update set
      score = excluded.score,
      updated_at = excluded.updated_at;
  end loop;
end;
$$;

revoke execute on function public.recompute_leaderboard_entries() from public, anon, authenticated;
grant execute on function public.recompute_leaderboard_entries() to service_role;

select public.recompute_leaderboard_entries();