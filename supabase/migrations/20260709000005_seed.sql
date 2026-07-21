insert into schools (name, slug) values ('University of Ilorin', 'university-of-ilorin');

insert into exams (name, slug, description) values
  ('JAMB', 'jamb', 'Joint Admissions and Matriculation Board Unified Tertiary Matriculation Examination'),
  ('Post-UTME', 'post-utme', 'Post-Unified Tertiary Matriculation Examination screening'),
  ('WAEC', 'waec', 'West African Examinations Council Senior School Certificate Examination'),
  ('Scholarship', 'scholarship', 'Competitive scholarship and aptitude tests'),
  ('Aptitude', 'aptitude', 'General aptitude and reasoning assessments'),
  ('Postgraduate', 'postgraduate', 'Postgraduate entrance examinations');

insert into subjects (name, slug) values
  ('English', 'english'),
  ('Mathematics', 'mathematics'),
  ('Physics', 'physics'),
  ('Chemistry', 'chemistry'),
  ('Biology', 'biology'),
  ('Government', 'government'),
  ('Literature', 'literature'),
  ('Economics', 'economics'),
  ('Commerce', 'commerce'),
  ('Accounting', 'accounting'),
  ('Geography', 'geography'),
  ('History', 'history'),
  ('Christian Religious Studies', 'christian-religious-studies'),
  ('Islamic Studies', 'islamic-studies'),
  ('Agricultural Science', 'agricultural-science'),
  ('Verbal Reasoning', 'verbal-reasoning'),
  ('Quantitative Reasoning', 'quantitative-reasoning'),
  ('Logical Reasoning', 'logical-reasoning'),
  ('General Paper', 'general-paper');

-- JAMB subjects
insert into exam_subjects (exam_id, subject_id)
select e.id, s.id from exams e, subjects s
where e.slug = 'jamb' and s.slug in ('english', 'mathematics', 'physics', 'chemistry', 'biology', 'government', 'literature', 'economics', 'commerce', 'accounting', 'geography', 'history', 'christian-religious-studies', 'islamic-studies', 'agricultural-science');

-- Post-UTME subjects (same broad set)
insert into exam_subjects (exam_id, subject_id)
select e.id, s.id from exams e, subjects s
where e.slug = 'post-utme' and s.slug in ('english', 'mathematics', 'physics', 'chemistry', 'biology', 'government', 'literature', 'economics', 'commerce', 'accounting', 'geography', 'history', 'christian-religious-studies', 'islamic-studies', 'agricultural-science');

-- WAEC subjects
insert into exam_subjects (exam_id, subject_id)
select e.id, s.id from exams e, subjects s
where e.slug = 'waec' and s.slug in ('english', 'mathematics', 'physics', 'chemistry', 'biology', 'government', 'literature', 'economics', 'commerce', 'accounting', 'geography', 'history', 'christian-religious-studies', 'islamic-studies', 'agricultural-science');

-- Scholarship & Aptitude subjects
insert into exam_subjects (exam_id, subject_id)
select e.id, s.id from exams e, subjects s
where e.slug = 'scholarship' and s.slug in ('verbal-reasoning', 'quantitative-reasoning', 'logical-reasoning', 'mathematics', 'english');

insert into exam_subjects (exam_id, subject_id)
select e.id, s.id from exams e, subjects s
where e.slug = 'aptitude' and s.slug in ('verbal-reasoning', 'quantitative-reasoning', 'logical-reasoning', 'english', 'mathematics');

-- Postgraduate subjects
insert into exam_subjects (exam_id, subject_id)
select e.id, s.id from exams e, subjects s
where e.slug = 'postgraduate' and s.slug in ('verbal-reasoning', 'quantitative-reasoning', 'logical-reasoning', 'english', 'general-paper');
