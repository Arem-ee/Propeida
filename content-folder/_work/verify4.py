"""Hash-based comparison — no display ambiguity."""
import hashlib
import json
import re

rows = json.load(open('content-folder/_work/econs-full.json', encoding='utf-8'))
dump_ids = set(r['id'] for r in rows)
src = open('scripts/solve-econs1.mjs', encoding='utf-8').read()
pat = r"'([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'"
script_ids = set(re.findall(pat, src))

dh = {hashlib.sha256(x.encode()).hexdigest()[:12]: x for x in dump_ids}
sh = {hashlib.sha256(x.encode()).hexdigest()[:12]: x for x in script_ids}
print('dump:', len(dh), 'script:', len(sh))
only_script = [h for h in sh if h not in dh]
print('script-only hashes:', len(only_script))
only_dump = [h for h in dh if h not in sh]
print('dump-only hashes:', len(only_dump))
# lengths of the underlying strings
lens = {}
for x in list(dump_ids) + list(script_ids):
    lens[len(x)] = lens.get(len(x), 0) + 1
print('string lengths:', lens)
