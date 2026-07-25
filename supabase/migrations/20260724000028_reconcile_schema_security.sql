-- Forward-only reconciliation for databases whose migration history was applied
-- before the security hardening migrations. Do not edit historical migrations.

-- Ensure every application table is protected by RLS. Repeating ENABLE is safe.
alter table schools enable row level security;
alter table app_config enable row level security;
alter table profiles enable row level security;
alter table exams enable row level security;
alter table subjects enable row level security;
alter table exam_subjects enable row level security;
alter table questions enable row level security;
alter table exam_sessions enable row level security;
alter table session_answers enable row level security;
alter table results enable row level security;
alter table daily_questions enable row level security;
alter table daily_question_attempts enable row level security;
alter table streaks enable row level security;
alter table leaderboard_entries enable row level security;
alter table referrals enable row level security;
alter table payments enable row level security;
alter table contact_submissions enable row level security;
alter table user_exam_access enable row level security;
alter table entitlements enable row level security;
alter table usage_counters enable row level security;

-- A row policy cannot limit individual columns. Preserve the student-facing
-- question fields while preventing direct REST access to answer material.
revoke select on table questions from public, anon, authenticated;
grant select (id, subject_id, exam_id, question_text, options, difficulty, created_at, source)
  on table questions to authenticated;

-- Profiles contain authorization and entitlement-adjacent fields. Students can
-- update only the fields exposed by the account/onboarding UI.
revoke update on table profiles from public, anon, authenticated;
grant update (full_name, username, school_id, avatar_index, onboarding_completed)
  on table profiles to authenticated;

-- Client roles can read their own payment/entitlement/result records through
-- RLS, but trusted RPCs are the sole writers for financial and scored data.
revoke insert, update, delete on table payments, entitlements, results, daily_question_attempts
  from public, anon, authenticated;
grant select on table payments, entitlements, results, daily_question_attempts to authenticated;
drop policy if exists "users can insert own results" on results;
drop policy if exists "users can insert own daily question attempts" on daily_question_attempts;

-- Reconcile the school-exam access policy without relying on CREATE POLICY IF
-- NOT EXISTS (which PostgreSQL does not support).
drop policy if exists "users can insert own exam access" on user_exam_access;
create policy "users can insert own exam access"
  on user_exam_access for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from exams
      where exams.id = exam_id and exams.school_id is not null
    )
  );

-- Reconcile integrity constraints and indexes introduced across migrations.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'results_accuracy_check') then
    alter table results add constraint results_accuracy_check check (accuracy >= 0 and accuracy <= 1);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'session_answers_session_question_key') then
    alter table session_answers add constraint session_answers_session_question_key unique (session_id, question_id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'daily_question_attempts_user_question_key') then
    alter table daily_question_attempts
      add constraint daily_question_attempts_user_question_key unique (user_id, daily_question_id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'referrals_no_self_referral') then
    alter table referrals add constraint referrals_no_self_referral check (referrer_id <> referred_id);
  end if;
end;
$$;

create index if not exists idx_profiles_lower_username on profiles (lower(username));
create index if not exists idx_daily_question_attempts_user_question
  on daily_question_attempts (user_id, daily_question_id);
create index if not exists idx_exam_sessions_exam_user on exam_sessions (exam_id, user_id);
create index if not exists idx_questions_source on questions (source);

-- Remove historical blanket execution grants (including grants inherited through
-- PUBLIC/default privileges), then restore only the reviewed RPC allow-list.
revoke execute on all functions in schema public from public, anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;
grant execute on function get_session_questions(uuid, uuid[], question_difficulty, integer, text) to authenticated;
grant execute on function ensure_daily_question() to authenticated;
grant execute on function get_user_leaderboard_rank(uuid, leaderboard_period, uuid) to authenticated;
grant execute on function increment_usage_counter(uuid, uuid, text) to authenticated;
grant execute on function try_start_free_mock(uuid, uuid, integer) to authenticated;
grant execute on function update_streak(uuid) to authenticated;
grant execute on function record_session_answer(uuid, uuid, text) to authenticated;
grant execute on function get_session_answer_reveal(uuid, uuid) to authenticated;
grant execute on function complete_mock_session(uuid) to authenticated;
grant execute on function get_session_review(uuid) to authenticated;
grant execute on function submit_daily_question_answer(uuid, text) to authenticated;
grant execute on function get_daily_question_reveal(uuid) to authenticated;
grant execute on function grant_referral_reward(uuid) to service_role;

do $$
begin
  if to_regprocedure('process_payment(uuid,text,integer,text,text)') is not null then
    execute 'grant execute on function process_payment(uuid,text,integer,text,text) to service_role';
  end if;
end;
$$;
