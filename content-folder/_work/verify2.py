"""Definitive: every id referenced in solve-econs1.mjs vs live dump."""
import json
import re

rows = json.load(open('content-folder/_work/econs-full.json', encoding='utf-8'))
dump_ids = set(r['id'] for r in rows)
src = open('scripts/solve-econs1.mjs', encoding='utf-8').read()
pat = r"'([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'"
script_ids = set(re.findall(pat, src))
missing = sorted(script_ids - dump_ids)
print('dump:', len(dump_ids), 'script:', len(script_ids), 'missing:', len(missing))
for m in missing:
    print('MISSING:', m)
open('content-folder/_work/verify2.txt', 'w').write(f'dump={len(dump_ids)} script={len(script_ids)} missing={len(missing)}\n' + '\n'.join(missing))
