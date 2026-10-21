-- Withdraw the answer key from the learner role.
--
-- RLS is row-level and cannot hide a column, so the grant is withdrawn at
-- column level: a signed-in learner can read the question and its options,
-- but not the key or the explanation that gives it away. Before this, any
-- learner could query the REST API for every answer in the bank.
--
-- The app still needs both columns server-side. Every read path that
-- needs them now uses the service-role client (lib/supabase/admin.ts)
-- inside a server action that has already proven the caller's identity
-- with the caller's own session. The service role is unaffected by this
-- revoke, so admin tooling and server actions keep working.
--
-- Ordering: this migration must be applied only after the code that reads
-- these columns through the service role is deployed. The old read paths
-- used the learner's own session and would fail against this revoke.

-- The editorial review queue is the one place a client component still
-- needs the answer: a reviewer has to see the key to verify the item. It
-- becomes a definer function gated on the caller being an admin, so the
-- answer is served only to the people whose job is checking it.
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
    q.correct_answer,
    q.explanation,
    q.difficulty,
    q.cognitive_level,
    q.status,
    q.verified_state,
    q.review_note,
    jsonb_build_object('name', e.name),
    jsonb_build_object('name', s.name)
  from questions q
  join exams e on e.id = q.exam_id
  join subjects s on s.id = q.subject_id
  where q.status in ('draft', 'in_review')
    and exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.is_admin
    )
  order by q.created_at asc;
$$;

grant execute on function get_question_review_queue() to authenticated;

revoke select (correct_answer, explanation) on questions from anon, authenticated;

-- response_text is new on learning_attempts. ALTER TABLE ADD COLUMN picks
-- up the table's default privileges, but the column grant is stated here
-- so the learner's own inserts of their written answer are explicit.
grant select (response_text), insert (response_text), update (response_text)
  on learning_attempts to authenticated;
