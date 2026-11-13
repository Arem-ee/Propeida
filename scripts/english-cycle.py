"""Unified English staged inventory cycle: quarantine + merge in a single write.

Usage: python scripts/english-cycle.py <answers.json> [id1,id2,...] [reason]
Applies optional quarantines first, then merges answers (with optional topic
override), updates records + meta, writes the staged file exactly once.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STAGED_PATH = ROOT / 'content-folder' / 'english-jamb-staged-clean-v3.json'

answers_path = Path(sys.argv[1])
q_ids = [x for x in (sys.argv[2] if len(sys.argv) > 2 else '').split(',') if x]
quarantine_reason = sys.argv[3] if len(sys.argv) > 3 else 'parser-mangled, ambiguous or unverifiable passage item; excluded pending manual review'

answers = json.loads(answers_path.read_text(encoding='utf-8'))

payload = json.loads(STAGED_PATH.read_text(encoding='utf-8'))
records = payload.get('records', [])

q = 0
for r in records:
    if r['id'] in q_ids:
        r['quarantine'] = True
        r['quarantineReason'] = quarantine_reason
        q += 1

answer_map = {a['id']: a for a in answers}
updated = retopiced = 0
for r in records:
    a = answer_map.get(r['id'])
    if a:
        r['answer'] = a.get('answer')
        r['explanation'] = a.get('explanation')
        if a.get('difficulty'):
            r['difficulty'] = a.get('difficulty')
        r['status'] = 'solved'
        r.pop('quarantine', None)
        r.pop('quarantineReason', None)
        updated += 1
        if a.get('topic') and a['topic'] != r.get('topic'):
            r['previousTopic'] = r.get('topic')
            r['topic'] = a['topic']
            retopiced += 1

meta = payload.get('meta', {})
meta['phase'] = 'Phase 4: answer authoring'
meta['solvedRecords'] = sum(1 for r in records if r.get('answer'))
meta['unsolvedRecords'] = sum(1 for r in records if not r.get('answer'))
meta['quarantined'] = sum(1 for r in records if r.get('quarantine'))
payload['meta'] = meta

STAGED_PATH.write_text(json.dumps(payload, indent=1, ensure_ascii=False), encoding='utf-8')
print(f'quarantined {q} | updated {updated} | retopiced {retopiced}')
print(f"solved {meta['solvedRecords']} / unsolved {meta['unsolvedRecords']} / quarantined {meta['quarantined']}")
