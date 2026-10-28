-- Phase 4: close the remaining public write surface, drop dead client write
-- grants, and tune the hot own-row read paths.
--
-- Findings closed here:
--   #10 analytics_events and contact_submissions accept inserts from anyone
--       with the anon key. Both are server-authored (the API route and the
--       two server actions), so the public INSERT grant and policy are
--       unnecessary and let a client forge analytics or spam the inbox with
--       no rate limit at the database layer.
--
-- 20260724000029 also left table-level INSERT/UPDATE grants (and a few DELETE
-- grants) on almost every public table. Admin content tables are written with
-- the service role, and the remaining client-writable tables already have
-- narrow policies, so those grants were dead. Remove them globally, then
-- re-grant only the writes the app actually performs.

-- ---------------------------------------------------------------------------
-- #10 analytics and inquiries are server-authored.
-- ---------------------------------------------------------------------------
drop policy if exists "Anyone can insert analytics events" on public.analytics_events;
drop policy if exists "Anyone can insert contact submissions" on public.contact_submissions;

-- These two read policies tested `auth.jwt() ->> 'role' = 'service_role'`,
-- which is never true for a client JWT. Admin reads already use the service
-- role (which bypasses RLS), so the policies only obscured the intent.
drop policy if exists "Admins can read analytics events" on public.analytics_events;
drop policy if exists "Admins can view contact submissions" on public.contact_submissions;

revoke insert, update, delete on public.analytics_events from public, anon, authenticated;
revoke insert, update, delete on public.contact_submissions from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Dead client write grants: revoke across the schema, then re-grant the
-- reviewed set below. References stay intact because SELECT is untouched.
-- ---------------------------------------------------------------------------
do $$
declare
  tbl record;
begin
  for tbl in
    select tablename
    from pg_tables
    where schemaname = 'public'
  loop
    execute format(
      'revoke insert, update, delete on table public.%I from public, anon, authenticated',
      tbl.tablename
    );
  end loop;
end
$$;

-- profiles: the phase 1 column grants are the only client write. A table-level
-- revoke does not clear column ACLs, but re-grant explicitly so this migration
-- is self-contained.
revoke update (id, is_admin, ai_features_enabled, referral_code, referred_by)
  on table public.profiles from public, anon, authenticated;

grant update (
  full_name,
  username,
  school_id,
  onboarding_completed,
  subject_combinations,
  intended_course,
  exam_target,
  heard_about,
  study_time,
  target_score,
  accessibility_needs,
  subjects_pending
) on table public.profiles to authenticated;

-- Remaining client writes, each backed by an own-row policy and used by a
-- server action or route:
--   push_subscriptions  save / remove a browser subscription
--   lesson_reflections  submit a reflection from the lesson player
--   student_targets     pick and clear target schools
--   user_exam_access    add / remove a school-specific exam
grant select, insert, update, delete on public.push_subscriptions to authenticated;
grant insert on public.lesson_reflections to authenticated;
grant select, insert, update on public.student_targets to authenticated;
grant select, insert, delete on public.user_exam_access to authenticated;

-- ---------------------------------------------------------------------------
-- Performance: admin inquiry list orders by created_at and had no index.
-- ---------------------------------------------------------------------------
create index if not exists idx_contact_submissions_created_at
  on public.contact_submissions (created_at desc);

-- Performance: force the auth.uid() lookup into a once-per-query initplan on
-- the hot own-row policy paths instead of re-evaluating it per candidate row.
-- Semantics are unchanged; only the expression is wrapped.
alter policy "users can read own profile" on public.profiles
  using (id = (select auth.uid()));
alter policy "users can update own profile" on public.profiles
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

alter policy "users can read own sessions" on public.exam_sessions
  using (user_id = (select auth.uid()));

alter policy "users can read own session answers" on public.session_answers
  using (
    exists (
      select 1
      from public.exam_sessions
      where exam_sessions.id = session_answers.session_id
        and exam_sessions.user_id = (select auth.uid())
    )
  );

alter policy "users can read own results" on public.results
  using (
    exists (
      select 1
      from public.exam_sessions
      where exam_sessions.id = results.session_id
        and exam_sessions.user_id = (select auth.uid())
    )
  );

alter policy "users read own lesson attempts" on public.learning_attempts
  using (user_id = (select auth.uid()));
alter policy "users read own mastery" on public.learner_topic_mastery
  using (user_id = (select auth.uid()));
alter policy "users read own review queue" on public.review_queue
  using (user_id = (select auth.uid()));
alter policy "users can read own streak" on public.streaks
  using (user_id = (select auth.uid()));
alter policy "users read own exam free pools" on public.user_exam_free_pools
  using (user_id = (select auth.uid()));

-- Verify with supabase/verification/verify_reconciliation.sql (Phase 4
-- assertions) and scripts/verify-phase4-security.mjs.
