-- Career Opportunity Profile
-- Reference tables for the Nigerian career opportunity layer:
-- sectors, employer types, junctions, and profile columns on careers.

-- ==========================================================================
-- 1. Sectors
-- ==========================================================================

create table if not exists public.sectors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

alter table public.sectors enable row level security;

create policy "sectors are publicly readable"
  on public.sectors for select
  using (true);

grant select on public.sectors to anon, authenticated;

insert into public.sectors (slug, name, description) values
  ('power-energy', 'Power & Energy', 'Generation, transmission and distribution of electricity'),
  ('renewable-energy', 'Renewable Energy', 'Solar, wind and other clean energy systems'),
  ('telecommunications', 'Telecommunications', 'Networks, data centres and communication infrastructure'),
  ('manufacturing', 'Manufacturing', 'Factories producing goods, food and materials'),
  ('oil-gas', 'Oil & Gas', 'Upstream and downstream petroleum operations'),
  ('construction', 'Construction', 'Buildings, roads and civil works'),
  ('automation-control', 'Automation & Control', 'Industrial automation, instrumentation and process control'),
  ('technology', 'Technology', 'Software, hardware and digital services'),
  ('infrastructure', 'Infrastructure', 'Public works, rail, aviation and utilities'),
  ('research', 'Research', 'Universities, laboratories and applied R&D'),
  ('banking-finance', 'Banking & Finance', 'Banks, fintech and financial services'),
  ('healthcare', 'Healthcare', 'Hospitals, clinics and public health'),
  ('agriculture', 'Agriculture', 'Farming, food processing and agri-business'),
  ('education', 'Education', 'Schools, universities and training'),
  ('public-service', 'Public Service', 'Government agencies and parastatals'),
  ('media-communication', 'Media & Communication', 'Publishing, broadcasting and content'),
  ('real-estate', 'Real Estate', 'Property development and management'),
  ('e-commerce', 'E-commerce', 'Online retail and logistics platforms'),
  ('fmcg', 'FMCG', 'Fast-moving consumer goods'),
  ('transport-logistics', 'Transport & Logistics', 'Mobility, shipping and supply chains'),
  ('startups', 'Startups', 'Early-stage technology ventures'),
  ('mining-solid-minerals', 'Mining & Solid Minerals', 'Extraction and processing of mineral resources')
on conflict (slug) do nothing;

-- ==========================================================================
-- 2. Employer types
-- ==========================================================================

