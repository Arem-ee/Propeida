-- Phase 3: privacy leaks, client-writable learning state, and write-surface
-- defence in depth.
--
-- Findings closed here:
--   #6 push_subscriptions was readable by every role: the "service role"
--      policy was granted to PUBLIC instead of service_role.
--   #7 question_misconceptions named wrong options and hinted at the key.
--   #8 learning_attempts / learner_topic_mastery / review_queue / streaks
--      were client-writable, letting a learner forge mastery and reviews.
--   #9 results / payments / entitlements / usage_counters / question_reviews
--      carried dead client write grants; user_exam_access carried ALL.

-- ---------------------------------------------------------------------------
-- #6 push_subscriptions: own-row access only; service role keeps all rows.
-- ---------------------------------------------------------------------------
drop policy if exists "Service role can read subscriptions" on push_subscriptions;

create policy "service role can read subscriptions"
  on push_subscriptions for select
  to service_role
  using (true);

revoke all on push_subscriptions from anon;

-- ---------------------------------------------------------------------------
-- #7 question_misconceptions: server-only. Practice and lesson feedback read
-- the row for the option the learner actually picked through the service-role
-- client, after the answer has been recorded.
-- ---------------------------------------------------------------------------
drop policy if exists "authenticated learners read misconceptions" on question_misconceptions;

revoke all on question_misconceptions from anon, authenticated;

-- ---------------------------------------------------------------------------
-- #8 Learning state is server-authored: learners read their own rows, only
-- the service role writes them. The ALL policies become SELECT-only own-row
-- policies so a future blanket grant cannot silently restore writes.
-- ---------------------------------------------------------------------------
drop policy if exists "users manage own lesson attempts" on learning_attempts;

create policy "users read own lesson attempts"
  on learning_attempts for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "users manage own mastery" on learner_topic_mastery;

create policy "users read own mastery"
  on learner_topic_mastery for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "users manage own review queue" on review_queue;

create policy "users read own review queue"
  on review_queue for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "users can insert own streak" on streaks;
drop policy if exists "users can update own streak" on streaks;

revoke insert, update, delete on learning_attempts from anon, authenticated;
revoke insert, update, delete on learner_topic_mastery from anon, authenticated;
revoke insert, update, delete on review_queue from anon, authenticated;
revoke insert, update, delete on streaks from anon, authenticated;
revoke select on learning_attempts, learner_topic_mastery, review_queue, streaks from anon;

-- ---------------------------------------------------------------------------
-- #9 Defence in depth: remove dead client write grants. Every one of these
-- writes already goes through a security-definer function or the service
-- role, so the grants were unreachable through RLS but would become live
-- again with one future policy mistake.
-- ---------------------------------------------------------------------------
revoke insert, update, delete on results from anon, authenticated;
revoke insert, update, delete on payments from anon, authenticated;
revoke insert, update, delete on entitlements from anon, authenticated;
revoke insert, update, delete on usage_counters from anon, authenticated;
revoke insert, update, delete on question_reviews from anon, authenticated;
revoke select on results, payments, entitlements, usage_counters, question_reviews from anon;

-- Review history is admin-only. The browser review queue already established
-- the caller through get_question_review_queue; this keeps its history read
-- working without a client-side service-role path.
create policy "admins read question reviews"
  on question_reviews for select
  to authenticated
  using (
    exists (
      select 1
      from profiles
      where profiles.id = auth.uid()
        and profiles.is_admin
    )
  );

-- user_exam_access needs only SELECT/INSERT/DELETE for the self-service
-- institution feature; the table has no client UPDATE policy.
revoke all on user_exam_access from anon, authenticated;
grant select, insert, delete on user_exam_access to authenticated;
