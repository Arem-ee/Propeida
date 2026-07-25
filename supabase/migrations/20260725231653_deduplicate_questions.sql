-- Deduplicate questions: keep the first occurrence per (exam_id, subject_id, question_text)
-- and remove all extra copies. Delete dependent rows first.

do $$
declare
  v_keep_ids uuid[];
  v_delete_ids uuid[];
begin
  -- Build arrays of IDs to keep (first row per duplicate group)
  select array_agg(id) into v_keep_ids
  from (
    select distinct on (exam_id, subject_id, question_text) id
    from questions
    order by exam_id, subject_id, question_text, created_at asc
  ) keep;

  -- Build array of IDs to delete (all questions not in keep list)
  select array_agg(id) into v_delete_ids
  from questions
  where id <> all (v_keep_ids);

  raise notice 'Keeping % questions, deleting % duplicates',
    array_length(v_keep_ids, 1),
    array_length(v_delete_ids, 1);

  -- Delete dependent rows referencing questions-to-be-deleted
  delete from session_answers where question_id = any (v_delete_ids);
  delete from daily_questions where question_id = any (v_delete_ids);

  -- Delete duplicate questions
  delete from questions where id = any (v_delete_ids);
end;
$$;
