-- ============================================================
-- Explore: Careers, Courses, Universities (Phase 1)
-- The first layer of Propeida's education-to-career journey.
-- Public reference content: careers, courses, universities,
-- plus junction tables for career<->course and course<->university.
-- Future layers (professionals, internships, scholarships, jobs,
-- events) will attach to these tables without rebuilding them.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Extend schools into the Explore "universities" entity.
--    Existing exams/user_exam_access flows are unaffected; the
--    new columns are additive and nullable.
-- ------------------------------------------------------------
alter table schools
  add column if not exists location    text,
  add column if not exists type        text,
  add column if not exists description text,
  add column if not exists website     text,
  add column if not exists published   boolean not null default false,
  add column if not exists updated_at  timestamptz not null default now();

-- ------------------------------------------------------------
-- 2. Careers
-- ------------------------------------------------------------
create table if not exists careers (
  id                   uuid primary key default gen_random_uuid(),
  slug                 text not null unique,
  name                 text not null,
  category             text not null default '',
  short_description    text,
  description          text,
  what_you_do          text[] not null default '{}',
  work_environments    text[] not null default '{}',
  industries           text[] not null default '{}',
  common_job_titles    text[] not null default '{}',
  skills               text[] not null default '{}',
  misconceptions       text[] not null default '{}',
  career_progression   text,
  related_careers      text[] not null default '{}',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  published            boolean not null default false
);

-- ------------------------------------------------------------
-- 3. Courses
-- ------------------------------------------------------------
create table if not exists courses (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  published   boolean not null default false
);

-- ------------------------------------------------------------
-- 4. Junction tables (relationships are queryable, not arrays)
-- ------------------------------------------------------------
create table if not exists career_courses (
  career_id  uuid not null references careers (id) on delete cascade,
  course_id  uuid not null references courses (id) on delete cascade,
  primary key (career_id, course_id)
);

create table if not exists course_universities (
  course_id     uuid not null references courses (id) on delete cascade,
  university_id uuid not null references schools (id) on delete cascade,
  primary key (course_id, university_id)
);

create index if not exists career_courses_course_id_idx on career_courses (course_id);
create index if not exists course_universities_university_id_idx on course_universities (university_id);
create index if not exists careers_category_idx on careers (category);
create index if not exists careers_published_idx on careers (published);
create index if not exists courses_published_idx on courses (published);
create index if not exists schools_published_idx on schools (published);

-- ------------------------------------------------------------
-- 5. updated_at maintenance
-- ------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists careers_set_updated_at on careers;
create trigger careers_set_updated_at
  before update on careers
  for each row execute function set_updated_at();

drop trigger if exists courses_set_updated_at on courses;
create trigger courses_set_updated_at
  before update on courses
  for each row execute function set_updated_at();

drop trigger if exists schools_set_updated_at on schools;
create trigger schools_set_updated_at
  before update on schools
  for each row execute function set_updated_at();

-- ------------------------------------------------------------
-- 6. RLS
--    Published Explore content is publicly readable (anon +
--    authenticated). Mutations happen only via the service role
--    (admin API routes), matching the app's existing model where
--    admin writes never use client credentials.
-- ------------------------------------------------------------
alter table careers enable row level security;
alter table courses enable row level security;
alter table career_courses enable row level security;
alter table course_universities enable row level security;

drop policy if exists "published careers are publicly readable" on careers;
create policy "published careers are publicly readable"
  on careers for select to public
  using (published = true);

drop policy if exists "published courses are publicly readable" on courses;
create policy "published courses are publicly readable"
  on courses for select to public
  using (published = true);

drop policy if exists "career_courses are publicly readable" on career_courses;
create policy "career_courses are publicly readable"
  on career_courses for select to public
  using (true);

drop policy if exists "course_universities are publicly readable" on course_universities;
create policy "course_universities are publicly readable"
  on course_universities for select to public
  using (true);

-- Reads for the web clients; writes stay service-role only.
grant select on careers, courses, career_courses, course_universities to anon, authenticated;
alter default privileges in schema public grant select on tables to anon, authenticated;

-- ------------------------------------------------------------
-- 7. Seed: a small, factual starter set (development use).
--    No statistics, salaries, or fabricated claims. More content
--    is added through the admin CMS / CSV import.
-- ------------------------------------------------------------
update schools
set type        = 'Federal',
    location    = 'Ilorin, Kwara State',
    website     = 'https://unilorin.edu.ng',
    description = 'A federal university in Ilorin, Kwara State, Nigeria.',
    published   = true
where slug = 'university-of-ilorin';

