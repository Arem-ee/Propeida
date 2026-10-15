"""Show exact code-point differences for one pair."""
import json
import re

rows = json.load(open('content-folder/_work/econs-full.json', encoding='utf-8'))
dump_ids = set(r['id'] for r in rows)
src = open('scripts/solve-econs1.mjs', encoding='utf-8').read()
pat = r"'([0-9a-f\u2010-\u2015\u2212\uFF0D-]{8}-[0-9a-f\u2010-\u2015\u2212\uFF0D-]{4}-[0-9a-f\u2010-\u2015\u2212\uFF0D-]{4}-[0-9a-f\u2010-\u2015\u2212\uFF0D-]{4}-[0-9a-f\u2010-\u2015\u2212\uFF0D-]{12})'"
allq = re.findall(r"'([^']{36})'", src)
cands = [x for x in allq if x.startswith('714051ab') or x.startswith('714051a')]
print('script candidates starting 714051a:', [repr(x) for x in cands])
for x in cands:
    print([hex(ord(c)) for c in x])
d = next(x for x in dump_ids if x.startswith('714051ab'))
print('dump:', repr(d))
print([hex(ord(c)) for c in d])
