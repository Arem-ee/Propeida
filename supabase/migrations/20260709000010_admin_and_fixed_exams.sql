-- Part A: Admin flag on profiles
alter table profiles add column is_admin boolean not null default false;

-- Part B: Subject selection mode for exams
create type subject_selection_mode as enum ('user_selects', 'fixed');
alter table exams add column subject_selection_mode subject_selection_mode not null default 'user_selects';

-- Create Current Affairs subject (idempotent)
insert into subjects (name, slug)
select 'Current Affairs', 'current-affairs'
where not exists (select 1 from subjects where slug = 'current-affairs');

-- Link Post-UTME to its fixed subjects: English, Mathematics, Current Affairs
insert into exam_subjects (exam_id, subject_id)
select e.id, s.id
from exams e, subjects s
where e.slug = 'post-utme'
  and s.slug in ('english', 'mathematics', 'current-affairs')
  and not exists (
    select 1 from exam_subjects es
    where es.exam_id = e.id and es.subject_id = s.id
  );

-- Set Post-UTME to fixed subject selection mode
update exams set subject_selection_mode = 'fixed' where slug = 'post-utme';

-- Subject weighting for Post-UTME mock mode (placeholder: roughly even split of 50)
-- Update this once the real distribution is confirmed
insert into app_config (key, value) values
  ('subject_weighting', '{
    "post-utme": {"english": 17, "mathematics": 17, "current-affairs": 16}
  }'::jsonb)
on conflict (key) do update set value = excluded.value, updated_at = now();
