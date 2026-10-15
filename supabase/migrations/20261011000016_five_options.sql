-- 5-option legacy support: pre-2013 JAMB used A-E. Storage (jsonb/text)
-- is already generic; only the answer-recording guard constrained a-d.
-- Players render the options array generically; validations andthe paste
-- parser are extended in code alongside this migration.

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

  select q.correct_answer into v_correct_answer
  from exam_sessions es
  join session_answers sa on sa.session_id = es.id and sa.question_id = p_question_id
  join questions q on q.id = sa.question_id
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
