-- Content access hardening (2026-11-12).
--
-- 1. Lessons are paid material. Until now, "anyone reads published lessons"
--    exposed the entire published corpus (lessons + blocks) to any anonymous
--    caller holding the public anon key, while the app charged for it.
--    After this migration, published lessons are readable only by:
--      a) the free first lesson of each subject (lowest topic sort_order), or
--      b) learners with an active entitlement of any product, or
--      c) campaign access, or d) admins.
--    Anonymous callers get nothing. The app keeps its paywall UI; the data
--    layer now enforces it independently.
--
-- 2. Questions: national exams stay readable (free national practice funnel,
--    2026-08-01 decision — do NOT remove without a locked-pool redesign).
--    School banks no longer open with a self-service user_exam_access row
--    alone; they require an active PUTME entitlement (mirrors the app's
--    hasExamAccess). user_exam_access remains self-service for personal path
--    selection only. Own global free-pool rows (user_free_questions) are now
--    honoured as well; previously only the per-exam pool was, so free
--    practice on non-locked-pool exams read zero rows from `questions`.

-- ---------- helpers ----------

create or replace function public.has_active_entitlement()
returns boolean
language sql stable security definer
set search_path = 'public'
as $$
  select exists (
    select 1 from public.entitlements
    where user_id = auth.uid()
      and status = 'active'
      and (expires_at is null or expires_at > now())
  )
$$;

revoke all on function public.has_active_entitlement() from public, anon;
grant execute on function public.has_active_entitlement() to authenticated, service_role;

create or replace function public.is_free_lesson(p_lesson_id uuid)
returns boolean
language sql stable security definer
set search_path = 'public'
as $$
  select exists (
    select 1
    from public.lessons self
    where self.id = p_lesson_id
      and self.status = 'published'
      and self.id = (
        select l.id
        from public.lessons l
        join public.topics t
          on t.id = l.topic_id
         and t.published is true
        where l.subject_id = self.subject_id
          and l.status = 'published'
        order by t.sort_order asc, l.created_at asc
        limit 1
      )
  )
$$;

revoke all on function public.is_free_lesson(uuid) from public, anon;
grant execute on function public.is_free_lesson(uuid) to authenticated, service_role;

create or replace function public.lesson_readable(p_lesson_id uuid)
returns boolean
language sql stable security definer
set search_path = 'public'
as $$
  select exists (
    select 1 from public.lessons l
    where l.id = p_lesson_id
      and l.status = 'published'
      and (
        public.has_active_entitlement()
        or public.has_campaign_access()
        or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
        or public.is_free_lesson(l.id)
      )
  )
$$;

revoke all on function public.lesson_readable(uuid) from public, anon;
grant execute on function public.lesson_readable(uuid) to authenticated, service_role;

-- ---------- lessons / lesson_blocks ----------

drop policy if exists "anyone reads published lessons" on public.lessons;
create policy "entitled learners read lessons"
  on public.lessons for select
  to authenticated
  using (public.lesson_readable(id));

drop policy if exists "anyone reads published lesson blocks" on public.lesson_blocks;
create policy "entitled learners read lesson blocks"
  on public.lesson_blocks for select
  to authenticated
  using (public.lesson_readable(lesson_id));

-- ---------- questions ----------

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
    or exists (
      select 1 from public.user_exam_free_pools p
      where p.question_id = questions.id
        and p.user_id = (select auth.uid())
    )
    or exists (
      select 1 from public.user_free_questions p
      where p.question_id = questions.id
        and p.user_id = (select auth.uid())
    )
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

-- Anonymous never reads paid/copyrighted content directly; the authenticated
-- policies above are the only grant path. (RLS already denies anon by
-- omission; this closes the legacy blanket table-level grant for these three.)
revoke select on public.lessons from anon;
revoke select on public.lesson_blocks from anon;
revoke select on public.questions from anon;
