create or replace function get_session_questions(
  p_exam_id uuid,
  p_subject_ids uuid[],
  p_difficulty question_difficulty default null,
  p_limit integer default 10,
  p_seed text default ''
)
returns table (
  id uuid,
  subject_id uuid,
  question_text text,
  options jsonb
)
language sql
stable
as $$
  select q.id, q.subject_id, q.question_text, q.options
  from questions q
  where q.exam_id = p_exam_id
    and q.subject_id = any(p_subject_ids)
    and (p_difficulty is null or q.difficulty = p_difficulty)
  order by md5(q.id::text || p_seed)
  limit p_limit;
$$;

insert into app_config (key, value) values
  ('mock_defaults', '{
    "jamb": {"question_count": 50, "time_limit_seconds": 1800},
    "post-utme": {"question_count": 50, "time_limit_seconds": 1800},
    "waec": {"question_count": null, "time_limit_seconds": null},
    "scholarship": {"question_count": null, "time_limit_seconds": null},
    "aptitude": {"question_count": null, "time_limit_seconds": null},
    "postgraduate": {"question_count": null, "time_limit_seconds": null}
  }'::jsonb)
on conflict (key) do update set value = excluded.value, updated_at = now();
