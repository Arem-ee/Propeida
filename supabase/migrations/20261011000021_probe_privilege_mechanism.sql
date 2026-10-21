-- Probe 2: why the column-level revoke did not take effect.
--
-- PostgreSQL resolves column privileges from the column's own ACL when
-- one exists, and otherwise from the table's ACL. A REVOKE on a column
-- only works if the table-level grant is also withdrawn, so this checks
-- whether pg_attribute.attacl was populated for the answer columns.

insert into public._probe (id, payload)
select 1,
  json_build_object(
    'correct_attacl_is_null', (
      select attacl is null from pg_attribute
      where attrelid = 'public.questions'::regclass and attname = 'correct_answer'
    ),
    'explanation_attacl_is_null', (
      select attacl is null from pg_attribute
      where attrelid = 'public.questions'::regclass and attname = 'explanation'
    ),
    'question_text_attacl_is_null', (
      select attacl is null from pg_attribute
      where attrelid = 'public.questions'::regclass and attname = 'question_text'
    ),
    'authed_effective_correct', (
      select has_column_privilege('authenticated', 'public.questions', 'correct_answer', 'SELECT')
    ),
    'authed_effective_question_text', (
      select has_column_privilege('authenticated', 'public.questions', 'question_text', 'SELECT')
    ),
    'all_question_columns', (
      select string_agg(attname, ',' order by attnum)
      from pg_attribute
      where attrelid = 'public.questions'::regclass and attnum > 0 and not attisdropped
    )
  )::text
on conflict (id) do update set payload = excluded.payload;
