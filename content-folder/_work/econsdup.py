"""Check banked Econs rows against dup-number groups."""
import json
from collections import Counter

rows = json.load(open('content-folder/_parsed/JAMB-Economics-Past-Questions-and-Answers.json', encoding='utf-8'))
banked = json.load(open('content-folder/_work/econs-bank.json', encoding='utf-8'))
banked_texts = set(b['question_text'] for b in banked)

by_yn = {}
for r in rows:
    by_yn.setdefault((r['year'], r['number']), []).append(r)
dups = {k: v for k, v in by_yn.items() if len(v) > 1}
print('dup groups:', len(dups))
for (y, n), group in dups.items():
    banked_in_group = [r for r in group if r['text'] in banked_texts]
    print(f'{y} Q{n}: {len(group)} variants, {len(banked_in_group)} banked')
    for r in group:
        print('   banked' if r['text'] in banked_texts else '   unbanked', '| ans:', r['answer'], '|', r['text'][:80].replace('\n', ' / '))
