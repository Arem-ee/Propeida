-- Security hardening: remove blanket function execution and protect answer keys/results.

-- Never expose every function in the public schema.  SECURITY DEFINER functions in
-- particular must be explicitly allow-listed.
revoke execute on all functions in schema public from public, anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

-- Question reads remain available to authenticated students, but answer keys and
-- explanations are deliberately excluded. Table-level SELECT would override a
-- column revoke, so remove it before granting the safe columns back.
revoke select on table questions from public, anon, authenticated;
grant select (id, subject_id, exam_id, question_text, options, difficulty, created_at, source)
  on table questions to authenticated;

-- Clients may read only their own payment and entitlement rows through RLS; they
-- must never be able to create or change them.
revoke insert, update, delete on table payments, entitlements from public, anon, authenticated;
grant select on table payments, entitlements to authenticated;

-- Scores are computed below from persisted answers. Do not permit client-supplied
-- result rows, even when RLS confirms ownership of the session.
revoke insert, update, delete on table results from public, anon, authenticated;
drop policy if exists "users can insert own results" on results;

-- Daily attempts are also graded in a trusted function so is_correct cannot be
-- supplied by the browser.
revoke insert, update, delete on table daily_question_attempts from public, anon, authenticated;
drop policy if exists "users can insert own daily question attempts" on daily_question_attempts;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'daily_question_attempts_user_question_key'
  ) then
    alter table daily_question_attempts
      add constraint daily_question_attempts_user_question_key unique (user_id, daily_question_id);
  end if;
end;
$$;

