-- Unilorin Post-UTME mock format updated to confirmed real-candidate info:
-- 100 questions / 60 minutes (was 50 questions / 30 minutes).
-- Subject weighting scaled proportionally (17/17/16 -> 34/34/32); totals
-- are confirmed, per-subject split remains an estimate.

update app_config
set value = value || jsonb_build_object(
  'unilorin-post-utme', jsonb_build_object(
    'question_count', 100,
    'time_limit_seconds', 3600
  )
)
where key = 'mock_defaults';

update app_config
set value = jsonb_build_object(
  'unilorin-post-utme', jsonb_build_object(
    'english', 34,
    'mathematics', 34,
    'current-affairs', 32
  )
)
where key = 'subject_weighting';
