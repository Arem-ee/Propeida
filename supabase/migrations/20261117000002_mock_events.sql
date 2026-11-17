-- Admin-scheduled mock events — platform-wide events where Pro users sit an
-- exam together in the same time window. The event id seeds the question draw,
-- so every participant sees an identical paper. Rankings read from the
-- completed sessions tied to the event.
--
-- mock_events: one row per scheduled mock. Read is public; writes go through
-- the service role in the admin UI only — no client writes.
create table if not exists mock_events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  exam_id uuid not null references exams(id) on delete restrict,
  slug text not null unique,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  description text,
  created_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint mock_events_window check (ends_at > starts_at),
  constraint mock_events_name_not_blank check (btrim(name) <> '')
);

create index if not exists mock_events_window_idx on mock_events (starts_at, ends_at);

alter table mock_events enable row level security;

-- Authenticated users read published events. Writes stay service-role only.
drop policy if exists "authenticated read mock events" on mock_events;
create policy "authenticated read mock events"
  on mock_events for select
  to authenticated
  using (true);

-- Tag sessions that belong to an event so leaderboards need no guesswork.
alter table exam_sessions
  add column if not exists mock_event_id uuid null references mock_events(id) on delete set null;

create index if not exists exam_sessions_mock_event_idx on exam_sessions (mock_event_id);
