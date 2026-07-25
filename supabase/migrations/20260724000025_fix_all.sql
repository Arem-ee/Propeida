-- 1. Atomic payment processing RPC for webhook + verify reconciliation
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
  -- Upsert payment
  insert into payments (user_id, paystack_reference, amount, status, product, verified_at)
  values (p_user_id, p_reference, p_amount, 'success', p_product, now())
  on conflict (paystack_reference) do update set
    status = 'success',
    verified_at = now()
  where payments.status is distinct from 'success';

  -- Upsert entitlement
  insert into entitlements (user_id, product, status, granted_at, expires_at, source)
  values (p_user_id, p_product::product_type, 'active', now(), null, 'payment')
  on conflict (user_id, product) do update set
    status = 'active',
    granted_at = now(),
    expires_at = null,
    source = 'payment';

  -- Grant referral reward if pending
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

grant execute on function process_payment to service_role;

-- 2. Atomic increment_usage_counter with free-tier cap enforcement
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
declare
  v_current integer;
begin
  if p_field = 'free_questions_answered' then
    insert into usage_counters (user_id, exam_id, free_questions_answered, free_mocks_started)
    values (p_user_id, p_exam_id, 0, 0)
    on conflict (user_id, exam_id) do nothing;

    select free_questions_answered into v_current
    from usage_counters
    where user_id = p_user_id and exam_id = p_exam_id;

    if v_current >= 30 then
      raise exception 'Free tier limit reached for practice questions';
    end if;

    update usage_counters
    set free_questions_answered = free_questions_answered + 1
    where user_id = p_user_id and exam_id = p_exam_id;
  elsif p_field = 'free_mocks_started' then
    insert into usage_counters (user_id, exam_id, free_questions_answered, free_mocks_started)
    values (p_user_id, p_exam_id, 0, 0)
    on conflict (user_id, exam_id) do nothing;

    select free_mocks_started into v_current
    from usage_counters
    where user_id = p_user_id and exam_id = p_exam_id;

    if v_current >= 1 then
      raise exception 'Free tier limit reached for mock exams';
    end if;

    update usage_counters
    set free_mocks_started = free_mocks_started + 1
    where user_id = p_user_id and exam_id = p_exam_id;
  end if;
end;
$$;

-- 2b. Create a separate RPC for free mock attempts with configurable cap
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
declare
  v_current integer;
begin
  insert into usage_counters (user_id, exam_id, free_questions_answered, free_mocks_started)
  values (p_user_id, p_exam_id, 0, 0)
  on conflict (user_id, exam_id) do nothing;

  select free_mocks_started into v_current
  from usage_counters
  where user_id = p_user_id and exam_id = p_exam_id;

  if v_current >= p_max_mocks then
    return false;
  end if;

  update usage_counters
  set free_mocks_started = free_mocks_started + 1
  where user_id = p_user_id and exam_id = p_exam_id;

  return true;
end;
$$;

grant execute on function try_start_free_mock to authenticated;

-- 3. Fix ensure_daily_question: handle empty questions table gracefully
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

  -- Check if questions table has any rows at all
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

-- 4. Add CHECK constraint on results.accuracy (must be 0-1 range)
alter table results add constraint results_accuracy_check
  check (accuracy >= 0 and accuracy <= 1);

-- 5. Add unique constraint on session_answers(session_id, question_id)
delete from session_answers sa
using session_answers sa2
where sa.id < sa2.id
  and sa.session_id = sa2.session_id
  and sa.question_id = sa2.question_id;

alter table session_answers add constraint session_answers_session_question_key
  unique (session_id, question_id);

-- 6. Missing indexes
create index if not exists idx_profiles_lower_username on profiles (lower(username));
create index if not exists idx_daily_question_attempts_user_question
  on daily_question_attempts (user_id, daily_question_id);
create index if not exists idx_exam_sessions_exam_user
  on exam_sessions (exam_id, user_id);
create index if not exists idx_questions_source on questions (source);

-- 7. Fix user_exam_access RLS: only allow inserting access to school-specific exams
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

-- 8. Narrow grants: anon and authenticated should not have ALL on every table
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
revoke all on all functions in schema public from anon;

grant select on all tables in schema public to anon;
grant select on all sequences in schema public to anon;
grant execute on all functions in schema public to anon;

revoke delete, truncate, references, trigger on all tables in schema public from authenticated;
revoke all on all sequences in schema public from authenticated;

grant select, insert, update on all tables in schema public to authenticated;
grant select, usage on all sequences in schema public to authenticated;
grant execute on all functions in schema public to authenticated;

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

-- Restore explicit grants needed for RLS + operations that authenticated users do
grant insert on table contact_submissions to anon;
grant insert on table contact_submissions to authenticated;
grant all on table user_exam_access to authenticated;
