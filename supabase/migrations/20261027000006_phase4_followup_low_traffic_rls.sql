-- Phase 4 follow-up: finish the auth.uid() initplan wrapping across the
-- remaining own-row policies. Semantics are unchanged; the wrapper makes the
-- lookup once per query instead of once per candidate row.
--
-- The hot learner paths were covered in 20261027000004; this finishes the
-- financial, referral, exam-access and subscription tables.

alter policy "users can read own entitlements" on public.entitlements
  using (user_id = (select auth.uid()));

alter policy "users can read own payments" on public.payments
  using (user_id = (select auth.uid()));

alter policy "users can read own usage counters" on public.usage_counters
  using (user_id = (select auth.uid()));

alter policy "users can read own support contributions" on public.support_contributions
  using (user_id = (select auth.uid()));

alter policy "campaign_access is readable by owner" on public.campaign_access
  using (user_id = (select auth.uid()));

alter policy "users can read own referrals" on public.referrals
  using (
    referrer_id = (select auth.uid())
    or referred_id = (select auth.uid())
  );

alter policy "users can read own exam access" on public.user_exam_access
  using (user_id = (select auth.uid()));

alter policy "users can insert own exam access" on public.user_exam_access
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.exams
      where exams.id = user_exam_access.exam_id
        and exams.school_id is not null
    )
  );

alter policy "users can delete own exam access" on public.user_exam_access
  using (user_id = (select auth.uid()));

alter policy "Users can manage their own subscriptions" on public.push_subscriptions
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy "users manage own targets" on public.student_targets
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy "users manage own lesson reflections" on public.lesson_reflections
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
