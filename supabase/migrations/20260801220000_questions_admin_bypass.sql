-- Admins (is_admin on profiles) can read all questions regardless of exam
-- access, so the admin questions console never depends on the admin's own
-- user_exam_access rows. The subquery only reads the viewer's own profile,
-- so non-admin behavior is unchanged.
drop policy if exists "questions are accessible by exam access" on public.questions;

create policy "questions are accessible by exam access"
  on public.questions for select
  to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.is_admin
    )
    or exists (
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
