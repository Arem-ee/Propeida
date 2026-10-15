"""Audit comacc solutions: commerce stems with accounts answers."""
import json

sols = json.load(open('content-folder/_work/comacc-solved1.json', encoding='utf-8'))
out = []
for i, s in enumerate(sols):
    if s['source'].startswith('COMMERCE'):
        out.append(f"{i} | {s['text'][:60]} => {s['answer']} | {s['explanation'][:60]}")
open('content-folder/_work/comacc-audit.txt', 'w', encoding='utf-8').write('\n'.join(out))
print('rows:', len(out))
