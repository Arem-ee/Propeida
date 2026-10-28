-- Run against the target database after applying all migrations.
-- This script is read-only and reports the security/schema reconciliation state.

-- Applied migration versions (Supabase migration metadata).
select version, name
from supabase_migrations.schema_migrations
order by version;

-- RLS must be enabled for all application tables.
select relname as table_name, relrowsecurity as rls_enabled, relforcerowsecurity as force_rls
from pg_class
where relnamespace = 'public'::regnamespace
  and relkind = 'r'
  and relname in (
    'schools', 'app_config', 'profiles', 'exams', 'subjects', 'exam_subjects',
    'questions', 'exam_sessions', 'session_answers', 'results',
    'streaks', 'referrals',
    'payments', 'contact_submissions', 'user_exam_access', 'entitlements', 'usage_counters'
  )
order by relname;

-- Policy definitions; inspect that results has no client
-- INSERT policy and that exam access is limited to school-specific exams.
select tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- No PUBLIC/anon/authenticated blanket execution should remain. The only
-- authenticated rows should be the reviewed student RPC allow-list.
select routine_name, grantee, privilege_type
from information_schema.routine_privileges
where routine_schema = 'public'
  and grantee in ('PUBLIC', 'anon', 'authenticated')
order by routine_name, grantee, privilege_type;

-- Questions must not grant answer columns to client roles; profile updates must
-- exclude is_admin and other authorization-controlled columns.
select table_name, column_name, grantee, privilege_type
from information_schema.column_privileges
where table_schema = 'public'
  and table_name in ('questions', 'profiles')
  and grantee in ('PUBLIC', 'anon', 'authenticated')
order by table_name, column_name, grantee, privilege_type;

-- Client roles cannot write financial/scored tables.
select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('payments', 'entitlements', 'results')
  and grantee in ('PUBLIC', 'anon', 'authenticated')
order by table_name, grantee, privilege_type;

-- Required integrity constraints and indexes.
select conrelid::regclass as table_name, conname, pg_get_constraintdef(oid) as definition
from pg_constraint
where conname in (
  'results_accuracy_check', 'session_answers_session_question_key',
  'referrals_no_self_referral'
)
order by conname;

select indexrelid::regclass as index_name, indrelid::regclass as table_name,
       pg_get_indexdef(indexrelid) as definition
from pg_index
where indexrelid::regclass::text in (
  'idx_profiles_lower_username',
  'idx_exam_sessions_exam_user', 'idx_questions_source'
)
order by index_name;

-- Confirm the reviewed RPCs exist and are SECURITY DEFINER where required.
select p.proname, pg_get_function_identity_arguments(p.oid) as arguments,
       p.prosecdef as security_definer
from pg_proc p
where p.pronamespace = 'public'::regnamespace
  and p.proname in (
    'record_session_answer', 'get_session_answer_reveal', 'complete_mock_session',
    'get_session_review',
    'increment_usage_counter', 'try_start_free_mock', 'update_streak',
    'grant_referral_reward', 'process_payment'
  )
order by p.proname, arguments;

-- =================================================================
-- Phase 1 assertions (20261027000001). Every row should read PASS.
-- =================================================================

-- No client role holds table-level INSERT/UPDATE/DELETE on the tables that
-- carry authorization or session state.
select 'no client table writes (profiles, exam_sessions, session_answers)' as check_name,
       case when count(*) = 0 then 'PASS' else 'FAIL' end as result,
       coalesce(string_agg(table_name || ':' || grantee || ':' || privilege_type, ', '), 'none') as detail
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('profiles', 'exam_sessions', 'session_answers')
  and grantee in ('PUBLIC', 'anon', 'authenticated')
  and privilege_type in ('INSERT', 'UPDATE', 'DELETE');

-- Authorization-controlled profile columns must not be updatable by clients.
select 'profiles authorization columns are not client-updatable' as check_name,
       case when count(*) = 0 then 'PASS' else 'FAIL' end as result,
       coalesce(string_agg(column_name || ':' || grantee, ', '), 'none') as detail
from information_schema.column_privileges
where table_schema = 'public'
  and table_name = 'profiles'
  and grantee in ('PUBLIC', 'anon', 'authenticated')
  and privilege_type = 'UPDATE'
  and column_name in ('id', 'is_admin', 'ai_features_enabled', 'referral_code', 'referred_by');

