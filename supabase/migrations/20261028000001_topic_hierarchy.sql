-- Topic tree and syllabus coverage.
--
-- Subject structures differ. Some JAMB syllabi are section > topic, while
-- others need a topic split further (Physics "Waves" is too large for one
-- lesson). Lessons attach to topics, so a topic can now be a parent with
-- child topics, each of which can carry its own lesson.
--
-- The syllabus notes and objectives stay on the topic so coverage is
-- auditable: every syllabus item must appear in a lesson, and every
-- "candidates should be able to" objective must be teachable from one.

alter table topics add column if not exists parent_topic_id uuid null
  references topics(id) on delete cascade;

-- Syllabus locator, e.g. "Biology A.1" or "Government 12".
alter table topics add column if not exists syllabus_ref text null;

-- The syllabus "Topics and notes" list (sub-topics) and objectives.
alter table topics add column if not exists syllabus_items jsonb not null default '[]'::jsonb;
alter table topics add column if not exists objectives jsonb not null default '[]'::jsonb;

create index if not exists topics_parent_order_idx
  on topics (parent_topic_id, sort_order);

create index if not exists topics_subject_section_order_idx
  on topics (subject_id, section_key, sort_order);

comment on column topics.parent_topic_id is
  'Parent topic when a syllabus topic is split into sub-topics; null at the top level.';
comment on column topics.syllabus_ref is
  'Syllabus locator, e.g. "Biology A.1" or "Government 12".';
comment on column topics.syllabus_items is
  'Syllabus topics/notes for this topic, as an array of strings.';
comment on column topics.objectives is
  'Syllabus "candidates should be able to" objectives, as an array of strings.';
