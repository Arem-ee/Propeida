-- Standard classification system (no AI): a controlled registry of
-- misconception codes plus a cognitive-demand level per question.
-- Admins classify from the registry; free-text codes stop here.
-- Repeat detection, coverage reporting, and any future model all key
-- off these codes — which is why they are rows, not strings.

create table misconception_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  subject_id uuid not null references subjects(id) on delete cascade,
  name text not null,
  definition text not null,
  example text null,
  created_at timestamptz not null default now()
);

create index misconception_codes_subject_idx on misconception_codes (subject_id);

alter table misconception_codes enable row level security;

-- The registry is reference data: readable by anyone signed in.
create policy "authenticated reads misconception codes"
  on misconception_codes for select
  to authenticated
  using (true);

-- Revised taxonomy level (Anderson & Krathwohl) per question.
-- Optional: unrated questions predate the standard, not violations of it.
alter table questions
  add column if not exists cognitive_level text null
  check (cognitive_level is null or cognitive_level in ('remember', 'understand', 'apply', 'analyze'));
