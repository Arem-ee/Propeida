-- Aggregate published-question counts in the database.
--
-- The mocks page used to page through every published question row to build
-- its per-exam/subject counts. That is O(rows) on every cold cache miss and
-- grows with the bank. A single grouped aggregate makes the cold path O(1)
-- from the app's perspective, with the same public/catalogue data.

create or replace function get_published_question_counts()
returns jsonb
language sql
stable
security definer
set search_path = 'public'
as $$
  select coalesce(
    jsonb_object_agg(exam_id, per_subject),
    '{}'::jsonb
  )
  from (
    select exam_id::text,
           jsonb_object_agg(subject_id::text, n) as per_subject
    from (
      select exam_id, subject_id, count(*)::integer as n
      from questions
      where status = 'published'
      group by exam_id, subject_id
    ) grouped
    group by exam_id
  ) by_exam;
$$;

revoke all on function get_published_question_counts() from public, anon;
grant execute on function get_published_question_counts() to authenticated, service_role;
