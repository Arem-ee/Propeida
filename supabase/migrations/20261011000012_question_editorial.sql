-- Question editorial workflow: no item reaches a learner without passing
-- through draft → in_review → published. Verification states follow the
-- docs convention: unverified 🔴, source_cited 🔶, human_verified ✅.
--
-- Existing rows backfill to published/human_verified: they are the live bank
-- learners already use, and the product claims human checking. Everything
-- created from here defaults to draft/unverified.

alter table questions
  add column if not exists status text not null default 'draft'
    check (status in ('draft', 'in_review', 'published', 'rejected')),
  add column if not exists verified_state text not null default 'unverified'
    check (verified_state in ('unverified', 'source_cited', 'human_verified')),
  add column if not exists verified_by uuid,
  add column if not exists verified_at timestamptz,
  add column if not exists review_note text;

update questions
set status = 'published',
    verified_state = 'human_verified',
    verified_at = now()
where status = 'draft';

create index if not exists questions_status_idx on questions (status);

-- Learner selection serves published items only. Drafts, items under
-- review, and rejected items never leave the admin surface.
create or replace function get_session_questions(
  p_exam_id uuid,
  p_subject_ids uuid[],
  p_difficulty question_difficulty default null,
  p_limit integer default 10,
  p_seed text default ''
)
returns table (
  id uuid,
  subject_id uuid,
  question_text text,
  options jsonb
)
language sql
stable
as $$
  with served as (
    select distinct sa.question_id
    from session_answers sa
    join exam_sessions es on es.id = sa.session_id
    where es.user_id = auth.uid()
      and es.exam_id = p_exam_id
  ),
  remaining as (
    select count(*)::int as n
    from questions q
    where q.exam_id = p_exam_id
      and q.status = 'published'
      and (array_length(p_subject_ids, 1) is null or q.subject_id = any(p_subject_ids))
      and (p_difficulty is null or q.difficulty = p_difficulty)
      and not exists (select 1 from served s where s.question_id = q.id)
  )
  select q.id, q.subject_id, q.question_text, q.options
  from questions q
  where q.exam_id = p_exam_id
    and q.status = 'published'
    and (array_length(p_subject_ids, 1) is null or q.subject_id = any(p_subject_ids))
    and (p_difficulty is null or q.difficulty = p_difficulty)
    and (
      not exists (select 1 from served s where s.question_id = q.id)
      or (select n from remaining) < p_limit
    )
  order by md5(q.id::text || p_seed)
  limit p_limit;
$$;

-- Free-pool assignment draws from published items only, so a newly pasted
-- draft can never land in a learner's fixed pool of 50.
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

  if exists (select 1 from user_free_questions where user_id = p_user_id) then
    return query select question_id from user_free_questions
      where user_id = p_user_id
      order by assigned_at;
    return;
  end if;

  insert into user_free_questions (user_id, question_id)
  select p_user_id, q.id
  from (
    select id from questions
    where status = 'published'
    order by random()
    limit 50
  ) q;

  return query select question_id from user_free_questions
    where user_id = p_user_id
    order by assigned_at;
end;
$$;
