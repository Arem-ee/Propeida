-- Exam-scoped learner model: mastery and reviews belong to the path that
-- earned them. Today the model is per (user, subject) globally, so evidence
-- from a Post-UTME session moved the JAMB meter and vice versa — two exams,
-- one conflated brain. Learners do not do the same thing and must not share
-- the same score.
--
-- exam_id NULL keeps legacy rows readable everywhere (shared progress from
-- before paths existed). New evidence is attributed to the session's exam at
-- write time; reads merge NULL + own-path rows. A stricter backfill is
-- deliberately skipped: rewriting anyone's history would be a lie either way.

alter table learner_topic_mastery
  add column if not exists exam_id uuid references exams(id) on delete cascade;

alter table review_queue
  add column if not exists exam_id uuid references exams(id) on delete cascade;

-- One row per (user, exam, subject) for subject-level mastery, plus the
-- shared NULL lane for legacy rows. Postgres treats NULLs as distinct, so
-- the index below collapses to one row each; the old index stays to keep
-- legacy rows unique until code stops reading them.
create unique index if not exists learner_mastery_exam_subject_unique
  on learner_topic_mastery (user_id, coalesce(exam_id, '00000000-0000-0000-0000-000000000000'::uuid), subject_id)
  where topic_id is null;

create index if not exists learner_mastery_exam_due_idx
  on learner_topic_mastery (user_id, exam_id, next_review_at);

create index if not exists review_queue_exam_due_idx
  on review_queue (user_id, exam_id, due_at)
  where state = 'due';

-- Backfill review rows from their source session's exam so due work is
-- attributed correctly even before new code writes the column.
update review_queue rq
  set exam_id = es.exam_id
  from exam_sessions es
  where rq.source_session_id = es.id
    and rq.exam_id is null;

comment on column learner_topic_mastery.exam_id is
  'Exam this mastery row belongs to. NULL means shared/legacy progress visible to every path.';
comment on column review_queue.exam_id is
  'Exam this review belongs to. NULL means shared/legacy review visible to every path.';
