-- English curriculum spine.
--
-- The JAMB Use of English syllabus is three sections (A Comprehension and
-- Summary, B Lexis and Structure, C Oral Forms) holding 22 topics. Nothing
-- in the schema could express that: topics had no syllabus section, and
-- lessons were ordered by created_at, so the recommended next lesson was
-- whatever happened to be seeded first.
--
-- This adds the two columns the spine needs, without touching how topics or
-- lessons are read today.

-- Which syllabus section a topic sits in ('A', 'B', 'C') and its title.
alter table topics add column if not exists section_key text null;
alter table topics add column if not exists section_title text null;

-- Curriculum order for lessons. Null means "not yet placed"; readers fall
-- back to created_at so existing rows keep their behaviour.
alter table lessons add column if not exists sort_order integer null;

create index if not exists lessons_subject_order_idx
  on lessons (subject_id, sort_order)
  where status = 'published';

comment on column topics.section_key is
  'Syllabus section this topic belongs to (JAMB: A, B, C)';
comment on column lessons.sort_order is
  'Position in the subject curriculum. Lower comes first.';
