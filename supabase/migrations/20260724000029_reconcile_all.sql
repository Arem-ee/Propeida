-- Reconcile database from migration-24 state to full intended state.
-- Combines migrations 25-28 with idempotent guards for safe re-application.
-- Verified: migrations 25-28 were NOT applied to the live database.

-- =================================================================
-- PART 1: RPCs and functions (CREATE OR REPLACE = always safe)
-- =================================================================

-- 1a. process_payment RPC (from migration 25)
create or replace function process_payment(
  p_user_id uuid,
  p_reference text,
  p_amount integer,
  p_product text,
  p_customer_email text default null
)
returns void
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_referral_id uuid;
  v_referrer_id uuid;
begin
  insert into payments (user_id, paystack_reference, amount, status, product, verified_at)
  values (p_user_id, p_reference, p_amount, 'success', p_product, now())
  on conflict (paystack_reference) do update set
    status = 'success',
    verified_at = now()
  where payments.status is distinct from 'success';

  insert into entitlements (user_id, product, status, granted_at, expires_at, source)
  values (p_user_id, p_product::product_type, 'active', now(), null, 'payment')
  on conflict (user_id, product) do update set
    status = 'active',
    granted_at = now(),
    expires_at = null,
    source = 'payment';

  select id, referrer_id into v_referral_id, v_referrer_id
  from referrals
  where referred_id = p_user_id
    and status = 'pending'
  limit 1;

  if found then
    perform grant_referral_reward(v_referrer_id);
    update referrals
    set status = 'verified', reward_granted_at = now()
    where id = v_referral_id;
  end if;
end;
$$;

-- 1b. try_start_free_mock with auth.uid() check + atomic concurrency-safe increment (from migrations 25+26)
create or replace function try_start_free_mock(
  p_user_id uuid,
  p_exam_id uuid,
  p_max_mocks integer default 1
)
returns boolean
language plpgsql
security definer
set search_path = 'public'
as $$
begin
  if p_user_id <> auth.uid() then
    raise exception 'User ID mismatch';
  end if;

  insert into usage_counters (user_id, exam_id, free_questions_answered, free_mocks_started)
  values (p_user_id, p_exam_id, 0, 0)
  on conflict (user_id, exam_id) do nothing;

  update usage_counters
  set free_mocks_started = free_mocks_started + 1
  where user_id = p_user_id
    and exam_id = p_exam_id
    and free_mocks_started < p_max_mocks;

  if not found then
    return false;
  end if;

  return true;
end;
$$;

-- 1c. increment_usage_counter with auth.uid() check + atomic concurrency-safe increment (from migrations 25+26)
create or replace function increment_usage_counter(
  p_user_id uuid,
  p_exam_id uuid,
  p_field text
)
returns void
language plpgsql
security definer
set search_path = 'public'
as $$
begin
  if p_user_id <> auth.uid() then
    raise exception 'User ID mismatch';
  end if;

  if p_field = 'free_questions_answered' then
    insert into usage_counters (user_id, exam_id, free_questions_answered, free_mocks_started)
    values (p_user_id, p_exam_id, 0, 0)
    on conflict (user_id, exam_id) do nothing;

    update usage_counters
    set free_questions_answered = free_questions_answered + 1
    where user_id = p_user_id
      and exam_id = p_exam_id
      and free_questions_answered < 30;

    if not found then
      raise exception 'Free tier limit reached for practice questions';
    end if;
  elsif p_field = 'free_mocks_started' then
    insert into usage_counters (user_id, exam_id, free_questions_answered, free_mocks_started)
    values (p_user_id, p_exam_id, 0, 0)
    on conflict (user_id, exam_id) do nothing;

    update usage_counters
    set free_mocks_started = free_mocks_started + 1
    where user_id = p_user_id
      and exam_id = p_exam_id
      and free_mocks_started < 1;

    if not found then
      raise exception 'Free tier limit reached for mock exams';
    end if;
  end if;
end;
$$;

-- 1d. ensure_daily_question with empty-table handling (from migration 25)
create or replace function ensure_daily_question()
returns void
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_today date;
  v_question_id uuid;
begin
  v_today := current_date;

  if exists (select 1 from daily_questions where date = v_today) then
    return;
  end if;

  if not exists (select 1 from questions limit 1) then
    return;
  end if;

  select q.id into v_question_id
  from questions q
  where q.id not in (
    select dq.question_id from daily_questions dq
    where dq.date >= v_today - 30
  )
  order by random()
  limit 1;

  if v_question_id is null then
    select q.id into v_question_id
    from questions q
    order by random()
    limit 1;
  end if;

  if v_question_id is not null then
    insert into daily_questions (question_id, date)
    values (v_question_id, v_today);
  end if;
