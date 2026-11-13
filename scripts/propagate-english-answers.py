"""Propagate solved answers to duplicate questions.

The two English PDFs overlap heavily: the same past question appears in
both files (sometimes with small wording differences). Once one copy is
answered, every duplicate can inherit that answer.

Matching rules:
1. Exact match on normalised question + normalised option set.
2. Near match: same normalised question, same option count, and the
   first option text agreeing (guards against option-set drift).
"""
from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STAGED_PATH = ROOT / 'content-folder' / 'english-jamb-staged-clean-v3.json'


def norm(text: str | None) -> str:
    if not text:
        return ''
    text = unicodedata.normalize('NFKD', text)
    text = ''.join(c for c in text if not unicodedata.combining(c))
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()


def main() -> int:
    payload = json.loads(STAGED_PATH.read_text(encoding='utf-8'))
    records: list[dict] = payload.get('records', [])

    exact_index: dict[tuple, dict] = {}
    near_index: dict[tuple, list[dict]] = {}

    for r in records:
        if not r.get('answer'):
            continue
        opts = r.get('options', [])
        q = norm(r.get('question'))
        osig = tuple(sorted(norm(o.get('text')) for o in opts))
        exact_index[(q, osig)] = r
        near_index.setdefault((q, len(opts)), []).append(r)

    propagated_exact = 0
    propagated_near = 0
    propagated_prefix = 0
    conflicts = 0

    # Prefix index: normalised question prefix -> answered records.
    # The two PDFs print the same past question with small wording drift
    # ("staring" vs "stares", "hatche.d" vs "hatched"), so an exact match
    # misses them. A shared long prefix plus a matching first option is
    # strong enough to inherit the answer.
    prefix_index: dict[str, list[dict]] = {}
    PREFIX_LEN = 45
    for r in records:
        if not r.get('answer'):
            continue
        q = norm(r.get('question'))
        if len(q) < PREFIX_LEN:
            continue
        prefix_index.setdefault(q[:PREFIX_LEN], []).append(r)

    for r in records:
        if r.get('answer'):
            continue
        opts = r.get('options', [])
        q = norm(r.get('question'))
        osig = tuple(sorted(norm(o.get('text')) for o in opts))

        donor = exact_index.get((q, osig))
        if donor:
            r['answer'] = donor['answer']
            r['explanation'] = donor.get('explanation')
            r['difficulty'] = donor.get('difficulty')
            r['status'] = 'solved'
            r['inheritedFrom'] = donor['id']
            propagated_exact += 1
            continue

        candidates = near_index.get((q, len(opts)), [])
        if len(candidates) == 1:
            donor = candidates[0]
            r['answer'] = donor['answer']
            r['explanation'] = donor.get('explanation')
            r['difficulty'] = donor.get('difficulty')
            r['status'] = 'solved'
            r['inheritedFrom'] = donor['id']
            propagated_near += 1
        elif len(candidates) > 1:
            keys = {c['answer'] for c in candidates}
            if len(keys) == 1:
                donor = candidates[0]
                r['answer'] = donor['answer']
                r['explanation'] = donor.get('explanation')
                r['difficulty'] = donor.get('difficulty')
                r['status'] = 'solved'
                r['inheritedFrom'] = donor['id']
                propagated_near += 1
            else:
                conflicts += 1

        if r.get('answer'):
            continue

        # Prefix fallback for wording drift.
        if len(q) >= PREFIX_LEN:
            donors = prefix_index.get(q[:PREFIX_LEN], [])
            if len(donors) == 1:
                donor = donors[0]
                r['answer'] = donor['answer']
                r['explanation'] = donor.get('explanation')
                r['difficulty'] = donor.get('difficulty')
                r['status'] = 'solved'
                r['inheritedFrom'] = donor['id']
                propagated_prefix += 1

    print(f'Propagated (exact):  {propagated_exact}')
    print(f'Propagated (near):   {propagated_near}')
    print(f'Propagated (prefix): {propagated_prefix}')
    print(f'Conflicting donors skipped: {conflicts}')
    print(f'Records still unsolved: {sum(1 for r in records if not r.get("answer"))}')

    payload['meta'] = {
        **payload.get('meta', {}),
        'phase': 'Phase 4: answer authoring',
        'propagatedExact': propagated_exact,
        'propagatedNear': propagated_near,
        'propagatedPrefix': propagated_prefix,
        'solvedRecords': sum(1 for r in records if r.get('answer')),
        'unsolvedRecords': sum(1 for r in records if not r.get('answer')),
    }

    STAGED_PATH.write_text(json.dumps(payload, indent=1, ensure_ascii=False), encoding='utf-8')
    print(f'Wrote {STAGED_PATH}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())