-- Phase 2: close the mock answer oracle and the free-pool write surface.
--
-- 1. record_session_answer graded an answer and returned is_correct for every
--    session mode. A mock withholds feedback until submission, so the RPC was
--    an answer-key oracle: call it with 'a', then 'b', then 'c' and read the
--    boolean until it flips. The function now records the answer and returns
--    nothing. Practice keeps its feedback because submitAnswer derives the
--    grade from get_session_answer_reveal, which is already gated to practice
--    mode (selected_answer is not null) or a completed session.
--
-- 2. session_answers.is_correct and misconception_code were readable by the
--    learner role, which re-opened the same oracle without the RPC. Withdraw
--    the table SELECT and grant back only the columns a client reads. Every
--    server path that needs the grading columns now uses the service-role
--    client (lib/practice.ts, lib/mastery.ts), and ownership is proven before
--    the privileged read.
--
-- 3. user_free_questions was created without RLS in the migration chain (the
--    live database had it enabled out of band) and inherited the default
--    INSERT/UPDATE/SELECT grants to authenticated. Enable RLS in the chain,
--    withdraw every client grant, and keep the security-definer
--    ensure_free_question_pool RPC as the only way in or out. The same write
--    revokes go on user_exam_free_pools for defence in depth.

-- 1. Grading becomes a pure write. DROP is required because a function's
--    return type cannot be changed with CREATE OR REPLACE.
drop function if exists public.record_session_answer(uuid, uuid, text);

create function public.record_session_answer(
  p_session_id uuid,
  p_question_id uuid,
  p_selected_answer text
)
returns void
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
end;
$$;

revoke execute on function public.record_session_answer(uuid, uuid, text)
  from public, anon;
grant execute on function public.record_session_answer(uuid, uuid, text)
  to authenticated, service_role;

-- 2. session_answers: clients keep the columns the player reads; the grading
--    columns become service-role only. The table SELECT is withdrawn first so
--    the column grants are the effective ACL (same mechanism as questions in
--    20261011000022).
revoke select on table public.session_answers from public, anon, authenticated;

grant select (
  id,
  session_id,
  question_id,
  selected_answer,
  time_taken_seconds
) on table public.session_answers to authenticated;

-- 3. Free pools are server-managed. The RPCs are SECURITY DEFINER and run as
--    the table owner, so revoking client grants does not affect them.
alter table public.user_free_questions enable row level security;

revoke select, insert, update, delete on table public.user_free_questions
  from public, anon, authenticated;

revoke insert, update, delete on table public.user_exam_free_pools
  from public, anon, authenticated;
revoke select on table public.user_exam_free_pools from public, anon;

-- Anon has no business calling the pool RPCs; auth.uid() is null for anon, so
-- the calls could only fail, but keep the surface off the anonymous role.
revoke execute on function public.ensure_free_question_pool(uuid)
  from public, anon;
grant execute on function public.ensure_free_question_pool(uuid)
  to authenticated, service_role;

revoke execute on function public.ensure_exam_free_pool(uuid, uuid)
  from public, anon;
grant execute on function public.ensure_exam_free_pool(uuid, uuid)
  to authenticated, service_role;

-- Verify with supabase/verification/verify_reconciliation.sql (Phase 2
-- assertions) and scripts/verify-phase2-security.mjs.
