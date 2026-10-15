"""Compare exact code points: script id vs dump id."""
import json
import re

rows = json.load(open('content-folder/_work/econs-full.json', encoding='utf-8'))
dump_ids = set(r['id'] for r in rows)
src = open('scripts/solve-econs1.mjs', encoding='utf-8').read()
pat = r"'([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'"
script_ids = set(re.findall(pat, src))

target = '714051ab'
s = next(x for x in script_ids if x.startswith(target))
d = next(x for x in dump_ids if x.startswith(target))
print('script:', repr(s))
print('dump:  ', repr(d))
print('equal:', s == d)
for i, (a, b) in enumerate(zip(s, d)):
    if a != b:
        print(f'first diff at {i}: script U+{ord(a):04X} vs dump U+{ord(b):04X}')
        break
