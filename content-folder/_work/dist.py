"""Per-year distribution to find mis-split sections."""
import json
from collections import Counter

for stem in ['CHEMISTRY-JAMB-Past-Questions', 'Physics-JAMB-Past-Questions']:
    rows = json.load(open(f'content-folder/_parsed/{stem}.json', encoding='utf-8'))
    c = Counter(r['year'] for r in rows)
    print(stem[:20])
    for y in sorted(c):
        print(f'  {y}: {c[y]}')
