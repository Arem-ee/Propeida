-- Probe: how can a developer add a question directly, and what can they
-- read back? Tests the direct-SQL path (this migration runs as the table
-- owner) and records the RLS/grant state for the other paths.

create table if not exists public._probe3 (id int primary key default 1, payload text);

-- Direct SQL as the owner: the path a developer takes in the Supabase SQL
-- editor or a psql session.
insert into questions (exam_id, subject_id, question_text, options, correct_answer, explanation, difficulty, source)
select e.id, s.id, 'DEVSQL PROBE', '[{"key":"a","text":"Alpha"},{"key":"b","text":"Beta"}]'::jsonb, 'b', 'devsql probe explanation', 'medium', 'devsql'
from exams e, subjects s
where e.slug = 'unilorin-post-utme' and s.slug = 'english'
limit 1;

insert into public._probe3 (id, payload)
select 1,
  json_build_object(
    'devsql_row_lands', (
      select count(*) from questions where question_text = 'DEVSQL PROBE'
    ),
    'devsql_row_answer', (
      select correct_answer from questions where question_text = 'DEVSQL PROBE' limit 1
    ),
    'insert_policies_for_authenticated', (
      select count(*) from pg_policies
      where schemaname = 'public' and tablename = 'questions' and cmd in ('INSERT','UPDATE','DELETE','ALL')
    ),
    'questions_table_acl', (
      select coalesce(array_to_string(relacl, ' '), 'null') from pg_class
      where oid = 'public.questions'::regclass
    ),
    'authenticated_insert_privilege', (
      select has_table_privilege('authenticated', 'public.questions', 'INSERT')
    ),
    'service_role_insert_privilege', (
      select has_table_privilege('service_role', 'public.questions', 'INSERT')
    ),
    'authenticated_column_insert_privilege', (
      select has_column_privilege('authenticated', 'public.questions', 'correct_answer', 'INSERT')
    )
  )::text
on conflict (id) do update set payload = excluded.payload;
