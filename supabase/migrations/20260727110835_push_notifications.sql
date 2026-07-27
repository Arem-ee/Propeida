-- Store push notification subscriptions
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

alter table push_subscriptions enable row level security;

create policy "Users can manage their own subscriptions"
  on push_subscriptions for all
  using (auth.uid() = user_id);

-- For sending notifications (admin/service)
create policy "Service role can read subscriptions"
  on push_subscriptions for select
  using (true);

-- Allow unauthenticated inserts during signup flow if needed
-- (endpoint is unique per user, so upsert is safe)
grant insert (user_id, endpoint, p256dh, auth) on push_subscriptions to authenticated;
grant select, delete on push_subscriptions to authenticated;
