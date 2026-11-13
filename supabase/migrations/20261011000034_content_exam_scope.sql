-- Exam scope for content.
--
-- English made this concrete: the subject is attached to six exams, but
-- only unilorin-post-utme had a question bank, and its 328 questions are
-- Post-UTME format (median stem 57 characters, two per cent passage-based).
-- JAMB English is the opposite: 25 of its 60 questions come off a shared
-- passage. The lessons had no way to say which exam they belonged to, so a
-- JAMB lesson drew its micro-check from a Post-UTME question.
--
-- exam_id on topics and lessons says which exam a piece of content serves.
-- NULL means the content is shared by every exam for that subject, which is
-- the state every non-English lesson is in today.

alter table topics add column if not exists exam_id uuid references exams(id) on delete cascade;
alter table lessons add column if not exists exam_id uuid references exams(id) on delete set null;

-- A topic slug must be unique within its exam, not merely within its
-- subject: JAMB and Post-UTME will both have a "grammar" topic one day.
alter table topics drop constraint if exists topics_subject_id_slug_key;
create unique index if not exists topics_subject_exam_slug_key
  on topics (subject_id, coalesce(exam_id, '00000000-0000-0000-0000-000000000000'::uuid), slug);

alter table lessons drop constraint if exists lessons_subject_id_slug_key;
create unique index if not exists lessons_subject_exam_slug_key
  on lessons (subject_id, coalesce(exam_id, '00000000-0000-0000-0000-000000000000'::uuid), slug);

create index if not exists topics_subject_exam_idx on topics (subject_id, exam_id, sort_order);
create index if not exists lessons_subject_exam_idx on lessons (subject_id, exam_id, sort_order);

comment on column topics.exam_id is
  'Exam this topic belongs to. NULL means shared by every exam for the subject.';
comment on column lessons.exam_id is
  'Exam this lesson serves. NULL means shared by every exam for the subject.';

-- The English curriculum is JAMB English: 22 topics and 11 lessons built
-- from the official JAMB Use of English syllabus. The Post-UTME questions
-- stay on the Post-UTME exam, where they already are.
update topics
   set exam_id = (select id from exams where slug = 'jamb')
 where subject_id = (select id from subjects where slug = 'english')
   and slug in (
     'comprehension-question-skills', 'passage-description', 'passage-narration',
     'passage-exposition', 'passage-argumentation', 'summary-writing',
     'cloze-test-technique', 'synonyms', 'antonyms', 'clause-and-sentence-patterns',
     'word-classes-and-functions', 'mood-tense-and-aspect', 'number-agreement-and-concord',
     'degrees-of-comparison', 'question-tags', 'mechanics-spelling-and-punctuation',
     'ordinary-figurative-idiomatic-usage', 'vowels-monothongs-diphthongs-triphthongs',
     'consonants-and-clusters', 'rhymes-and-homophones', 'word-stress', 'emphatic-stress'
   );

update lessons
   set exam_id = (select id from exams where slug = 'jamb')
 where subject_id = (select id from subjects where slug = 'english');
