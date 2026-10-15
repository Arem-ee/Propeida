import json
import re

rows = json.load(open('content-folder/_work/econs-solve.json', encoding='utf-8'))
dump_ids = set(r['id'] for r in rows)
by_id = {r['id']: r for r in rows}
src = open('scripts/solve-econs1.mjs', encoding='utf-8').read()
pat = r"'([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'"
script_ids = set(re.findall(pat, src))
print('dump rows:', len(dump_ids), '| script ids:', len(script_ids))
missing = sorted(script_ids - dump_ids)
print('missing:', len(missing))
for i in missing:
    print('NOT IN DUMP:', i)
extra = sorted(dump_ids - script_ids)
print('dump rows untouched by script:', len(extra))
