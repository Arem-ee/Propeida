-- Fix JAMB mock exam configuration
-- Old values were accidentally set to 50 questions / 1800s (same as Post-UTME)
-- JAMB UTME is 180 questions over 2 hours with fixed per-role subject breakdown

update app_config
set value = jsonb_set(
  value::jsonb,
  '{jamb}',
  '{"question_count": 180, "time_limit_seconds": 7200, "subject_roles": {"english": 60, "elective": 40}}'::jsonb
)
where key = 'mock_defaults';