-- The app still needs to write its own profile columns.
select 'profiles app-editable columns retain UPDATE' as check_name,
       case when count(distinct column_name) = 12 then 'PASS' else 'FAIL' end as result,
       count(distinct column_name)::text || '/12 granted' as detail
from information_schema.column_privileges
where table_schema = 'public'
  and table_name = 'profiles'
  and grantee = 'authenticated'
  and privilege_type = 'UPDATE'
  and column_name in (
    'full_name', 'username', 'school_id', 'onboarding_completed',
    'subject_combinations', 'intended_course', 'exam_target', 'heard_about',
    'study_time', 'target_score', 'accessibility_needs', 'subjects_pending'
  );

-- Any UPDATE grant outside the reviewed allow-list (or to anon/PUBLIC) is a
-- finding: those columns are server-managed.
select 'profile UPDATE grants stay on the reviewed allow-list' as check_name,
       case when count(*) = 0 then 'PASS' else 'FAIL' end as result,
       coalesce(string_agg(grantee || ':' || column_name, ', '), 'none') as detail
from information_schema.column_privileges
where table_schema = 'public'
  and table_name = 'profiles'
  and privilege_type = 'UPDATE'
  and grantee in ('PUBLIC', 'anon', 'authenticated')
  and (
    grantee <> 'authenticated'
    or column_name not in (
      'full_name', 'username', 'school_id', 'onboarding_completed',
      'subject_combinations', 'intended_course', 'exam_target', 'heard_about',
      'study_time', 'target_score', 'accessibility_needs', 'subjects_pending'
    )
  );

-- Column-level INSERT/DELETE grants would bypass the table-level revokes.
select 'no client column INSERT/DELETE on session/profile tables' as check_name,
       case when count(*) = 0 then 'PASS' else 'FAIL' end as result,
       coalesce(string_agg(table_name || '.' || column_name || ':' || grantee || ':' || privilege_type, ', '), 'none') as detail
from information_schema.column_privileges
where table_schema = 'public'
  and table_name in ('profiles', 'exam_sessions', 'session_answers')
  and grantee in ('PUBLIC', 'anon', 'authenticated')
  and privilege_type in ('INSERT', 'DELETE');

-- The guard trigger is the second line of defence if a table grant returns.
select 'profile privilege guard trigger is installed' as check_name,
       case when count(*) = 1 then 'PASS' else 'FAIL' end as result,
       count(*)::text || ' matching trigger(s)' as detail
from pg_trigger
where tgrelid = 'public.profiles'::regclass
  and tgname = 'guard_profile_privileges'
  and not tgisinternal;

-- Unreachable write policies are dropped so a future grant cannot re-open them.
select 'no client write policies remain on sessions/answers' as check_name,
       case when count(*) = 0 then 'PASS' else 'FAIL' end as result,
       coalesce(string_agg(tablename || ':' || policyname || ':' || cmd, ', '), 'none') as detail
from pg_policies
where schemaname = 'public'
  and tablename in ('exam_sessions', 'session_answers')
  and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL');

-- =================================================================
-- Phase 2 assertions (20261027000002). Every row should read PASS.
-- =================================================================

-- The grading columns are the oracle if a client can read them.
select 'session answer grades are not client-readable' as check_name,
       case when count(*) = 0 then 'PASS' else 'FAIL' end as result,
       coalesce(string_agg(column_name || ':' || grantee, ', '), 'none') as detail
from information_schema.column_privileges
where table_schema = 'public'
  and table_name = 'session_answers'
  and grantee in ('PUBLIC', 'anon', 'authenticated')
  and privilege_type = 'SELECT'
  and column_name in ('is_correct', 'misconception_code');

-- The player still needs the submitted answer and timing columns.
select 'session answer player columns retain SELECT' as check_name,
       case when count(distinct column_name) = 5 then 'PASS' else 'FAIL' end as result,
       count(distinct column_name)::text || '/5 granted' as detail
from information_schema.column_privileges
where table_schema = 'public'
  and table_name = 'session_answers'
  and grantee = 'authenticated'
  and privilege_type = 'SELECT'
  and column_name in ('id', 'session_id', 'question_id', 'selected_answer', 'time_taken_seconds');

