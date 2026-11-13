"""Phase 3: Topic Mapping for English questions.

Maps each question to its syllabus topic using keyword heuristics.
Questions that can't be confidently mapped are flagged for manual review.

English syllabus topics (from structured JSON):
- comprehension-question-skills
- summary-writing
- passage-description
- passage-narration
- passage-exposition
- passage-argumentation
- cloze-test-technique
- synonyms
- antonyms
- word-classes-and-functions
- mood-tense-and-aspect
- number-agreement-and-concord
- degrees-of-comparison
- question-tags
- mechanics-spelling-and-punctuation
- ordinary-figurative-idiomatic-usage
- vowels-monothongs-diphthongs-triphthongs
- consonants-and-clusters
- rhymes-and-homophones
- word-stress
- emphatic-stress
"""
from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IN_PATH = ROOT / 'content-folder' / 'english-jamb-staged-clean.json'
OUT_PATH = ROOT / 'content-folder' / 'english-jamb-staged-topicmapped.json'

# Topic mapping rules: (topic_slug, [patterns])
# Patterns are checked against normalized question text; first match wins
TOPIC_RULES = [
    # Comprehension - questions about a passage
    ('comprehension-question-skills', [
        r'read the passage', r'passage.*means', r'as used in the passage',
        r'in the passage', r'according to the passage', r'the writer',
        r'the author', r'from the passage', r'it can be inferred',
        r'it can be deduced', r'the expression.*means', r'the word.*means',
        r'main idea', r'main theme', r'main point',
    ]),
    # Summary-writing
    ('summary-writing', [
        r'summary', r'summarise', r'summarize',
    ]),
    # Passage-description
    ('passage-description', [
        r'description', r'descriptive',
    ]),
    # Passage-narration
    ('passage-narration', [
        r'narration', r'narrative', r'story',
    ]),
    # Passage-exposition
    ('passage-exposition', [
        r'exposition', r'expository',
    ]),
    # Passage-argumentation
    ('passage-argumentation', [
        r'argumentation', r'argument', r'persuasion',
    ]),
    # Cloze test
    ('cloze-test-technique', [
        r'cloze', r'gap', r'blank', r'fill.*gap', r'fill.*blank',
    ]),
    # Synonyms - HIGH PRIORITY
    ('synonyms', [
        r'nearest in meaning', r'similar in meaning', r'means the same',
        r'synonym', r'nearest meaning', r'closest in meaning',
        r'means the same as', r'closest in meaning to',
        r'means same as',
        r'\'[^\']+\'.*means',   # word in quotes means
        r'"[^"]+".*means',     # word in double quotes means
        r'\'[^\']+\' \(line \d+\) means',  # 'word' (line N) means
    ]),
    # Antonyms - HIGH PRIORITY
    ('antonyms', [
        r'opposite in meaning', r'opposite meaning', r'antonym',
        r'most nearly opposite', r'opposite of',
    ]),
    # Antonyms - HIGH PRIORITY
    ('antonyms', [
        r'opposite in meaning', r'opposite meaning', r'antonym',
        r'most nearly opposite', r'opposite of',
    ]),
    # Word classes
    ('word-classes-and-functions', [
        r'part of speech', r'noun', r'verb', r'adjective', r'adverb',
        r'pronoun', r'preposition', r'conjunction', r'interjection',
        r'word class', r'parts of speech',
    ]),
    # Mood, tense, aspect
    ('mood-tense-and-aspect', [
        r'tense', r'mood', r'aspect', r'present tense', r'past tense',
        r'future tense', r'perfect', r'continuous', r'simple past',
        r'simple present', r'simple future',
    ]),
    # Concord
    ('number-agreement-and-concord', [
        r'agreement', r'concord', r'subject.verb', r'singular.*plural',
        r'plural.*singular', r'agrees with',
    ]),
    # Degrees of comparison
    ('degrees-of-comparison', [
        r'comparative', r'superlative', r'more.*than', r'most.*',
        r'positive degree', r'comparative degree', r'superlative degree',
    ]),
    # Question tags
    ('question-tags', [
        r'question tag', r'tag question', r'isn\'t it', r'can\'t they',
        r'don\'t you', r'haven\'t they', r'won\'t he', r'shall we',
    ]),
    # Mechanics
    ('mechanics-spelling-and-punctuation', [
        r'spelling', r'punctuation', r'capitalization', r'capital letter',
        r'full stop', r'comma', r'semicolon', r'apostrophe',
    ]),
    # Idioms/figurative
    ('ordinary-figurative-idiomatic-usage', [
        r'idiom', r'idiomatic', r'figurative', r'metaphor', r'simile',
        r'personification', r'hyperbole',
        r'heart in his mouth', r'fell through', r'broke even',
        r'put through', r'neck and neck', r'heart of stone',
        r'deserted by', r'ran through', r'turned down',
        r'cash in', r'heart of stone', r'put the recruits through',
    ]),
    # Vowels
    ('vowels-monothongs-diphthongs-triphthongs', [
        r'vowel sound', r'monothong', r'diphthong', r'triphthong',
        r'same vowel sound', r'vowel.*sound',
    ]),
    # Consonants
    ('consonants-and-clusters', [
        r'consonant sound', r'consonant cluster',
    ]),
    # Rhymes
    ('rhymes-and-homophones', [
        r'rhymes with', r'rhymes', r'homophone',
    ]),
    # Word stress
    ('word-stress', [
        r'word stress', r'stress pattern', r'stressed syllable',
        r'primary stress', r'secondary stress',
    ]),
    # Emphatic stress
    ('emphatic-stress', [
        r'emphatic stress', r'emphas.*word', r'capital.*letter',
    ]),
]


def map_topic(question: str) -> str | None:
    """Map a question to its topic using keyword patterns."""
    q_lower = question.lower()
    for topic, patterns in TOPIC_RULES:
        for pat in patterns:
            if re.search(pat, q_lower):
                return topic
    return None


def main() -> int:
    payload = json.loads(IN_PATH.read_text(encoding='utf-8'))
    records: list[dict] = payload.get('records', [])
    print(f'Input records: {len(records)}')

    mapped = 0
    unmapped = 0
    topic_counts: dict[str, int] = {}

    for r in records:
        q = r.get('question', '')
        topic = map_topic(q)
        r['topic'] = topic
        if topic:
            mapped += 1
            topic_counts[topic] = topic_counts.get(topic, 0) + 1
        else:
            unmapped += 1

    print(f'Mapped: {mapped}')
    print(f'Unmapped: {unmapped}')
    print(f'\\nTopic distribution:')
    for t, c in sorted(topic_counts.items(), key=lambda x: -x[1]):
        print(f'  {t}: {c}')

    payload['meta'] = {
        **payload.get('meta', {}),
        'phase': 'Phase 3: topic mapping',
        'topicMappedAt': datetime.now(timezone.utc).isoformat(),
        'mappedRecords': mapped,
        'unmappedRecords': unmapped,
        'topicCounts': topic_counts,
    }

    OUT_PATH.write_text(json.dumps(payload, indent=1, ensure_ascii=False), encoding='utf-8')
    print(f'\\nWrote {OUT_PATH} ({len(records)} records)')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
