"""Inspect duplicate-number rows: variants or junk?"""
import json
from collections import Counter

rows = json.load(open('content-folder/_parsed/Physics-JAMB-Past-Questions.json', encoding='utf-8'))
by_yn = {}
for r in rows:
    by_yn.setdefault((r['year'], r['number']), []).append(r)
dups = {k: v for k, v in by_yn.items() if len(v) > 1}
print('dup groups:', len(dups))
shown = 0
for (y, n), group in sorted(dups.items()):
    if shown >= 4:
        break
    print(f'--- {y} Q{n} x{len(group)}')
    for r in group:
        print('   STEM:', r['text'][:100].replace('\n', ' / '))
        print('   OPTS:', sum(1 for k in 'ABCDE' if r['options'].get(k)), '| ans:', r['answer'])
    shown += 1
