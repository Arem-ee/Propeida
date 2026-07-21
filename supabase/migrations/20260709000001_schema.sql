create type subscription_status as enum ('free', 'pro', 'pro_trial');
create type session_mode as enum ('practice', 'mock');
create type session_status as enum ('in_progress', 'completed', 'abandoned');
create type question_difficulty as enum ('easy', 'medium', 'hard');
create type payment_status as enum ('pending', 'success', 'failed');
create type referral_status as enum ('pending', 'verified');
create type leaderboard_period as enum ('weekly', 'all_time');

create table schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table app_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  username text not null unique,
  school_id uuid references schools(id) on delete set null,
  referral_code text not null unique,
  referred_by uuid references profiles(id) on delete set null,
  subscription_status subscription_status not null default 'free',
  subscription_expires_at timestamptz,
  ai_features_enabled boolean not null default false,
  free_questions_answered integer not null default 0,
  free_mocks_completed integer not null default 0,
  created_at timestamptz not null default now()
);

create table exams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text
);

create table subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
);

create table exam_subjects (
  exam_id uuid not null references exams(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  primary key (exam_id, subject_id)
);

create table questions (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references subjects(id) on delete restrict,
  exam_id uuid not null references exams(id) on delete restrict,
  question_text text not null,
  options jsonb not null,
  correct_answer text not null,
  explanation text not null,
  difficulty question_difficulty not null default 'medium',
  created_at timestamptz not null default now()
);

create table exam_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_id uuid not null references exams(id) on delete restrict,
  mode session_mode not null,
  status session_status not null default 'in_progress',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  time_limit_seconds integer
);

create table session_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references exam_sessions(id) on delete cascade,
  question_id uuid not null references questions(id) on delete restrict,
  selected_answer text,
  is_correct boolean,
  time_taken_seconds integer
);

create table results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references exam_sessions(id) on delete cascade,
  score numeric not null,
  accuracy numeric not null,
  performance_by_subject jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table daily_questions (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions(id) on delete restrict,
  date date not null unique
);

create table daily_question_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  daily_question_id uuid not null references daily_questions(id) on delete cascade,
  is_correct boolean not null,
  answered_at timestamptz not null default now()
);

create table streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_activity_date date
);

create table leaderboard_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  school_id uuid references schools(id) on delete set null,
  score numeric not null default 0,
  period leaderboard_period not null,
  updated_at timestamptz not null default now(),
  unique (user_id, period)
);

create table referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references profiles(id) on delete cascade,
  referred_id uuid not null unique references profiles(id) on delete cascade,
  status referral_status not null default 'pending',
  reward_granted_at timestamptz,
  created_at timestamptz not null default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  paystack_reference text not null unique,
  amount numeric not null,
  status payment_status not null default 'pending',
  verified_at timestamptz,
  created_at timestamptz not null default now()
);