-- Grading is a pure write now; no caller can read a grade back from the RPC.
select 'record_session_answer returns no grade' as check_name,
       case when count(*) = 1 then 'PASS' else 'FAIL' end as result,
       coalesce(string_agg(proname || '(' || pg_get_function_identity_arguments(oid) || ') -> ' || pg_get_function_result(oid), ', '), 'missing') as detail
from pg_proc
where pronamespace = 'public'::regnamespace
  and proname = 'record_session_answer'
  and pg_get_function_result(oid) = 'void';

-- Free pools are locked to the security-definer RPCs.
select 'user_free_questions has RLS enabled' as check_name,
       case when bool_and(relrowsecurity) then 'PASS' else 'FAIL' end as result,
       coalesce(string_agg(relname || ':' || relrowsecurity::text, ', '), 'missing') as detail
from pg_class
where oid = 'public.user_free_questions'::regclass;

select 'user_free_questions has no client grants' as check_name,
       case when count(*) = 0 then 'PASS' else 'FAIL' end as result,
       coalesce(string_agg(grantee || ':' || privilege_type, ', '), 'none') as detail
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'user_free_questions'
  and grantee in ('PUBLIC', 'anon', 'authenticated');

select 'user_exam_free_pools has no client writes' as check_name,
       case when count(*) = 0 then 'PASS' else 'FAIL' end as result,
       coalesce(string_agg(grantee || ':' || privilege_type, ', '), 'none') as detail
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'user_exam_free_pools'
  and grantee in ('PUBLIC', 'anon', 'authenticated')
  and privilege_type in ('INSERT', 'UPDATE', 'DELETE');

select 'user_exam_free_pools retains authenticated SELECT' as check_name,
       case when count(*) = 1 then 'PASS' else 'FAIL' end as result,
       coalesce(string_agg(grantee || ':' || privilege_type, ', '), 'none') as detail
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'user_exam_free_pools'
  and grantee = 'authenticated'
  and privilege_type = 'SELECT';

-- Anonymous callers cannot invoke the pool RPCs.
select 'pool RPCs are not executable by PUBLIC or anon' as check_name,
       case when count(*) = 0 then 'PASS' else 'FAIL' end as result,
       coalesce(string_agg(routine_name || ':' || grantee, ', '), 'none') as detail
from information_schema.routine_privileges
where routine_schema = 'public'
  and routine_name in ('ensure_free_question_pool', 'ensure_exam_free_pool')
  and grantee in ('PUBLIC', 'anon');

-- =================================================================
-- Phase 3 assertions (20261027000003). Every row should read PASS.
-- =================================================================

-- The only all-row read policy on push subscriptions belongs to service_role.
select 'push subscriptions are not globally readable' as check_name,
       case when count(*) = 0 then 'PASS' else 'FAIL' end as result,
       coalesce(string_agg(policyname || ':' || roles::text, ', '), 'none') as detail
from pg_policies
where schemaname = 'public'
  and tablename = 'push_subscriptions'
  and cmd = 'SELECT'
  and qual = 'true'
  and not (roles = array['service_role']::name[]);

-- No client role can read another learner's subscription.
select 'push subscriptions keep an own-row policy' as check_name,
       case when count(*) = 1 then 'PASS' else 'FAIL' end as result,
       count(*)::text || ' matching policy(ies)' as detail
from pg_policies
where schemaname = 'public'
  and tablename = 'push_subscriptions'
  and cmd = 'ALL'
  and qual like '%auth.uid()%'
  and roles @> array['public']::name[];

-- Misconception maps name the wrong options; server-only now.
select 'question misconceptions are server-only' as check_name,
       case when count(*) = 0 then 'PASS' else 'FAIL' end as result,
       coalesce(string_agg(grantee || ':' || privilege_type, ', '), 'none') as detail
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'question_misconceptions'
  and grantee in ('PUBLIC', 'anon', 'authenticated');

-- Learning state is read-only for clients: no INSERT/UPDATE/DELETE grants.
select 'learning state has no client writes' as check_name,
       case when count(*) = 0 then 'PASS' else 'FAIL' end as result,
       coalesce(string_agg(table_name || ':' || grantee || ':' || privilege_type, ', '), 'none') as detail
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('learning_attempts', 'learner_topic_mastery', 'review_queue', 'streaks')
  and grantee in ('PUBLIC', 'anon', 'authenticated')
  and privilege_type in ('INSERT', 'UPDATE', 'DELETE');

