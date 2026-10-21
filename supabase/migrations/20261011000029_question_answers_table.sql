-- Move the answer key out of questions.
--
-- Until now the answer lived in questions.correct_answer, and hiding it
-- from learners required a per-column grant list: every column added to
-- questions in future would have to be added to that list by hand, or it
-- would silently become invisible to signed-in learners.
--
-- The answer now lives in its own table with no grants to anon or
-- authenticated. questions keeps plain table-level SELECT, so its columns
-- work with no maintenance, and the answer is structurally unreachable
-- rather than merely ungranted.
--
-- This migration is phase A and is non-destructive: questions.correct_answer
-- and questions.explanation still hold their values, so every code path
-- that still reads them keeps working. A trigger mirrors writes into
-- question_answers, so the import and admin write paths do not change
-- either. Phase B (a later migration) empties the old columns and
-- restores plain table-level SELECT, and runs only after the code that
-- reads question_answers is deployed.

create table if not exists question_answers (
  question_id uuid primary key references questions(id) on delete cascade,
  correct_answer text not null,
  explanation text
);

-- The default privileges in this schema grant select/insert/update on new
-- tables to authenticated. The answer table must not be among them.
revoke all on question_answers from anon, authenticated;

alter table question_answers enable row level security;
-- No policies on purpose: the only readers are the table owner (the
-- service role) and the security definer functions below.

insert into question_answers (question_id, correct_answer, explanation)
select q.id, q.correct_answer, q.explanation
from questions q
where q.correct_answer is not null
on conflict (question_id) do update
  set correct_answer = excluded.correct_answer,
      explanation = excluded.explanation;

-- Mirror writes. The admin import, paste and edit paths all write the
-- answer into questions; this keeps question_answers in step without
-- touching a single one of them.
create or replace function sync_question_answers()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.correct_answer is not null
     and (tg_op = 'INSERT'
          or new.correct_answer is distinct from old.correct_answer
          or new.explanation is distinct from old.explanation) then
    insert into question_answers (question_id, correct_answer, explanation)
    values (new.id, new.correct_answer, new.explanation)
    on conflict (question_id) do update
      set correct_answer = excluded.correct_answer,
          explanation = excluded.explanation;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sync_question_answers on questions;

create trigger trg_sync_question_answers
after insert or update on questions
for each row execute function sync_question_answers();

-- Grading a session answer reads the key from question_answers now.
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
  v_is_correct boolean;
  v_code text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  if p_selected_answer not in ('a', 'b', 'c', 'd', 'e') then
    raise exception 'Invalid answer';
  end if;

  select qa.correct_answer into v_correct_answer
  from exam_sessions es
  join session_answers sa on sa.session_id = es.id and sa.question_id = p_question_id
  join question_answers qa on qa.question_id = sa.question_id
  where es.id = p_session_id
    and es.user_id = auth.uid()
    and es.status = 'in_progress';

  if not found then
    raise exception 'Active session question not found';
  end if;

  v_is_correct := (p_selected_answer = v_correct_answer);

  if not v_is_correct then
    select qm.misconception_code into v_code
    from question_misconceptions qm
    where qm.question_id = p_question_id
      and qm.option_key = p_selected_answer
    limit 1;
  end if;

  update session_answers
  set selected_answer = p_selected_answer,
      is_correct = v_is_correct,
      misconception_code = v_code
  where session_id = p_session_id and question_id = p_question_id;

  return v_is_correct;
end;
$$;

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
  set is_correct = (sa.selected_answer is not null and sa.selected_answer = qa.correct_answer)
  from question_answers qa
  where sa.session_id = p_session_id and qa.question_id = sa.question_id;

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

create or replace function get_session_answer_reveal(
  p_session_id uuid,
  p_question_id uuid
)
returns table (correct_answer text, explanation text)
language sql
security definer
set search_path = public
as $$
  select qa.correct_answer, qa.explanation
  from exam_sessions es
  join session_answers sa on sa.session_id = es.id and sa.question_id = p_question_id
  join question_answers qa on qa.question_id = sa.question_id
  where es.id = p_session_id
    and es.user_id = auth.uid()
    and ((es.mode = 'practice' and sa.selected_answer is not null) or es.status = 'completed');
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
         sa.is_correct, qa.correct_answer, qa.explanation, sa.time_taken_seconds
  from exam_sessions es
  join session_answers sa on sa.session_id = es.id
  join questions q on q.id = sa.question_id
  join question_answers qa on qa.question_id = q.id
  where es.id = p_session_id
    and es.user_id = auth.uid()
    and es.status = 'completed'
  order by sa.id;
$$;

create or replace function get_question_review_queue()
returns table (
  id uuid,
  exam_id uuid,
  subject_id uuid,
  question_text text,
  options jsonb,
  correct_answer text,
  explanation text,
  difficulty question_difficulty,
  cognitive_level text,
  status text,
  verified_state text,
  review_note text,
  exams jsonb,
  subjects jsonb
)
language sql
security definer
set search_path = public
as $$
  select
    q.id,
    q.exam_id,
    q.subject_id,
    q.question_text,
    q.options,
    qa.correct_answer,
    qa.explanation,
    q.difficulty,
    q.cognitive_level,
    q.status,
    q.verified_state,
    q.review_note,
    jsonb_build_object('name', e.name),
    jsonb_build_object('name', s.name)
  from questions q
  join question_answers qa on qa.question_id = q.id
  join exams e on e.id = q.exam_id
  join subjects s on s.id = q.subject_id
  where q.status in ('draft', 'in_review')
    and exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.is_admin
    )
  order by q.created_at asc;
$$;
