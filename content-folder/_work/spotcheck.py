"""Spot-checks: Commerce 1994 count, Physics 1988 high numbers, CRK 1989 count."""
import json

rows = json.load(open('content-folder/_parsed/COMMERCE-JAMB-Past-Questions.json', encoding='utf-8'))
y94 = [r for r in rows if r['year'] == '1994']
print('Commerce 1994 rows:', len(y94), '| numbers:', sorted(r['number'] for r in y94)[:60])

rows = json.load(open('content-folder/_parsed/Physics-JAMB-Past-Questions.json', encoding='utf-8'))
y88 = [r for r in rows if r['year'] == '1988']
print('Physics 1988 rows:', len(y88), '| max number:', max(r['number'] for r in y88))
big = [r for r in y88 if r['number'] > 60]
for r in big[:4]:
    print('  Q' + str(r['number']) + ':', r['text'][:100])

rows = json.load(open('content-folder/_parsed/CRK-JAMB-Past-Questions.json', encoding='utf-8'))
y89 = [r for r in rows if r['year'] == '1989']
print('CRK 1989 rows:', len(y89))
from collections import Counter
print('dup numbers:', [k for k, v in Counter(r['number'] for r in y89).items() if v > 1])
