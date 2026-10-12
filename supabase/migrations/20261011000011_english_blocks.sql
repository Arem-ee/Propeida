-- English depth: two new block types for the subject patterns.
-- minimal_pair: two sentences side by side; pick/rebuild, then rule +
-- counterexample. sentence_rebuild: reorder/fix a broken sentence.
-- Shapes (validated in API):
-- minimal_pair: { pair: [string, string], correctIndex: 0|1, rule, counterexample }
-- sentence_rebuild: { prompt, answer, rule }

alter table lesson_blocks drop constraint if exists lesson_blocks_block_type_check;

alter table lesson_blocks add constraint lesson_blocks_block_type_check
  check (block_type in (
    'intro', 'text', 'image_explainer', 'audio_explainer', 'worked_example',
    'guided_question', 'independent_question', 'reflection', 'vocabulary_card',
    'passage', 'diagram', 'callout', 'recap', 'minimal_pair', 'sentence_rebuild'
  ));
