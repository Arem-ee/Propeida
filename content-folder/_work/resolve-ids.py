"""Resolve solve-econs1.mjs old ids to current DB ids via exact text match,
fix known misattributions, and report coverage."""
import json
import re

old = json.load(open('content-folder/_work/econs-solve.json', encoding='utf-8'))
new = json.load(open('content-folder/_work/econs-now.json', encoding='utf-8'))
print('old rows:', len(old), '| new rows:', len(new))

new_by_text = {r['question_text']: r for r in new}
mapping = {}
unmatched = []
for r in old:
    hit = new_by_text.get(r['question_text'])
    if hit:
        mapping[r['id']] = hit['id']
    else:
        unmatched.append((r['id'], r['question_text'][:70]))
print('matched:', len(mapping), '| unmatched old:', len(unmatched))
for u in unmatched:
    print('  NO MATCH:', u)

src = open('scripts/solve-econs1.mjs', encoding='utf-8').read()
missing = []
for o, n in mapping.items():
    if o not in src:
        missing.append(o)
print('mapped ids absent from script (untouched rows):', len(missing))

# check which script ids have no mapping at all (phantoms)
pat = r"'([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'"
script_ids = set(re.findall(pat, src))
new_ids = set(r['id'] for r in new)
phantoms = sorted(script_ids - new_ids - set(mapping.keys()))
print('phantom script ids (typos, must fix):', len(phantoms))
for p in phantoms:
    print('  PHANTOM:', p)

json.dump(mapping, open('content-folder/_work/econs-idmap.json', 'w'))
