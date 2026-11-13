-- Squad mock windows: members agree on one start time for the same mock.
-- No performance is read or compared; this co-ordinates when people sit the
-- same paper, nothing else.

create table if not exists squad_mock_windows (
  id uuid primary key default gen_random_uuid(),
  squad_id uuid not null references squads(id) on delete cascade,
  exam_id uuid not null references exams(id) on delete cascade,
  created_by uuid null references auth.users(id) on delete set null,
  starts_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint squad_mock_windows_future check (starts_at > created_at - interval '1 hour')
);

create index if not exists squad_mock_windows_squad_starts_idx
  on squad_mock_windows (squad_id, starts_at);

alter table squad_mock_windows enable row level security;

-- Members read their squad's windows. Inserts, updates and deletes stay with
-- the server so a client cannot invent or move a squad event.
create policy "members read squad mock windows"
  on squad_mock_windows for select
  to authenticated
  using (public.is_squad_member(squad_id));

grant select on table squad_mock_windows to authenticated;
revoke insert, update, delete on table squad_mock_windows from public, anon, authenticated;
