"""Recover phantom ids by content search; list untouched rows."""
import json
import re

old = json.load(open('content-folder/_work/econs-solve.json', encoding='utf-8'))
new = json.load(open('content-folder/_work/econs-now.json', encoding='utf-8'))
idmap = json.load(open('content-folder/_work/econs-idmap.json', encoding='utf-8'))
src = open('scripts/solve-econs1.mjs', encoding='utf-8').read()
pat = r"'([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'"
script_ids = set(re.findall(pat, src))

new_by_text = {r['question_text']: r for r in new}

probes = {
    'elastic-revenue': 'revenue accruing',
    'tax-burden': 'tax burden is borne',
    'ordinal': 'ordinal utility',
    'dimmu': 'explains why',
    'surplus120': 'consumer surplus is',
    'supply-shift': 'shift the supply',
    'es-gt-1': 'greater than one',
    'byproduct': 'by-product',
    'ni-tax': 'In national income accounting',
    'embargo': 'boost agricultural',
    'location': 'location of industries',
    'petrol-dep': 'petroleum products is',
    'shareholders': "limited liability company's",
    'agric-pol': 'agricultural policies',
    'machinery': 'machinery and equipment',
    'piechart': 'pie chart',
    'median-frag': 'The median of an odd-numbered',
    'to28': 'implement government',
    'unemp-money': 'job opportunities',
    'sierra': 'Sierra',
}
for label, needle in probes.items():
    hits = [r for r in new if needle.lower() in r['question_text'].lower()]
    print(label, '->', [(h['id'][:8], h['correct_answer'], h['question_text'][:60]) for h in hits])

print()
print('=== untouched rows (in script: no) ===')
for r in old:
    nid = idmap[r['id']]
    if nid not in script_ids:
        print(nid[:8], 'key=' + r['correct_answer'], '|', r['question_text'][:90])
        opts = ' / '.join(f"{o['key']}:{o['text'][:40]}" for o in r['options'])
        print('   ', opts)
