-- Follow-up to 20261112000001_content_access_rls.sql.
-- The questions policy referenced public.user_free_questions, which the
-- phase-2 lockdown (20261027000002_phase2_close_answer_oracle_and_pool_writes.sql)
-- deliberately stripped of SELECT for anon/authenticated. A policy
-- subquery without a table grant fails the whole read with 42501, so every
-- authenticated question fetch 403'd — including the national-bank branch.
--
-- Fix: move both pool lookups behind a security-definer helper (same
-- pattern as lesson_readable). The helper bypasses the table grants safely:
-- it exposes only "is THIS question in MY pools", nothing else.

create or replace function public.is_own_free_pool_question(p_question_id uuid)
returns boolean
language sql stable security definer
set search_path = 'public'
as $$
  select exists (
    select 1
    from public.user_free_questions
    where question_id = p_question_id
      and user_id = auth.uid()
  )
  or exists (
    select 1
    from public.user_exam_free_pools
    where question_id = p_question_id
      and user_id = auth.uid()
  )
$$;

revoke all on function public.is_own_free_pool_question(uuid) from public, anon;
grant execute on function public.is_own_free_pool_question(uuid) to authenticated, service_role;

drop policy if exists "questions are accessible by exam access" on public.questions;
create policy "questions are accessible by exam access"
  on public.questions for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.is_admin
    )
    or public.has_campaign_access()
    or exists (
      select 1 from public.exams e
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
        select 1 from public.entitlements ent
        where ent.user_id = (select auth.uid())
          and ent.status = 'active'
          and (ent.expires_at is null or ent.expires_at > now())
          and ent.product in ('putme_pro', 'putme_pro_yearly')
      )
    )
  );
