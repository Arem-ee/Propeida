-- 1. Fix try_start_free_mock: add auth.uid() check + atomic concurrency-safe increment
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

grant execute on function try_start_free_mock to authenticated;

-- 2. Fix increment_usage_counter: add auth.uid() check + atomic concurrency-safe increments
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

-- 3. Make constraint additions from migration 25 idempotent
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'results_accuracy_check') then
    alter table results add constraint results_accuracy_check
      check (accuracy >= 0 and accuracy <= 1);
  end if;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'session_answers_session_question_key') then
    alter table session_answers add constraint session_answers_session_question_key
      unique (session_id, question_id);
  end if;
end;
$$;

-- 4. Make policy creation idempotent
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
