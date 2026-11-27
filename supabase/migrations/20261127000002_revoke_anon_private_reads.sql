-- Defence in depth: anon must not even reach user-owned tables.
-- RLS already restricts these to the owner, but the public role should not
-- hold a SELECT grant on private rows at all. Public catalogue tables
-- (subjects, exams, topics, schools, careers, app_config, ...) keep theirs.

revoke select on public.analytics_events from anon;
revoke select on public.contact_submissions from anon;
revoke select on public.exam_sessions from anon;
revoke select on public.lesson_reflections from anon;
revoke select on public.lesson_completions from anon;
revoke select on public.profiles from anon;
revoke select on public.referrals from anon;
revoke select on public.recall_cards from anon;
revoke select on public.recall_review_state from anon;
revoke select on public.squad_members from anon;
revoke select on public.squad_mock_windows from anon;
revoke select on public.squad_weekly_goals from anon;
revoke select on public.squads from anon;
revoke select on public.student_targets from anon;
revoke select on public.support_contributions from anon;
