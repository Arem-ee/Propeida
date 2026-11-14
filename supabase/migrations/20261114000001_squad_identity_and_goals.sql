-- Study Squad identity + weekly collective goal.
--
-- Squads are cooperative. The goal is ONE shared target per squad per week
-- ("questions answered together" or "subjects secured together"), never a
-- per-member quota, never a comparison. Totals are only ever shown to a
-- squad with 3+ members (enforced in the server action, same rule as the
-- existing weekly aggregates). Nobody is ever named against a number.
--
-- Writes stay service-role only, matching the existing squad tables:
-- members can read their own squad's goal rows, clients cannot insert.

alter table squads
  add column if not exists name text null,
  add column if not exists emoji text null,
  add column if not exists color text null;

alter table squads
  add constraint squads_name_shape check (
    name is null or (char_length(btrim(name)) between 2 and 40)
  ),
  add constraint squads_emoji_shape check (
    emoji is null or char_length(emoji) <= 16
  ),
  add constraint squads_color_shape check (
    color is null or color ~ '^#[0-9a-fA-F]{6}$'
  );

create table if not exists squad_weekly_goals (
  id uuid primary key default gen_random_uuid(),
  squad_id uuid not null references squads(id) on delete cascade,
  -- Monday (UTC) of the ISO week the goal applies to.
  week_start date not null,
  kind text not null check (kind in ('questions', 'secured')),
  -- questions: 50..5000 answered; secured: 1..20 subjects (sent as items).
  target integer not null check (target between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One goal per squad per week. Last write wins (any member may set it).
create unique index if not exists squad_weekly_goals_squad_week
  on squad_weekly_goals (squad_id, week_start);

create index if not exists squad_weekly_goals_squad_idx
  on squad_weekly_goals (squad_id, week_start desc);

alter table squad_weekly_goals enable row level security;

create policy "members read own squad goals"
  on squad_weekly_goals for select
  to authenticated
  using (public.is_squad_member(squad_id));

grant select on table squad_weekly_goals to authenticated;
revoke insert, update, delete on table squad_weekly_goals from public, anon, authenticated;

-- Keep updated_at honest on upsert-style writes from the service role.
create or replace function public.touch_squad_weekly_goals()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists squad_weekly_goals_touch on squad_weekly_goals;
create trigger squad_weekly_goals_touch
  before update on squad_weekly_goals
  for each row execute function public.touch_squad_weekly_goals();
