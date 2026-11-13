"""Merge solved answers into the English staged inventory.

Reads answer records (id, answer, explanation, difficulty) and updates
the staged inventory. Unsolved questions remain with answer=null.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STAGED_PATH = ROOT / 'content-folder' / 'english-jamb-staged-clean-v3.json'
ANSWERS_PATH = Path(sys.argv[1]) if len(sys.argv) > 1 else None

if not ANSWERS_PATH or not ANSWERS_PATH.exists():
    print(f'Usage: python scripts/merge-english-answers.py <answers.json>')
    sys.exit(1)

payload = json.loads(STAGED_PATH.read_text(encoding='utf-8'))
records: list[dict] = payload.get('records', [])
answers: list[dict] = json.loads(ANSWERS_PATH.read_text(encoding='utf-8'))

# Build lookup by id
answer_map = {a['id']: a for a in answers}

updated = 0
retopiced = 0
for r in records:
    a = answer_map.get(r['id'])
    if a:
        r['answer'] = a.get('answer')
        r['explanation'] = a.get('explanation')
        if a.get('difficulty'):
            r['difficulty'] = a.get('difficulty')
        r['status'] = 'solved'
        updated += 1
        # A topic override lets a batch correct a mis-assigned topic
        # (preposition items sitting under the tense bucket, for example).
        if a.get('topic') and a['topic'] != r.get('topic'):
            r['previousTopic'] = r.get('topic')
            r['topic'] = a['topic']
            retopiced += 1

print(f'Updated {updated} records with answers')
print(f'Retopics applied: {retopiced}')
print(f'Records still unsolved: {sum(1 for r in records if not r.get("answer"))}')

payload['meta'] = {
    **payload.get('meta', {}),
    'phase': 'Phase 4: answer authoring',
    'solvedRecords': updated,
    'unsolvedRecords': sum(1 for r in records if not r.get('answer')),
}

STAGED_PATH.write_text(json.dumps(payload, indent=1, ensure_ascii=False), encoding='utf-8')
print(f'Wrote {STAGED_PATH}')