end;
$$;

-- 1e. update_streak with auth.uid() check (from migration 27)
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

-- 1f. record_session_answer RPC (from migration 27)
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

-- 1g. get_session_answer_reveal RPC (from migration 27)
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

-- 1h. complete_mock_session RPC (from migration 27)
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

-- 1i. get_session_review RPC (from migration 27)
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

-- 1j. submit_daily_question_answer RPC (from migration 27)
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

-- 1k. get_daily_question_reveal RPC (from migration 27)
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

-- =================================================================
-- PART 2: Constraints (idempotent via DO blocks)
-- =================================================================

-- 2a. results_accuracy_check
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'results_accuracy_check') then
    alter table results add constraint results_accuracy_check
      check (accuracy >= 0 and accuracy <= 1);
  end if;
end;
$$;

-- 2b. session_answers_session_question_key (with dedup first)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'session_answers_session_question_key') then
    delete from session_answers sa
    using session_answers sa2
    where sa.id < sa2.id
      and sa.session_id = sa2.session_id
      and sa.question_id = sa2.question_id;
    alter table session_answers add constraint session_answers_session_question_key
      unique (session_id, question_id);
  end if;
end;
$$;

-- 2c. daily_question_attempts_user_question_key
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'daily_question_attempts_user_question_key') then
    alter table daily_question_attempts
      add constraint daily_question_attempts_user_question_key unique (user_id, daily_question_id);
  end if;
end;
$$;

-- =================================================================
-- PART 3: Indexes (IF NOT EXISTS = always idempotent)
-- =================================================================

create index if not exists idx_profiles_lower_username on profiles (lower(username));
create index if not exists idx_daily_question_attempts_user_question
  on daily_question_attempts (user_id, daily_question_id);
create index if not exists idx_exam_sessions_exam_user
  on exam_sessions (exam_id, user_id);
create index if not exists idx_questions_source on questions (source);

-- =================================================================
-- PART 4: RLS policy updates
-- =================================================================

-- 4a. School-exam access policy (from migrations 25+28)
drop policy if exists "users can insert own exam access" on user_exam_access;
create policy "users can insert own exam access"
  on user_exam_access for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from exams
      where exams.id = exam_id
        and exams.school_id is not null
    )
  );

-- 4b. Remove client-writable policies for server-only tables (from migration 27)
drop policy if exists "users can insert own results" on results;
drop policy if exists "users can insert own daily question attempts" on daily_question_attempts;

-- =================================================================
-- PART 5: Grants and permissions
-- =================================================================

-- 5a. Revoke blanket grants from migration 09, replace with narrow grants (from migrations 25+27+28)
revoke execute on all functions in schema public from public, anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

-- 5b. Column-level grants on questions (prevent direct REST access to answer keys)
revoke select on table questions from public, anon, authenticated;
grant select (id, subject_id, exam_id, question_text, options, difficulty, created_at, source)
  on table questions to authenticated;

-- 5c. Profiles column-level update grants (from migration 28)
revoke update on table profiles from public, anon, authenticated;
grant update (full_name, username, school_id, avatar_index, onboarding_completed)
  on table profiles to authenticated;

-- 5d. Financial/scored tables: read-only for client roles (from migration 27+28)
revoke insert, update, delete on table payments, entitlements, results, daily_question_attempts
  from public, anon, authenticated;
grant select on table payments, entitlements, results, daily_question_attempts to authenticated;

-- 5e. Narrow table-level grants (from migration 25)
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;

grant select on all tables in schema public to anon;
grant select on all sequences in schema public to anon;

revoke delete, truncate, references, trigger on all tables in schema public from authenticated;
revoke all on all sequences in schema public from authenticated;

grant select, insert, update on all tables in schema public to authenticated;
grant select, usage on all sequences in schema public to authenticated;

alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke all on sequences from anon;
alter default privileges in schema public revoke all on functions from anon;

alter default privileges in schema public grant select on tables to anon;
alter default privileges in schema public grant select on sequences to anon;
alter default privileges in schema public grant execute on functions to anon;

alter default privileges in schema public revoke delete, truncate, references, trigger on tables from authenticated;
alter default privileges in schema public grant select, insert, update on tables to authenticated;
alter default privileges in schema public grant select, usage on sequences to authenticated;
alter default privileges in schema public grant execute on functions to authenticated;

-- Restore explicit grants needed for RLS + operations
grant insert on table contact_submissions to anon;
grant insert on table contact_submissions to authenticated;
grant all on table user_exam_access to authenticated;

-- 5f. Allow-list runtime RPCs (from migrations 27+28)
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
