-- Support contributions: optional, public-support payments recorded separately from product payments.
-- Guests can contribute, so user_id is nullable; email is required by Paystack.
create table if not exists support_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  amount integer not null,
  reference text not null unique,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table support_contributions enable row level security;

-- Signed-in users can view their own contributions.
create policy "users can read own support contributions"
  on support_contributions for select
  to authenticated
  using (user_id = auth.uid());

create index if not exists idx_support_contributions_reference on support_contributions (reference);
create index if not exists idx_support_contributions_created_at on support_contributions (created_at desc);