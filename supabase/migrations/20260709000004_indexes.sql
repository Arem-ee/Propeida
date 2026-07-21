-- Question filtering (runs every time a session starts)
create index idx_questions_exam_subject_difficulty on questions (exam_id, subject_id, difficulty);
create index idx_questions_subject_id on questions (subject_id);
create index idx_questions_exam_id on questions (exam_id);
create index idx_questions_difficulty on questions (difficulty);

-- Session lookups by user (profile page, active sessions)
create index idx_exam_sessions_user_id on exam_sessions (user_id);
create index idx_exam_sessions_user_status on exam_sessions (user_id, status);

-- Session answers by session (grading, review)
create index idx_session_answers_session_id on session_answers (session_id);
create index idx_session_answers_session_question on session_answers (session_id, question_id);

-- Completed sessions for weekly leaderboard computation
create index idx_exam_sessions_completed_at on exam_sessions (completed_at) where status = 'completed';

-- Results by session
create index idx_results_session_id on results (session_id);

-- Leaderboard queries
create index idx_leaderboard_entries_period_score on leaderboard_entries (period, score desc);
create index idx_leaderboard_entries_school_period on leaderboard_entries (school_id, period, score desc);

-- Daily question lookups
create index idx_daily_questions_date on daily_questions (date desc);

-- Streak lookups
create index idx_streaks_user_id on streaks (user_id);

-- Referral lookups
create index idx_referrals_referrer_id on referrals (referrer_id);
create index idx_referrals_referred_id on referrals (referred_id);

-- Profile lookups by school
create index idx_profiles_school_id on profiles (school_id);

-- Profile lookups by referral code
create index idx_profiles_referral_code on profiles (referral_code);

-- Payment lookups by user
create index idx_payments_user_id on payments (user_id);

-- Payment idempotency lookups
create index idx_payments_paystack_reference on payments (paystack_reference);
