-- Post-UTME data model: per-school, per-year screening facts + learner intent.
--
-- Modes and weights come from official university notices (see docs §12);
-- every row is year-tagged and sourced. Unknowns stay NULL rather than
-- guessed — OAU/UI weights were never published in fetched notices.

create table school_screenings (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  year integer not null check (year >= 2000 and year <= 2100),
  mode text not null
    check (mode in ('in_person_cbt', 'online_proctored', 'documentary')),
  jamb_weight integer null check (jamb_weight is null or (jamb_weight >= 0 and jamb_weight <= 100)),
  screening_weight integer null check (screening_weight is null or (screening_weight >= 0 and screening_weight <= 100)),
  olevel_weight integer null check (olevel_weight is null or (olevel_weight >= 0 and olevel_weight <= 100)),
  cutoff integer null,
  sittings_allowed integer null,
  source text null,
  created_at timestamptz not null default now(),
  unique (school_id, year)
);

create table student_targets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  school_id uuid not null references schools(id) on delete cascade,
  exam_id uuid null references exams(id) on delete set null,
  priority integer not null default 1,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, school_id)
);

alter table school_screenings enable row level security;
alter table student_targets enable row level security;

-- Screening facts are reference data: world-readable.
create policy "anyone reads school screenings"
  on school_screenings for select
  to anon, authenticated
  using (true);

-- Learners own their target list.
create policy "users manage own targets"
  on student_targets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
