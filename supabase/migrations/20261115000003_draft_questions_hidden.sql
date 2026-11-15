-- Content access: draft questions are not readable by learners.
--
-- The 2026-11-12 policy let any authenticated caller read every JAMB/national
-- question — and, after Phase B, that includes anything written to DRAFT rows
-- by the ingestion tools or the admin before a human reviews them. Worked
-- steps make a draft's intended answer readable by construction, so an
-- unverified draft leaks more than the raw stem ever did. This migration
-- locks the national funnel to `status = 'published'` for everyone other
-- than admins. Admins keep the unconditional view they need to review.
--
-- The scope (which exams are national vs school-specific), the PUTME
-- rational, the free pools and the campaign check are untouched from
-- 20261011000001_content_access_rls; only the missing status filter is
-- added.

drop policy if exists "questions are accessible by exam access" on public.questions;

create policy "questions are accessible by exam access"
  on public.questions for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid()) and p.is_admin
    )
    or public.has_campaign_access()
    or (
      status = 'published'
      and (
        exists (
          select 1
          from public.exams e
          where e.id = questions.exam_id
            and e.school_id is null
        )
        or public.is_own_free_pool_question(questions.id)
        or (
          exists (
            select 1
            from public.exams e
            join public.user_exam_access uea
              on uea.exam_id = e.id
             and uea.user_id = (select auth.uid())
            where e.id = questions.exam_id
              and e.school_id is not null
          )
          and exists (
            select 1
            from public.entitlements ent
            where ent.user_id = (select auth.uid())
              and ent.status = 'active'
              and (ent.expires_at is null or ent.expires_at > now())
              and ent.product in ('putme_pro', 'putme_pro_yearly')
          )
        )
      )
    )
  );