-- ...and no write policies remain to re-open if a grant returns.
select 'no client write policies remain on learning state' as check_name,
       case when count(*) = 0 then 'PASS' else 'FAIL' end as result,
       coalesce(string_agg(tablename || ':' || policyname || ':' || cmd, ', '), 'none') as detail
from pg_policies
where schemaname = 'public'
  and tablename in ('learning_attempts', 'learner_topic_mastery', 'review_queue', 'streaks')
  and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL');

-- Learners still read their own learning state.
select 'learning state retains authenticated SELECT' as check_name,
       case when count(distinct table_name) = 4 then 'PASS' else 'FAIL' end as result,
       count(distinct table_name)::text || '/4 tables granted' as detail
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('learning_attempts', 'learner_topic_mastery', 'review_queue', 'streaks')
  and grantee = 'authenticated'
  and privilege_type = 'SELECT';

-- Financial/scored/review tables: no dead client write grants.
select 'financial and review tables have no client writes' as check_name,
       case when count(*) = 0 then 'PASS' else 'FAIL' end as result,
       coalesce(string_agg(table_name || ':' || grantee || ':' || privilege_type, ', '), 'none') as detail
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('results', 'payments', 'entitlements', 'usage_counters', 'question_reviews')
  and grantee in ('PUBLIC', 'anon', 'authenticated')
  and privilege_type in ('INSERT', 'UPDATE', 'DELETE');

-- The browser review page reads history under an admin-only policy.
select 'question reviews are admin-readable' as check_name,
       case when count(*) = 1 then 'PASS' else 'FAIL' end as result,
       count(*)::text || ' matching policy(ies)' as detail
from pg_policies
where schemaname = 'public'
  and tablename = 'question_reviews'
  and cmd = 'SELECT'
  and roles @> array['authenticated']::name[]
  and qual like '%is_admin%';

-- user_exam_access keeps only the self-service privileges it uses.
select 'user_exam_access keeps least-privilege client grants' as check_name,
       case when count(*) = 0 then 'PASS' else 'FAIL' end as result,
       coalesce(string_agg(grantee || ':' || privilege_type, ', '), 'none') as detail
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'user_exam_access'
  and grantee in ('PUBLIC', 'anon', 'authenticated')
  and privilege_type not in ('SELECT', 'INSERT', 'DELETE');

select 'user_exam_access retains select/insert/delete' as check_name,
       case when count(distinct privilege_type) = 3 then 'PASS' else 'FAIL' end as result,
       count(distinct privilege_type)::text || '/3 granted' as detail
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'user_exam_access'
  and grantee = 'authenticated'
  and privilege_type in ('SELECT', 'INSERT', 'DELETE');

-- ===========================================================================
-- Phase 4: public write surface, dead grants, and hot-path indexes.
-- ===========================================================================

-- Analytics and inquiry rows are server-authored: no client write grants.
select 'analytics and inquiry tables have no client writes' as check_name,
       case when count(*) = 0 then 'PASS' else 'FAIL' end as result,
       coalesce(string_agg(table_name || ':' || grantee || ':' || privilege_type, ', '), 'none') as detail
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('analytics_events', 'contact_submissions')
  and grantee in ('PUBLIC', 'anon', 'authenticated')
  and privilege_type in ('INSERT', 'UPDATE', 'DELETE');

-- ...and no policies remain that would re-open them if a grant returns.
select 'analytics and inquiry tables have no client write policies' as check_name,
       case when count(*) = 0 then 'PASS' else 'FAIL' end as result,
       coalesce(string_agg(tablename || ':' || policyname || ':' || cmd, ', '), 'none') as detail
from pg_policies
where schemaname = 'public'
  and tablename in ('analytics_events', 'contact_submissions');

-- Every remaining client write grant belongs to a reviewed table.
select 'client write grants are limited to reviewed tables' as check_name,
       case when count(*) = 0 then 'PASS' else 'FAIL' end as result,
       coalesce(string_agg(table_name || ':' || grantee || ':' || privilege_type, ', '), 'none') as detail
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('PUBLIC', 'anon', 'authenticated')
  and privilege_type in ('INSERT', 'UPDATE', 'DELETE')
  and table_name not in (
    'push_subscriptions', 'lesson_reflections', 'student_targets', 'user_exam_access'
  );

