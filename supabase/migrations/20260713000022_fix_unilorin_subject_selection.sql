-- Fix subject_selection_mode: migration 10 targeted slug='post-utme' but the
-- exam was later renamed to 'unilorin-post-utme', so it stayed 'user_selects'.
-- Also ensure any other institution-specific post-utme exams are set to 'fixed'.

update exams
set subject_selection_mode = 'fixed'
where slug in ('unilorin-post-utme');

-- Link Unilorin Post-UTME to its fixed subjects if not already linked
insert into exam_subjects (exam_id, subject_id)
select e.id, s.id
from exams e, subjects s
where e.slug = 'unilorin-post-utme'
  and s.slug in ('english', 'mathematics', 'current-affairs')
  and not exists (
    select 1 from exam_subjects es
    where es.exam_id = e.id and es.subject_id = s.id
  );

-- Fix subject weighting key name too (was 'post-utme', should match slug)
update app_config
set value = value || '{"unilorin-post-utme": {"english": 17, "mathematics": 17, "current-affairs": 16}}'::jsonb
where key = 'subject_weighting';
