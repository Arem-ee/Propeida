-- =====================================================================
-- Signup abandonment audit — canonical production queries
-- Run these in the Supabase SQL editor (dashboard SQL) or via psql.
-- Mirrors scripts/audit-signup-abandonment.mjs (REST/admin-API based).
-- All timestamps are UTC. "Non-test" = email not ending in .test
-- =====================================================================

-- 0. Orphaned auth users: auth.users without a profiles row (trigger
--    on_auth_user_created failure would land here — expect 0 rows).
select u.id, u.email, u.created_at
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
  and u.role = 'authenticated'
order by u.created_at;

-- 1. Users who never confirmed their email (never got a session).
select u.id, u.email, u.created_at,
       u.raw_user_meta_data->>'username' as meta_username,
       u.raw_app_meta_data->>'provider' as provider
from auth.users u
where u.email_confirmed_at is null
  and u.role = 'authenticated'
  and u.email not like '%.test'
order by u.created_at;

-- 2. Confirmed but never completed onboarding (profiles.onboarding_completed
--    is only set by the /onboarding page's completeOnboarding action).
select u.email, u.created_at, p.username,
       u.raw_app_meta_data->>'provider' as provider,
       u.last_sign_in_at
from auth.users u
join public.profiles p on p.id = u.id
where u.email_confirmed_at is not null
  and p.onboarding_completed = false
order by u.created_at;

-- 3. Onboarded but never started any practice or mock session.
select u.email, u.created_at, p.username
from auth.users u
join public.profiles p on p.id = u.id
where u.email_confirmed_at is not null
  and p.onboarding_completed = true
  and not exists (
    select 1 from public.exam_sessions es where es.user_id = u.id
  )
order by u.created_at;

-- 4. Started sessions but never completed a mock (not "fully active").
select u.email, u.created_at, p.username,
       count(es.*) filter (where es.mode = 'mock') as mocks_started,
       count(es.*) filter (where es.mode = 'practice') as practice_sessions
from auth.users u
join public.profiles p on p.id = u.id
join public.exam_sessions es on es.user_id = u.id
where u.email_confirmed_at is not null
  and not exists (
    select 1 from public.exam_sessions m
    where m.user_id = u.id and m.mode = 'mock' and m.status = 'completed'
  )
group by u.id, u.email, u.created_at, p.username
order by u.created_at;

-- 5. Full funnel at a glance (all-time).
select
  count(*)                                                                  as total_signups,
  count(*) filter (where u.email_confirmed_at is null)                      as unconfirmed,
  count(*) filter (where u.email_confirmed_at is not null
                   and p.onboarding_completed = false)                      as not_onboarded,
  count(*) filter (where u.email_confirmed_at is not null
                   and p.onboarding_completed = true
                   and not exists (select 1 from exam_sessions es where es.user_id = u.id))
                                                                            as onboarded_no_session,
  count(*) filter (where u.email_confirmed_at is not null
                   and exists (select 1 from exam_sessions es where es.user_id = u.id)
                   and not exists (select 1 from exam_sessions m
                                   where m.user_id = u.id and m.mode = 'mock' and m.status = 'completed'))
                                                                            as sessions_no_completed_mock,
  count(*) filter (where exists (select 1 from exam_sessions m
                                 where m.user_id = u.id and m.mode = 'mock' and m.status = 'completed'))
                                                                            as fully_active
from auth.users u
left join public.profiles p on p.id = u.id
where u.role = 'authenticated'
  and u.email not like '%.test';

-- 6. Same funnel, LAST 7 DAYS ONLY (signup date within the window).
select
  count(*)                    as signups_7d,
  count(*) filter (where u.email_confirmed_at is null) as unconfirmed,
  count(*) filter (where u.email_confirmed_at is not null and p.onboarding_completed = false) as not_onboarded,
  count(*) filter (where u.email_confirmed_at is not null and p.onboarding_completed = true
                   and not exists (select 1 from exam_sessions es where es.user_id = u.id)) as onboarded_no_session,
  count(*) filter (where exists (select 1 from exam_sessions m
                                 where m.user_id = u.id and m.mode = 'mock' and m.status = 'completed')) as fully_active
from auth.users u
left join public.profiles p on p.id = u.id
where u.role = 'authenticated'
  and u.email not like '%.test'
  and u.created_at >= now() - interval '7 days';

-- 7. Unconfirmed signups by day (volume vs. release/campaign calendar).
select u.created_at::date as signup_day, count(*) as unconfirmed
from auth.users u
where u.email_confirmed_at is null
  and u.role = 'authenticated'
  and u.email not like '%.test'
group by 1
order by 1;

-- 8. Placeholder usernames (user_xxxxxxxx) — near-total non-completion.
select u.email, u.created_at, p.username,
       u.raw_app_meta_data->>'provider' as provider,
       p.onboarding_completed
from auth.users u
join public.profiles p on p.id = u.id
where p.username ~ '^user_[a-f0-9]{8}$'
order by u.created_at;

-- NOTE ON DEVICE/BROWSER METADATA: nothing in signup sends a user-agent or
-- screen/device fingerprint; auth.users only stores raw_app_meta_data
-- (provider) and raw_user_meta_data (username). Device-level abandonment
-- attribution is therefore not available in production.