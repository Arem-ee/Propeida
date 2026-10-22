-- Remove the pre-syllabus English topics.
--
-- Before the syllabus spine, English had five ad-hoc topics named after the
-- lessons that sat on them. The spine replaces them with the 22 topics JAMB
-- actually sets. No questions were mapped to the old topics (question_topics
-- was empty), and their prerequisite rows go with them on delete cascade.
--
-- The chain they encoded — sentence patterns need concord, concord needs word
-- classes — is restated against the syllabus topics by the curriculum seed.

delete from topics
where subject_id = (select id from subjects where slug = 'english')
  and slug in (
    'parts-of-speech',
    'concord-rules',
    'common-grammar-errors',
    'comprehension-tips',
    'vocabulary-and-idioms'
  );