create table if not exists public.employer_types (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

alter table public.employer_types enable row level security;

create policy "employer types are publicly readable"
  on public.employer_types for select
  using (true);

grant select on public.employer_types to anon, authenticated;

insert into public.employer_types (slug, name, description) values
  ('power-generation-companies', 'Power generation companies (GENCOs)', 'Companies that generate electricity for the grid'),
  ('distribution-companies', 'Distribution companies (DISCOs)', 'Companies that distribute and retail electricity'),
  ('telecom-operators', 'Telecommunications operators', 'Mobile, fixed and data network operators'),
  ('manufacturing-companies', 'Manufacturing companies', 'Producers of goods, food and materials'),
  ('engineering-consultancies', 'Engineering consultancies', 'Design, advisory and project services'),
  ('construction-companies', 'Construction companies', 'Buildings, roads and civil works contractors'),
  ('oil-gas-companies', 'Oil & gas companies', 'Upstream and downstream petroleum operators and services'),
  ('renewable-energy-companies', 'Renewable energy companies', 'Solar and other clean energy developers and installers'),
  ('technology-companies', 'Technology companies', 'Software, hardware and digital service firms'),
  ('government-agencies', 'Government agencies', 'Ministries, departments and parastatals'),
  ('research-institutions', 'Research institutions', 'Universities, laboratories and research centres'),
  ('startups', 'Startups', 'Early-stage technology ventures'),
  ('banks-financial-services', 'Banks and financial services', 'Commercial banks, fintechs and financial institutions'),
  ('insurance-companies', 'Insurance companies', 'Life, general and health insurers'),
  ('hospitals-clinics', 'Hospitals and clinics', 'Public and private healthcare providers'),
  ('pharmaceutical-companies', 'Pharmaceutical companies', 'Drug manufacturers and distributors'),
  ('public-health-agencies', 'Public health agencies', 'Government and international health bodies'),
  ('law-firms-chambers', 'Law firms and chambers', 'Private legal practice'),
  ('corporate-legal-departments', 'Corporate legal departments', 'In-house legal teams in companies and banks'),
  ('courts-tribunals', 'Courts and tribunals', 'Judicial and dispute resolution bodies'),
  ('ngo-public-interest', 'NGOs and public interest bodies', 'Non-profit and civil society organisations')
on conflict (slug) do nothing;

-- ==========================================================================
-- 3. Junctions
-- ==========================================================================

create table if not exists public.career_sectors (
  career_id uuid not null references public.careers (id) on delete cascade,
  sector_id uuid not null references public.sectors (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (career_id, sector_id)
);

create index if not exists career_sectors_sector_id_idx on public.career_sectors (sector_id);

alter table public.career_sectors enable row level security;

create policy "career sectors are publicly readable"
  on public.career_sectors for select
  using (true);

grant select on public.career_sectors to anon, authenticated;

create table if not exists public.career_employer_types (
  career_id uuid not null references public.careers (id) on delete cascade,
  employer_type_id uuid not null references public.employer_types (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (career_id, employer_type_id)
);

create index if not exists career_employer_types_employer_type_id_idx
  on public.career_employer_types (employer_type_id);

alter table public.career_employer_types enable row level security;

create policy "career employer types are publicly readable"
  on public.career_employer_types for select
  using (true);

grant select on public.career_employer_types to anon, authenticated;

-- ==========================================================================
-- 4. Opportunity profile columns on careers
-- ==========================================================================

alter table public.careers
  add column if not exists demand_level text,
  add column if not exists demand_summary text,
  add column if not exists demand_evidence text,
  add column if not exists outlook_level text,
  add column if not exists outlook_basis text,
  add column if not exists outlook_summary text,
  add column if not exists nigerian_reality text,
  add column if not exists international_transferability text,
  add column if not exists skill_stack jsonb not null default '[]'::jsonb,
  add column if not exists learning_path jsonb not null default '{}'::jsonb,
  add column if not exists evidence jsonb not null default '[]'::jsonb,
  add column if not exists last_reviewed date;

alter table public.careers
  drop constraint if exists careers_demand_level_check,
  drop constraint if exists careers_outlook_level_check,
  drop constraint if exists careers_outlook_basis_check;

alter table public.careers
  add constraint careers_demand_level_check check (
    demand_level in ('high', 'growing', 'moderate', 'competitive', 'emerging', 'limited', 'uncertain')
  ),
  add constraint careers_outlook_level_check check (
    outlook_level in ('growing', 'stable', 'emerging', 'competitive', 'declining', 'uncertain')
  ),
  add constraint careers_outlook_basis_check check (
    outlook_basis in ('evidence', 'trend', 'projection', 'interpretation')
  );

-- ==========================================================================
-- 5. New career: electrical engineer
-- ==========================================================================

insert into public.careers (
  slug, name, category, short_description, description,
  what_you_do, work_environments, industries, common_job_titles,
  skills, misconceptions, career_progression, related_careers,
  published, created_at, updated_at
) values (
  'electrical-engineer',
  'Electrical Engineer',
  'Engineering',
  'Designs, builds and maintains the systems that generate, control and use electricity, from power grids to electronics.',
  'Electrical engineers design and maintain systems that generate, control and use electricity. That includes power systems, industrial automation, electronics, telecoms and renewable energy. The work ranges from the national grid to the circuit board inside a phone, so the career splits into many specialisations over time.',
  array['Design and maintain power systems, from generation to distribution', 'Build and test electronic circuits and embedded systems', 'Design control systems for industrial automation', 'Work on telecoms infrastructure such as base stations and networks', 'Size and install renewable energy systems such as solar PV', 'Inspect and maintain electrical equipment in factories and buildings'],
  array['Power plants and substations', 'Manufacturing plants', 'Telecoms and broadcast facilities', 'Engineering consultancies', 'Construction sites', 'Research laboratories'],
  array['Power & Energy', 'Renewable Energy', 'Telecommunications', 'Manufacturing', 'Oil & Gas', 'Construction', 'Technology'],
  array['Electrical Engineer', 'Power Engineer', 'Control and Automation Engineer', 'Embedded Systems Engineer', 'Telecom Engineer', 'Renewable Energy Engineer'],
  array['Circuit analysis', 'MATLAB and Simulink', 'Programming (C, Python)', 'AutoCAD', 'PLC programming', 'Problem-solving'],
  array['Electrical engineering is only about repairing appliances', 'You can only work with the national power company', 'A degree alone guarantees a job in the power sector'],
  'Graduate trainee or entry-level engineer, then design or field engineer, then senior engineer, then principal engineer or engineering manager. Specialists in automation, embedded systems, power systems or renewable energy often move between sectors as projects change.',
  array['software-engineer'],
  true,
  now(),
  now()
) on conflict (slug) do nothing;

insert into public.courses (slug, name, description, published, created_at, updated_at)
select 'electrical-electronics-engineering',
       'Electrical / Electronics Engineering',
       'The study of electrical power, electronics and electronic systems, from power generation to circuit design.',
       true,
       now(),
       now()
on conflict (slug) do nothing;

insert into public.career_courses (career_id, course_id)
select c.id, co.id
from public.careers c
join public.courses co on co.slug = 'electrical-electronics-engineering'
where c.slug = 'electrical-engineer'
on conflict (career_id, course_id) do nothing;

-- ==========================================================================
-- 6. Junction seeds for published careers
-- ==========================================================================

insert into public.career_sectors (career_id, sector_id)
select c.id, s.id
from (values
  ('software-engineer', array['technology', 'banking-finance', 'telecommunications', 'e-commerce', 'startups']),
  ('medical-doctor', array['healthcare', 'research', 'education', 'public-service']),
  ('lawyer', array['banking-finance', 'public-service', 'real-estate', 'technology', 'media-communication']),
  ('electrical-engineer', array[
    'power-energy', 'renewable-energy', 'telecommunications', 'manufacturing',
    'oil-gas', 'construction', 'automation-control', 'technology',
    'infrastructure', 'research'
  ])
) as m (career_slug, sector_slugs)
join public.careers c on c.slug = m.career_slug
join public.sectors s on s.slug = any (m.sector_slugs)
on conflict (career_id, sector_id) do nothing;

insert into public.career_employer_types (career_id, employer_type_id)
select c.id, e.id
from (values
  ('software-engineer', array['technology-companies', 'banks-financial-services', 'telecom-operators', 'government-agencies', 'startups']),
  ('medical-doctor', array['hospitals-clinics', 'public-health-agencies', 'research-institutions', 'pharmaceutical-companies']),
  ('lawyer', array['law-firms-chambers', 'corporate-legal-departments', 'courts-tribunals', 'government-agencies']),
  ('electrical-engineer', array[
    'power-generation-companies', 'distribution-companies', 'telecom-operators',
    'manufacturing-companies', 'engineering-consultancies', 'construction-companies',
    'oil-gas-companies', 'renewable-energy-companies', 'technology-companies',
    'government-agencies', 'research-institutions', 'startups'
  ])
) as m (career_slug, employer_slugs)
join public.careers c on c.slug = m.career_slug
join public.employer_types e on e.slug = any (m.employer_slugs)
on conflict (career_id, employer_type_id) do nothing;