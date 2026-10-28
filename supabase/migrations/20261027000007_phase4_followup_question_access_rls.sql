-- Phase 4 follow-up, part 2: the two remaining policies that still call
-- auth.uid() directly. `questions` is the hottest policy in the app (every
-- practice/mock selection evaluates it), so the per-row function call is worth
-- removing here as well. Semantics are unchanged.
--
-- After this migration no public policy calls auth.uid() outside a
-- once-per-query initplan, which verify_reconciliation.sql now asserts.

alter policy "questions are accessible by exam access" on public.questions
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.is_admin
    )
    or public.has_campaign_access()
    or exists (
      select 1
      from public.exams e
      where e.id = questions.exam_id
        and (
          e.school_id is null
          or exists (
            select 1
            from public.user_exam_access uea
            where uea.exam_id = questions.exam_id
              and uea.user_id = (select auth.uid())
          )
        )
    )
    or exists (
      select 1
      from public.user_exam_free_pools p
      where p.question_id = questions.id
        and p.user_id = (select auth.uid())
    )
  );

alter policy "admins read question reviews" on public.question_reviews
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.is_admin
    )
  );
