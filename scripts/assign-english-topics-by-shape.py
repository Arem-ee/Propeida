"""Phase 3d: assign topics to records that failed keyword scoring.

The keyword scorer left 3,306 records unmapped. They fall into recognisable
shapes, so they are classified from their option grammar:

  all options are prepositions  -> clause-and-sentence-patterns
  all options are verb forms    -> mood-tense-and-aspect
  all options are pronouns      -> word-classes-and-functions
  all options are comparatives  -> degrees-of-comparison
  question asks a meaning       -> synonyms
  has a passage, no other signal-> comprehension-question-skills
  otherwise (a phrase in a sentence) -> ordinary-figurative-idiomatic-usage

Each assignment records how it was reached, so a later review pass can
audit any of them.
"""
from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STAGED_PATH = ROOT / 'content-folder' / 'english-jamb-staged-clean-v3.json'

PREPOSITIONS = {
    'at', 'on', 'in', 'by', 'for', 'from', 'with', 'to', 'of', 'about', 'as',
    'before', 'since', 'when', 'until', 'after', 'during', 'through', 'over',
    'under', 'above', 'below', 'between', 'among', 'against', 'towards',
    'toward', 'into', 'onto', 'upon', 'off', 'out', 'up', 'down', 'across',
    'along', 'around', 'behind', 'beyond', 'despite', 'except', 'like',
    'near', 'per', 'regarding', 'round', 'throughout', 'versus', 'via',
    'within', 'without', 'beside', 'beneath', 'besides', 'worth',
}

VERB_FORMS = {
    'is', 'are', 'was', 'were', 'am', 'be', 'been', 'being', 'has', 'have',
    'had', 'do', 'does', 'did', 'shall', 'will', 'would', 'should', 'could',
    'may', 'might', 'must', 'can', 'ought',
}

PRONOUNS = {
    'i', 'me', 'my', 'mine', 'myself', 'you', 'your', 'yours', 'yourself',
    'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
    'herself', 'it', 'its', 'itself', 'we', 'us', 'our', 'ours',
    'ourselves', 'they', 'them', 'their', 'theirs', 'themselves',
    'one', 'ones', 'somebody', 'anybody', 'everyone', 'no one', 'none',
}

DETERMINERS = {
    'a', 'an', 'the', 'this', 'that', 'these', 'those', 'his', 'her', 'its',
    'their', 'my', 'your', 'our', 'some', 'any', 'no', 'each', 'every',
}

MEANING_VERBS = re.compile(
    r'\b(means|implies|signifies|denotes|connotes|stands for|represents|'
    r'is called|can be described as|convey|interprets|refers to)\b',
    re.IGNORECASE,
)

COMPREHENSION_MARKERS = re.compile(
    r'\b(passage|author|writer|according to|main idea|main theme|main point|'
    r'it can be inferred|it can be deduced|the evidence|the reason|'
    r'the statement|the passage|the writer|the author|according)\b',
    re.IGNORECASE,
)


def clean_option(text: str) -> str:
    return re.sub(r'\s+', ' ', text or '').strip().lower()


def classify(record: dict) -> tuple[str | None, str]:
    question = (record.get('question') or '').strip()
    options = record.get('options') or []
    opts = [clean_option(o.get('text')) for o in options if o.get('text')]

    if not opts:
        return None, 'no options'

    single_word = all(len(o.split()) == 1 for o in opts)

    if single_word and all(o in PREPOSITIONS for o in opts):
        return 'clause-and-sentence-patterns', 'options are all prepositions'
    if single_word and all(o in PRONOUNS for o in opts):
        return 'word-classes-and-functions', 'options are all pronouns'
    if single_word and all(o in DETERMINERS for o in opts):
        return 'word-classes-and-functions', 'options are all determiners'
    if single_word and all(o in VERB_FORMS for o in opts):
        return 'mood-tense-and-aspect', 'options are all verb forms'

    # Verb forms with endings (-ed, -ing, -s).
    verb_ending = ('ed', 'ing', 'es')
    if all(
        o in VERB_FORMS or (len(o) > 3 and o.endswith(verb_ending))
        for o in opts
    ):
        return 'mood-tense-and-aspect', 'options look like verb forms'

    # Comparatives and superlatives.
    comparative = (
        'more', 'most', 'less', 'least', 'better', 'best', 'worse', 'worst',
        'greater', 'greatest', 'higher', 'highest', 'lower', 'lowest',
        'bigger', 'biggest', 'smaller', 'smallest', 'elder', 'eldest',
    )
    if single_word and any(o in comparative for o in opts):
        return 'degrees-of-comparison', 'options include comparatives'

    if MEANING_VERBS.search(question):
        return 'synonyms', 'question asks for meaning'

    passage = (record.get('passage') or '').strip()
    if passage and COMPREHENSION_MARKERS.search(question):
        return 'comprehension-question-skills', 'question about a passage'

    if '....' in question or '...' in question:
        return 'clause-and-sentence-patterns', 'sentence completion gap'

    return 'ordinary-figurative-idiomatic-usage', 'phrase in context'


def main() -> int:
    payload = json.loads(STAGED_PATH.read_text(encoding='utf-8'))
    records: list[dict] = payload.get('records', [])

    assigned = 0
    reasons: dict[str, int] = {}

    for r in records:
        if r.get('topic'):
            continue
        topic, reason = classify(r)
        if not topic:
            continue
        r['topic'] = topic
        r['topicAssignedBy'] = reason
        assigned += 1
        reasons[reason] = reasons.get(reason, 0) + 1

    print(f'Assigned topics to {assigned} records')
    print('By reason:')
    for reason, count in sorted(reasons.items(), key=lambda x: -x[1]):
        print(f'  {count:>5}  {reason}')

    topics: dict[str, int] = {}
    for r in records:
        if r.get('topic'):
            topics[r['topic']] = topics.get(r['topic'], 0) + 1
    print('\nTopic distribution:')
    for t, c in sorted(topics.items(), key=lambda x: -x[1]):
        print(f'  {c:>5}  {t}')

    payload['meta'] = {
        **payload.get('meta', {}),
        'phase': 'Phase 4: answer authoring',
        'topicAssignedByShape': assigned,
        'topicAssignmentReasons': reasons,
        'topicCounts': topics,
        'solvedRecords': sum(1 for r in records if r.get('answer')),
        'unsolvedRecords': sum(1 for r in records if not r.get('answer')),
    }

    STAGED_PATH.write_text(json.dumps(payload, indent=1, ensure_ascii=False), encoding='utf-8')
    print(f'\nWrote {STAGED_PATH}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())