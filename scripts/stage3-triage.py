"""Stage-3 triage: strict-gate parsed keyless rows into solvable candidates.
Usage: python scripts/stage3-triage.py <parsed.json> <out-prefix> [limit]
Writes <out-prefix>-candidates.json + <out-prefix>-triage.txt
"""
import json
import re
import sys

src = sys.argv[1]
prefix = sys.argv[2]
limit = int(sys.argv[3]) if len(sys.argv) > 3 else 60
start = int(sys.argv[4]) if len(sys.argv) > 4 else 0

rows = json.load(open(src, encoding='utf-8'))


def rejects(r):
    reasons = []
    stem = r['text']
    if len(stem) < 25:
        reasons.append('short stem')
    if re.search(r'(^|\s)\d{1,3}\.\s', stem):
        reasons.append('fused number in stem')
    if '[�]' in r['text']:
        reasons.append('unreadable chars')
    for k in 'ABCD':
        o = (r['options'].get(k) or '').strip()
        if len(o) < 2:
            reasons.append(f'option {k} missing')
        if re.search(r'(^|\s)\d{1,3}\.\s', o):
            reasons.append(f'fused number in {k}')
        if re.search(r'\.\s+[A-Z][a-z]', o):
            reasons.append(f'runon in {k}')
    return reasons


cands = []
seen = 0
for r in rows:
    if r.get('needs_figure'):
        continue
    if not all((r['options'].get(k) or '').strip() for k in 'ABCD'):
        continue
    rs = rejects(r)
    if not rs:
        if seen >= start:
            cands.append(r)
        seen += 1
    if len(cands) >= limit:
        break

print(f'candidates: {len(cands)} (from {len(rows)} parsed)')
json.dump(cands, open(f'{prefix}-candidates.json', 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
lines = []
for i, r in enumerate(cands):
    lines.append(f"==== [{i}] {r['year']} Q{r['number']}")
    lines.append('Q: ' + r['text'][:200].replace('\n', ' / '))
    for k in 'ABCD':
        lines.append(f"  {k}) {r['options'][k][:80]}")
open(f'{prefix}-triage.txt', 'w', encoding='utf-8').write('\n'.join(lines))
print(f'wrote {prefix}-triage.txt')
