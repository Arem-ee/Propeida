-- Run against the target database after applying migrations 25-28.
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
    'questions', 'exam_sessions', 'session_answers', 'results', 'daily_questions',
    'daily_question_attempts', 'streaks', 'leaderboard_entries', 'referrals',
    'payments', 'contact_submissions', 'user_exam_access', 'entitlements', 'usage_counters'
  )
order by relname;

-- Policy definitions; inspect that results and daily attempts have no client
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
  and table_name in ('payments', 'entitlements', 'results', 'daily_question_attempts')
  and grantee in ('PUBLIC', 'anon', 'authenticated')
order by table_name, grantee, privilege_type;

-- Required integrity constraints and indexes.
select conrelid::regclass as table_name, conname, pg_get_constraintdef(oid) as definition
from pg_constraint
where conname in (
  'results_accuracy_check', 'session_answers_session_question_key',
  'daily_question_attempts_user_question_key', 'referrals_no_self_referral'
)
order by conname;

select indexrelid::regclass as index_name, indrelid::regclass as table_name,
       pg_get_indexdef(indexrelid) as definition
from pg_index
where indexrelid::regclass::text in (
  'idx_profiles_lower_username', 'idx_daily_question_attempts_user_question',
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
    'get_session_review', 'submit_daily_question_answer', 'get_daily_question_reveal',
    'increment_usage_counter', 'try_start_free_mock', 'update_streak',
    'grant_referral_reward', 'process_payment'
  )
order by p.proname, arguments;
