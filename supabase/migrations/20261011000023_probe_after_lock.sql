-- Probe 3: the privilege state AFTER the answer-column lock. Read back
-- over the REST API, then the probe table is dropped by the next
-- migration.

insert into public._probe (id, payload)
select 1,
  json_build_object(
    'authed_effective_correct', (
      select has_column_privilege('authenticated', 'public.questions', 'correct_answer', 'SELECT')
    ),
    'authed_effective_explanation', (
      select has_column_privilege('authenticated', 'public.questions', 'explanation', 'SELECT')
    ),
    'authed_effective_question_text', (
      select has_column_privilege('authenticated', 'public.questions', 'question_text', 'SELECT')
    ),
    'authed_effective_options', (
      select has_column_privilege('authenticated', 'public.questions', 'options', 'SELECT')
    ),
    'authed_effective_exam_id', (
      select has_column_privilege('authenticated', 'public.questions', 'exam_id', 'SELECT')
    ),
    'anon_effective_correct', (
      select has_column_privilege('anon', 'public.questions', 'correct_answer', 'SELECT')
    ),
    'svc_effective_correct', (
      select has_column_privilege('service_role', 'public.questions', 'correct_answer', 'SELECT')
    )
  )::text
on conflict (id) do update set payload = excluded.payload;
