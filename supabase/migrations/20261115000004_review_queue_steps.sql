-- Extend the admin question review queue with steps, so the reviewer can
-- check the worked steps and the answer key out of the same call instead of
-- trusting a hidden column.

drop function if exists public.get_question_review_queue();

create or replace function public.get_question_review_queue()
returns table (
  id uuid,
  exam_id uuid,
  subject_id uuid,
  question_text text,
  options jsonb,
  correct_answer text,
  explanation text,
  steps jsonb,
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
    qa.steps,
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

revoke all on function public.get_question_review_queue() from public, anon;
grant execute on function public.get_question_review_queue() to authenticated, service_role;
