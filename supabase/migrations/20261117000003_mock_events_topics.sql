-- Focused mocks: let the admin constrain an event to named topics and,
-- when they want a shorter, sharper paper, to set the question count
-- explicitly. Null on both columns keeps the full exam default (JAMB = 180,
-- others = their own default).

alter table mock_events
  add column if not exists topic_ids uuid[] null,
  add column if not exists question_count integer null
    check (question_count is null or (question_count >= 5 and question_count <= 500));

comment on column mock_events.topic_ids is
  'Topic ids the paper draws from. Null = the whole blueprint, same as an ordinary mock. When set, every subject draw is restricted to these topics.';

comment on column mock_events.question_count is
  'Overrides the exam default. Null = full exam paper. When set, the paper runs at exactly this length, drawn from the topic pool.';
