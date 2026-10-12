-- Topic graph: curriculum nodes owned by subjects (never by exams —
-- subjects organize, exams configure). Seeded from the notes library;
-- question mappings grow through admin tagging. Consumers (twins,
-- interleaving, prerequisites) prefer topic-level data and fall back
-- to subject-level wherever mappings are thin.

create table topics (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references subjects(id) on delete cascade,
  slug text not null,
  name text not null,
  description text null,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  unique (subject_id, slug)
);

create index topics_subject_idx on topics (subject_id, sort_order);

create table topic_prerequisites (
  topic_id uuid not null references topics(id) on delete cascade,
  prerequisite_topic_id uuid not null references topics(id) on delete cascade,
  primary key (topic_id, prerequisite_topic_id),
  check (topic_id <> prerequisite_topic_id)
);

create table question_topics (
  question_id uuid not null references questions(id) on delete cascade,
  topic_id uuid not null references topics(id) on delete cascade,
  role text not null default 'practice'
    check (role in ('diagnostic', 'practice', 'review', 'mock')),
  primary key (question_id, topic_id, role)
);

create index question_topics_topic_idx on question_topics (topic_id);

alter table topics enable row level security;
alter table topic_prerequisites enable row level security;
alter table question_topics enable row level security;

-- Published curriculum graph is world-readable; writes stay privileged
-- (service-role behind requireAdmin), same as questions.
create policy "anyone reads published topics"
  on topics for select
  to anon, authenticated
  using (published = true);

create policy "anyone reads prerequisites"
  on topic_prerequisites for select
  to anon, authenticated
  using (true);

create policy "authenticated reads question topics"
  on question_topics for select
  to authenticated
  using (true);
