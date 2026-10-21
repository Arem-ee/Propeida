-- Response types: not every question is multiple choice.
--
-- Mathematics and Physics need derivations; English, CRK and Government need
-- short answers. Those cannot be graded by key match, so the question type
-- becomes a first-class column instead of an inference from the options
-- array being empty.
--
-- The model answer for a text/derivation item lives in the SAME
-- questions.correct_answer column: by response_type it means "the answer to
-- compare against" for mcq and "the model answer to reveal" for text. No
-- second answer-holding column is introduced, so answer exposure stays
-- exactly where it already is (server-side reads via recordLessonAttempt).
--
-- rubric_criteria holds the explicit criteria a learner self-assesses
-- against: [{id, text, weight}]. It is not sensitive — the learner sees
-- the criteria. Kept on the question so criteria travel with the item
-- wherever it is served.

alter table questions
  add column if not exists response_type text not null default 'mcq'
    check (response_type in ('mcq', 'text', 'derivation')),
  add column if not exists rubric_criteria jsonb null;

-- A text question has no option keys, and is not graded by key match.
alter table questions alter column options drop not null;
alter table questions alter column correct_answer drop not null;

create index if not exists questions_response_type_idx
  on questions (response_type);

-- A free-response answer is the learner's own words. It has to be kept:
-- the learner revisits it, and the review path reads it. Null for
-- multiple-choice attempts, which remain unpersisted as before.
alter table learning_attempts
  add column if not exists response_text text null;

-- Serving function: expose response_type so the player renders the right
-- input (option buttons vs a response field), and let the caller say which
-- response types it can actually handle.
--
-- The default is mcq only, and that default is load-bearing: sessions and
-- mocks are multiple-choice by construction (record_session_answer accepts
-- only a-e), so they must never receive an item with null options. Only the
-- lesson player, which knows how to render a response field, opts in to
-- text and derivation.
--
-- The return table changes shape, and CREATE OR REPLACE cannot change a
-- function's return type — so the function is dropped and recreated. The
-- drop also removes the EXECUTE grant, and this schema's default
-- privileges revoke EXECUTE from public/anon/authenticated, so the grant
-- must be restored explicitly against the reviewed allow-list.
--
-- The body is carried over verbatim from the published-only version
-- (20261011000012_question_editorial.sql), which already includes the
-- served-question exclusion from 20260809000007. The only changes are the
-- return table, the new parameter, and the response_type filter.
drop function if exists get_session_questions(uuid, uuid[], question_difficulty, integer, text);

create function get_session_questions(
  p_exam_id uuid,
  p_subject_ids uuid[],
  p_difficulty question_difficulty default null,
  p_limit integer default 10,
  p_seed text default '',
  p_response_types text[] default array['mcq']::text[]
)
returns table (
  id uuid,
  subject_id uuid,
  question_text text,
  options jsonb,
  response_type text
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
      and q.response_type = any(coalesce(p_response_types, array['mcq']::text[]))
      and (array_length(p_subject_ids, 1) is null or q.subject_id = any(p_subject_ids))
      and (p_difficulty is null or q.difficulty = p_difficulty)
      and not exists (select 1 from served s where s.question_id = q.id)
  )
  select q.id, q.subject_id, q.question_text, q.options, q.response_type
  from questions q
  where q.exam_id = p_exam_id
    and q.status = 'published'
    and q.response_type = any(coalesce(p_response_types, array['mcq']::text[]))
    and (array_length(p_subject_ids, 1) is null or q.subject_id = any(p_subject_ids))
    and (p_difficulty is null or q.difficulty = p_difficulty)
    and (
      not exists (select 1 from served s where s.question_id = q.id)
      or (select n from remaining) < p_limit
    )
  order by md5(q.id::text || p_seed)
  limit p_limit;
$$;

grant execute on function get_session_questions(uuid, uuid[], question_difficulty, integer, text, text[]) to authenticated;

-- The free pool feeds multiple-choice sessions, so it must not reserve
-- items the session player cannot render.
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
      and response_type = 'mcq'
    order by random()
    limit 50
  ) q;

  return query select question_id from user_free_questions
  where user_id = p_user_id
  order by assigned_at;
end;
$$;
