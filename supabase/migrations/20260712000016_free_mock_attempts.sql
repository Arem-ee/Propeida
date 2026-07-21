-- 1. Configurable free mock attempts per exam (default 1, Post-UTME = 2)
insert into app_config (key, value) values
  ('free_mock_attempts', '{"__default__": 1, "unilorin-post-utme": 2}'::jsonb)
on conflict (key) do update set value = excluded.value, updated_at = now();

-- 2. Rename usage_counters.free_mocks_completed → free_mocks_started
--    The counter now increments on session start, not completion
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'usage_counters' and column_name = 'free_mocks_completed'
  ) then
    alter table usage_counters rename column free_mocks_completed to free_mocks_started;
  end if;
end $$;

-- 3. Update increment_usage_counter RPC to use new column name
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
  insert into usage_counters (user_id, exam_id, free_questions_answered, free_mocks_started)
  values (p_user_id, p_exam_id, 0, 0)
  on conflict (user_id, exam_id) do nothing;

  if p_field = 'free_questions_answered' then
    update usage_counters
    set free_questions_answered = free_questions_answered + 1
    where user_id = p_user_id and exam_id = p_exam_id;
  elsif p_field = 'free_mocks_started' then
    update usage_counters
    set free_mocks_started = free_mocks_started + 1
    where user_id = p_user_id and exam_id = p_exam_id;
  end if;
end;
$$;
