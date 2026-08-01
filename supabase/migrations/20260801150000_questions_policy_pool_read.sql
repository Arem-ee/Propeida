-- Free users can read questions that belong to their locked free pool.
-- user_exam_free_pools rows are only ever created by the security-definer
-- RPC ensure_exam_free_pool (validates auth.uid(), picks random questions),
-- so this only grants read access to the user's own random sample.
drop policy if exists "questions are accessible by exam access" on public.questions;

create policy "questions are accessible by exam access"
  on public.questions for select
  to authenticated
  using (
    exists (
      select 1 from exams e
      where e.id = questions.exam_id
        and (e.school_id is null
          or exists (
            select 1 from user_exam_access uea
            where uea.exam_id = questions.exam_id
              and uea.user_id = auth.uid()
          ))
    )
    or exists (
      select 1 from user_exam_free_pools p
      where p.question_id = questions.id
        and p.user_id = auth.uid()
    )
  );