insert into careers (slug, name, category, short_description, description, what_you_do, work_environments, industries, common_job_titles, skills, misconceptions, career_progression, published)
values
  ('software-engineer', 'Software Engineer', 'Technology',
   'Designs, builds, tests, and maintains the software that powers websites, mobile apps, and computer systems.',
   'Software engineering is the practice of designing, building, testing, and maintaining software systems. Engineers turn ideas into working products by writing code, but the job is much broader: understanding the problem, breaking it into pieces, testing that each piece works, and keeping systems running after they ship.',
   array['Write and review code for websites, apps, and systems', 'Break problems into small, testable pieces', 'Test software and fix bugs', 'Work with designers, product people, and other engineers', 'Improve and maintain existing systems'],
   array['Technology companies', 'Banks and financial services', 'Telecommunications firms', 'Government agencies', 'Remote and hybrid teams'],
   array['Technology', 'Banking and Finance', 'Telecommunications', 'E-commerce'],
   array['Software Developer', 'Frontend Developer', 'Backend Developer', 'Mobile App Developer', 'DevOps Engineer', 'QA Engineer'],
   array['Programming (e.g. Python, JavaScript, Java)', 'Problem-solving and logical reasoning', 'Mathematics', 'Attention to detail', 'Teamwork and communication'],
   array['You must memorise programming languages before you can start', 'Only people who studied Computer Science can be software engineers', 'It is only about writing code all day'],
   'Junior developer, then mid-level, then senior, then team lead, then engineering manager or software architect. Many engineers also specialise in areas such as mobile development, data engineering, or security.',
   true),
  ('medical-doctor', 'Medical Doctor', 'Medicine and Health',
   'Examines, diagnoses, and treats patients, and works to prevent and manage illness.',
   'A medical doctor examines patients, works out what is wrong, and treats or manages illness. The work combines deep knowledge of the human body with careful observation and clear communication. It is a long, structured path, and every stage of it involves working directly with people who are unwell and their families.',
   array['Take patient histories and carry out physical examinations', 'Order and interpret tests such as blood work and imaging', 'Diagnose conditions and plan treatment', 'Prescribe medication and monitor progress', 'Advise patients on prevention and healthy living', 'Work with nurses, pharmacists, and other clinicians'],
   array['Hospitals', 'Clinics and health centres', 'Private practice', 'Public health agencies'],
   array['Healthcare', 'Public Health', 'Research and Academia'],
   array['House Officer', 'Medical Officer', 'Resident Doctor', 'Consultant', 'General Practitioner'],
   array['Biology and chemistry', 'Careful observation and diagnosis', 'Communication with patients and families', 'Decision-making under pressure', 'Empathy and patience'],
   array['Doctors only work in hospitals', 'You must study Medicine and Surgery to have any career in healthcare', 'Being a doctor is purely about memorising medical facts'],
   'Medical school, then housemanship, then the National Youth Service, then residency training in a speciality, then consultant. Some doctors also move into research, public health, administration, or teaching.',
   true),
  ('lawyer', 'Lawyer', 'Law',
   'Advises clients on the law, drafts legal documents, and represents them in court and other legal proceedings.',
   'Lawyers help people and organisations understand and follow the law, and defend their rights when disputes arise. The work is built on reading, writing, and arguing precisely. Most of it happens outside the courtroom, in offices and meeting rooms, preparing cases and advising clients.',
   array['Advise clients on their legal rights and options', 'Draft contracts, agreements, and legal documents', 'Research laws and past cases', 'Represent clients in court and tribunals', 'Negotiate settlements and agreements', 'Handle legal disputes and compliance issues'],
   array['Law firms', 'Chambers', 'Banks and corporate legal departments', 'Government ministries and agencies', 'Courts and tribunals'],
   array['Legal Services', 'Banking and Finance', 'Government and Public Service', 'Real Estate'],
   array['Barrister', 'Solicitor', 'Legal Advisor', 'Corporate Counsel', 'Prosecutor'],
   array['Reading and interpreting complex texts', 'Clear writing and speaking', 'Argument and logical reasoning', 'Research', 'Memory and attention to detail'],
   array['Lawyers spend most of their time in court', 'Law is only for people who want to argue', 'You must study Law as an undergraduate to enter any legal career'],
   'Law school, then call to the bar, then junior associate or legal officer, then senior associate, then partner or in-house counsel. Lawyers can also move into policy, academia, or regulation.',
   true);

insert into courses (slug, name, description, published) values
  ('computer-science', 'Computer Science',
   'The study of computers, algorithms, and software, including how to design programs, process data, and build systems that solve real problems.',
   true),
  ('medicine-and-surgery', 'Medicine and Surgery',
   'The study of the human body, health, and disease, preparing students to become medical doctors.',
   true),
  ('law', 'Law',
   'The study of legal systems, rights, and obligations, preparing students for careers in legal practice, policy, and regulation.',
   true);

insert into career_courses (career_id, course_id)
select c.id, co.id from careers c, courses co
where (c.slug = 'software-engineer' and co.slug = 'computer-science')
   or (c.slug = 'medical-doctor' and co.slug = 'medicine-and-surgery')
   or (c.slug = 'lawyer' and co.slug = 'law');

insert into course_universities (course_id, university_id)
select co.id, s.id from courses co, schools s
where s.slug = 'university-of-ilorin'
  and co.slug in ('computer-science', 'medicine-and-surgery', 'law');
