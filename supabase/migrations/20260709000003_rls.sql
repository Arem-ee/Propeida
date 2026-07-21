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

-- schools: publicly readable, service role only for write
create policy "schools are publicly readable"
  on schools for select
  to public
  using (true);

-- app_config: readable by authenticated users only, service role only for write
create policy "app_config readable by authenticated"
  on app_config for select
  to authenticated
  using (true);

-- profiles: users can read/write their own, service role can read all
create policy "users can read own profile"
  on profiles for select
  to authenticated
  using (id = auth.uid());

create policy "users can update own profile"
  on profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "service role can read all profiles"
  on profiles for select
  to service_role
  using (true);

-- exams: publicly readable
create policy "exams are publicly readable"
  on exams for select
  to public
  using (true);

-- subjects: publicly readable
create policy "subjects are publicly readable"
  on subjects for select
  to public
  using (true);

-- exam_subjects: publicly readable
create policy "exam_subjects are publicly readable"
  on exam_subjects for select
  to public
  using (true);

-- questions: publicly readable (content only, no answer exposure needed for service-role-gated features)
create policy "questions are publicly readable"
  on questions for select
  to public
  using (true);

-- exam_sessions: users can read/write their own
create policy "users can read own sessions"
  on exam_sessions for select
  to authenticated
  using (user_id = auth.uid());

create policy "users can insert own sessions"
  on exam_sessions for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "users can update own sessions"
  on exam_sessions for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- session_answers: users can read/write their own (through session ownership)
create policy "users can read own session answers"
  on session_answers for select
  to authenticated
  using (
    exists (
      select 1 from exam_sessions
      where exam_sessions.id = session_answers.session_id
      and exam_sessions.user_id = auth.uid()
    )
  );

create policy "users can insert own session answers"
  on session_answers for insert
  to authenticated
  with check (
    exists (
      select 1 from exam_sessions
      where exam_sessions.id = session_answers.session_id
      and exam_sessions.user_id = auth.uid()
    )
  );

-- results: users can read their own
create policy "users can read own results"
  on results for select
  to authenticated
  using (
    exists (
      select 1 from exam_sessions
      where exam_sessions.id = results.session_id
      and exam_sessions.user_id = auth.uid()
    )
  );

create policy "users can insert own results"
  on results for insert
  to authenticated
  with check (
    exists (
      select 1 from exam_sessions
      where exam_sessions.id = results.session_id
      and exam_sessions.user_id = auth.uid()
    )
  );

-- daily_questions: publicly readable
create policy "daily_questions are publicly readable"
  on daily_questions for select
  to public
  using (true);

-- daily_question_attempts: users can read/write their own
create policy "users can read own daily question attempts"
  on daily_question_attempts for select
  to authenticated
  using (user_id = auth.uid());

create policy "users can insert own daily question attempts"
  on daily_question_attempts for insert
  to authenticated
  with check (user_id = auth.uid());

-- streaks: users can read/write their own
create policy "users can read own streak"
  on streaks for select
  to authenticated
  using (user_id = auth.uid());

create policy "users can insert own streak"
  on streaks for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "users can update own streak"
  on streaks for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- leaderboard_entries: readable by all authenticated, writable only via trigger (service role)
create policy "leaderboard readable by authenticated"
  on leaderboard_entries for select
  to authenticated
  using (true);

-- referrals: users can read their own (as referrer or referred)
create policy "users can read own referrals"
  on referrals for select
  to authenticated
  using (referrer_id = auth.uid() or referred_id = auth.uid());

-- payments: users can read own payments
create policy "users can read own payments"
  on payments for select
  to authenticated
  using (user_id = auth.uid());

-- Public leaderboard view for anonymous visitors (landing page teaser)
create view public_leaderboard_top10 as
select
  p.username,
  s.name as school_name,
  le.score
from leaderboard_entries le
join profiles p on p.id = le.user_id
left join schools s on s.id = le.school_id
where le.period = 'all_time'
order by le.score desc
limit 10;

grant select on public_leaderboard_top10 to anon;
grant select on public_leaderboard_top10 to authenticated;
