"""Audit: rows per year per file + number-range sanity."""
import json
from collections import Counter

FILES = [
    'BIOLOGY-JAMB-Past-Questions',
    'CHEMISTRY-JAMB-Past-Questions',
    'COMMERCE-JAMB-Past-Questions',
    'CRK-JAMB-Past-Questions',
    'ECONOMICS-JAMB-Past-Questions',
    'GOVERNMENT-JAMB-Past-Questions',
    'MATHEMATICS-JAMB-Past-Questions-1983-2004',
    'Physics-JAMB-Past-Questions',
    'Principles-of-Accounts-JAMB-Past-Questions',
]
for stem in FILES:
    rows = json.load(open(f'content-folder/_parsed/{stem}.json', encoding='utf-8'))
    by_year = {}
    for r in rows:
        by_year.setdefault(r['year'], []).append(r['number'])
    over = {y: len(v) for y, v in by_year.items() if len(v) > 60}
    maxn = {y: max(v) for y, v in by_year.items()}
    bigmax = {y: m for y, m in maxn.items() if m > 60}
    print(f'{stem[:28]}: years={len(by_year)} rows={len(rows)} over60={over} maxOver60={bigmax}')
