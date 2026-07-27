-- Assign each free user a fixed pool of 50 questions they can practice.
-- They can repeat those 50 questions unlimited times but never access others.

create table if not exists user_free_questions (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references questions(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

-- Ensure the pool exists for a user; if not, select 50 random questions
-- from across all exams and insert them.
create or replace function ensure_free_question_pool(p_user_id uuid)
returns setof uuid
language plpgsql
security definer
set search_path = 'public'
as $$
begin
  if p_user_id <> auth.uid() then
    raise exception 'User ID mismatch';
  end if;

  -- If pool already has entries, return them
  if exists (select 1 from user_free_questions where user_id = p_user_id) then
    return query select question_id from user_free_questions
      where user_id = p_user_id
      order by assigned_at;
    return;
  end if;

  -- Assign 50 random questions
  insert into user_free_questions (user_id, question_id)
  select p_user_id, q.id
  from (
    select id from questions
    order by random()
    limit 50
  ) q;

  return query select question_id from user_free_questions
    where user_id = p_user_id
    order by assigned_at;
end;
$$;

grant execute on function ensure_free_question_pool(uuid) to authenticated;
