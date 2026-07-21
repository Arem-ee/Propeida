create table contact_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table contact_submissions enable row level security;

create policy "Anyone can insert contact submissions"
  on contact_submissions for insert
  to anon, authenticated
  with check (true);

create policy "Admins can view contact submissions"
  on contact_submissions for select
  to authenticated
  using (auth.jwt() ->> 'role' = 'service_role');