create or replace function record_session_answer(
  p_session_id uuid,
  p_question_id uuid,
  p_selected_answer text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_correct_answer text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  if p_selected_answer not in ('a', 'b', 'c', 'd') then
    raise exception 'Invalid answer';
  end if;

  select q.correct_answer into v_correct_answer
  from exam_sessions es
  join session_answers sa on sa.session_id = es.id and sa.question_id = p_question_id
  join questions q on q.id = sa.question_id
  where es.id = p_session_id
    and es.user_id = auth.uid()
    and es.status = 'in_progress';

  if not found then
    raise exception 'Active session question not found';
  end if;

  update session_answers
  set selected_answer = p_selected_answer,
      is_correct = (p_selected_answer = v_correct_answer)
  where session_id = p_session_id and question_id = p_question_id;

  return p_selected_answer = v_correct_answer;
end;
$$;

-- Answer material is exposed only after a practice answer has been recorded, or
-- after a mock has been completed. This is the only student-facing reveal path.
create or replace function get_session_answer_reveal(
  p_session_id uuid,
  p_question_id uuid
)
returns table (correct_answer text, explanation text)
language sql
security definer
set search_path = public
as $$
  select q.correct_answer, q.explanation
  from exam_sessions es
  join session_answers sa on sa.session_id = es.id and sa.question_id = p_question_id
  join questions q on q.id = sa.question_id
  where es.id = p_session_id
    and es.user_id = auth.uid()
    and ((es.mode = 'practice' and sa.selected_answer is not null) or es.status = 'completed');
$$;

-- The completion function is the sole path that writes a mock result. It locks
-- the session, derives correctness from protected question data, and writes the
-- aggregate used by the leaderboard trigger.
create or replace function complete_mock_session(p_session_id uuid)
returns table (score integer, accuracy numeric, performance_by_subject jsonb, completed_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session exam_sessions%rowtype;
  v_score integer;
  v_total integer;
  v_accuracy numeric;
  v_performance jsonb;
  v_completed_at timestamptz;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select * into v_session
  from exam_sessions
  where id = p_session_id and user_id = auth.uid()
  for update;

  if not found or v_session.mode <> 'mock' or v_session.status <> 'in_progress' then
    raise exception 'Active mock session not found';
  end if;

  update session_answers sa
  set is_correct = (sa.selected_answer is not null and sa.selected_answer = q.correct_answer)
  from questions q
  where sa.session_id = p_session_id and q.id = sa.question_id;

  select count(*)::integer,
         count(*) filter (where is_correct)::integer
  into v_total, v_score
  from session_answers
  where session_id = p_session_id;

  v_accuracy := case when v_total > 0 then round(v_score::numeric / v_total, 2) else 0 end;

  select coalesce(jsonb_object_agg(subject_id, jsonb_build_object('correct', correct_count, 'total', total_count)), '{}'::jsonb)
  into v_performance
  from (
    select q.subject_id::text as subject_id,
           count(*) filter (where sa.is_correct)::integer as correct_count,
           count(*)::integer as total_count
    from session_answers sa
    join questions q on q.id = sa.question_id
    where sa.session_id = p_session_id
    group by q.subject_id
  ) subject_totals;

  v_completed_at := case
    when v_session.time_limit_seconds is not null
      and now() > v_session.started_at + make_interval(secs => v_session.time_limit_seconds)
    then v_session.started_at + make_interval(secs => v_session.time_limit_seconds)
    else now()
  end;

  update exam_sessions
  set status = 'completed', completed_at = v_completed_at
  where id = p_session_id;

  insert into results (session_id, score, accuracy, performance_by_subject)
  values (p_session_id, v_score, v_accuracy, v_performance);

  return query select v_score, v_accuracy, v_performance, v_completed_at;
end;
$$;

create or replace function get_session_review(p_session_id uuid)
returns table (
  question_id uuid,
  subject_id uuid,
  question_text text,
  options jsonb,
  selected_answer text,
  is_correct boolean,
  correct_answer text,
  explanation text,
  time_taken_seconds integer
)
language sql
security definer
set search_path = public
as $$
  select q.id, q.subject_id, q.question_text, q.options, sa.selected_answer,
         sa.is_correct, q.correct_answer, q.explanation, sa.time_taken_seconds
  from exam_sessions es
  join session_answers sa on sa.session_id = es.id
  join questions q on q.id = sa.question_id
  where es.id = p_session_id
    and es.user_id = auth.uid()
    and es.status = 'completed'
  order by sa.id;
$$;

create or replace function submit_daily_question_answer(
  p_daily_question_id uuid,
  p_selected_answer text
)
returns table (is_correct boolean, correct_answer text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_correct_answer text;
  v_is_correct boolean;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  if p_selected_answer not in ('a', 'b', 'c', 'd') then
    raise exception 'Invalid answer';
  end if;

  select q.correct_answer into v_correct_answer
  from daily_questions dq
  join questions q on q.id = dq.question_id
  where dq.id = p_daily_question_id;
  if not found then
    raise exception 'Daily question not found';
  end if;
  if exists (
    select 1 from daily_question_attempts
    where user_id = auth.uid() and daily_question_id = p_daily_question_id
  ) then
    raise exception 'Already answered today';
  end if;

  v_is_correct := p_selected_answer = v_correct_answer;
  insert into daily_question_attempts (user_id, daily_question_id, is_correct)
  values (auth.uid(), p_daily_question_id, v_is_correct);

  perform update_streak(auth.uid());
  return query select v_is_correct, v_correct_answer;
exception when unique_violation then
  raise exception 'Already answered today';
end;
$$;

create or replace function get_daily_question_reveal(p_daily_question_id uuid)
returns table (correct_answer text, explanation text)
language sql
security definer
set search_path = public
as $$
  select q.correct_answer, q.explanation
  from daily_question_attempts dqa
  join daily_questions dq on dq.id = dqa.daily_question_id
  join questions q on q.id = dq.question_id
  where dqa.daily_question_id = p_daily_question_id
    and dqa.user_id = auth.uid();
$$;

-- These user-facing functions verify auth.uid() internally where they accept a
-- user id. The existing function definitions are replaced to enforce that rule.
create or replace function update_streak(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_last_activity date;
  v_current_streak integer;
  v_longest_streak integer;
begin
  if p_user_id <> auth.uid() then
    raise exception 'User ID mismatch';
  end if;
  select last_activity_date, current_streak, longest_streak
  into v_last_activity, v_current_streak, v_longest_streak
  from streaks where user_id = p_user_id;
  if not found then
    insert into streaks (user_id, current_streak, longest_streak, last_activity_date)
    values (p_user_id, 1, 1, current_date);
    return;
  end if;
  if v_last_activity = current_date then return; end if;
  if v_last_activity = current_date - 1 then v_current_streak := v_current_streak + 1;
  else v_current_streak := 1; end if;
  if v_current_streak > v_longest_streak then v_longest_streak := v_current_streak; end if;
  update streaks set current_streak = v_current_streak, longest_streak = v_longest_streak,
      last_activity_date = current_date where user_id = p_user_id;
end;
$$;

-- Allow-list only runtime RPCs. Trigger functions and privileged financial/RLS
-- helpers receive no client-facing execution grant.
grant execute on function get_session_questions(uuid, uuid[], question_difficulty, integer, text) to authenticated;
grant execute on function ensure_daily_question() to authenticated;
grant execute on function get_user_leaderboard_rank(uuid, leaderboard_period, uuid) to authenticated;
grant execute on function increment_usage_counter(uuid, uuid, text) to authenticated;
grant execute on function try_start_free_mock(uuid, uuid, integer) to authenticated;
grant execute on function update_streak(uuid) to authenticated;
grant execute on function record_session_answer(uuid, uuid, text) to authenticated;
grant execute on function get_session_answer_reveal(uuid, uuid) to authenticated;
grant execute on function complete_mock_session(uuid) to authenticated;
grant execute on function get_session_review(uuid) to authenticated;
grant execute on function submit_daily_question_answer(uuid, text) to authenticated;
grant execute on function get_daily_question_reveal(uuid) to authenticated;
grant execute on function grant_referral_reward(uuid) to service_role;

do $$
begin
  if to_regprocedure('process_payment(uuid,text,integer,text,text)') is not null then
    execute 'grant execute on function process_payment(uuid,text,integer,text,text) to service_role';
  end if;
end;
$$;