-- profiles keeps exactly the app-editable column writes; authorization
-- columns stay server-managed.
select 'profiles keeps app-editable column grants' as check_name,
       case when count(*) = 12 then 'PASS' else 'FAIL' end as result,
       count(*)::text || '/12 columns granted' as detail
from information_schema.column_privileges
where table_schema = 'public'
  and table_name = 'profiles'
  and grantee = 'authenticated'
  and privilege_type = 'UPDATE'
  and column_name in (
    'full_name', 'username', 'school_id', 'onboarding_completed',
    'subject_combinations', 'intended_course', 'exam_target', 'heard_about',
    'study_time', 'target_score', 'accessibility_needs', 'subjects_pending'
  );

select 'profiles authorization columns stay server-managed' as check_name,
       case when count(*) = 0 then 'PASS' else 'FAIL' end as result,
       coalesce(string_agg(column_name, ', '), 'none') as detail
from information_schema.column_privileges
where table_schema = 'public'
  and table_name = 'profiles'
  and grantee in ('PUBLIC', 'anon', 'authenticated')
  and privilege_type in ('INSERT', 'UPDATE')
  and column_name in ('id', 'is_admin', 'ai_features_enabled', 'referral_code', 'referred_by');

-- The four reviewed client-writable tables keep their least-privilege grants.
select 'push subscriptions keep select/insert/update/delete' as check_name,
       case when count(distinct privilege_type) = 4 then 'PASS' else 'FAIL' end as result,
       count(distinct privilege_type)::text || '/4 granted' as detail
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'push_subscriptions'
  and grantee = 'authenticated'
  and privilege_type in ('SELECT', 'INSERT', 'UPDATE', 'DELETE');

select 'lesson reflections keep insert without update/delete' as check_name,
       case when count(distinct privilege_type) = 1 then 'PASS' else 'FAIL' end as result,
       coalesce(string_agg(privilege_type, ', '), 'none') as detail
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'lesson_reflections'
  and grantee = 'authenticated'
  and privilege_type in ('INSERT', 'UPDATE', 'DELETE');

select 'student targets keep select/insert/update' as check_name,
       case when count(distinct privilege_type) = 3 then 'PASS' else 'FAIL' end as result,
       count(distinct privilege_type)::text || '/3 granted' as detail
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'student_targets'
  and grantee = 'authenticated'
  and privilege_type in ('SELECT', 'INSERT', 'UPDATE', 'DELETE');

select 'user_exam_access keeps select/insert/delete' as check_name,
       case when count(distinct privilege_type) = 3 then 'PASS' else 'FAIL' end as result,
       count(distinct privilege_type)::text || '/3 granted' as detail
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'user_exam_access'
  and grantee = 'authenticated'
  and privilege_type in ('SELECT', 'INSERT', 'DELETE');

-- Admin inquiry listing orders by created_at; it now has an index.
select 'contact submissions have a created_at index' as check_name,
       case when count(*) = 1 then 'PASS' else 'FAIL' end as result,
       count(*)::text || ' matching index(es)' as detail
from pg_indexes
where schemaname = 'public'
  and tablename = 'contact_submissions'
  and indexdef ilike '%(created_at%';

-- The service role still owns the server-authored writes.
select 'service role keeps analytics and inquiry writes' as check_name,
       case when count(distinct table_name) = 2 then 'PASS' else 'FAIL' end as result,
       count(distinct table_name)::text || '/2 tables granted' as detail
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('analytics_events', 'contact_submissions')
  and grantee = 'service_role'
  and privilege_type = 'INSERT';

-- Every public policy that consults auth.uid() must do so through a
-- once-per-query initplan: (select auth.uid()). A bare call is re-evaluated
-- per candidate row and is the exact regression phases 4 and its follow-ups
-- removed.
select 'all auth.uid() policies use the initplan form' as check_name,
       case when count(*) = 0 then 'PASS' else 'FAIL' end as result,
       coalesce(string_agg(tablename || '.' || policyname, ', '), 'none') as detail
from pg_policies
where schemaname = 'public'
  and (
    (coalesce(qual, '') like '%auth.uid()%' and coalesce(qual, '') not like '%SELECT auth.uid()%')
    or (coalesce(with_check, '') like '%auth.uid()%' and coalesce(with_check, '') not like '%SELECT auth.uid()%')
  );
