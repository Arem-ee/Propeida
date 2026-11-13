-- Onboarding profile fields (compulsory + optional)
-- Captures exam target, subject combinations, acquisition channel,
-- study preferences, target score, and accessibility needs.

alter table profiles
  add column if not exists subject_combinations jsonb not null default '[]'::jsonb,
  add column if not exists intended_course text,
  add column if not exists exam_target text,                 -- 'jamb' | 'post-utme' | 'general'
  add column if not exists heard_about text,                 -- 'whatsapp' | 'friend' | 'school' | 'social' | 'other'
  add column if not exists study_time text,                  -- 'morning' | 'afternoon' | 'night' | 'flexible'
  add column if not exists target_score integer,
  add column if not exists accessibility_needs jsonb not null default '{}'::jsonb,
  add column if not exists subjects_pending boolean not null default false;

-- Allow authenticated users to update their own onboarding profile fields.
grant update (
  subject_combinations, intended_course, exam_target,
  heard_about, study_time, target_score,
  accessibility_needs, subjects_pending, onboarding_completed
)
  on table profiles to authenticated;
