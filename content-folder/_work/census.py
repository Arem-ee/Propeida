"""Census of the 9 question booklets."""
import json

FILES = {
    'BIOLOGY-JAMB-Past-Questions': 'Biology',
    'CHEMISTRY-JAMB-Past-Questions': 'Chemistry',
    'COMMERCE-JAMB-Past-Questions': 'Commerce',
    'CRK-JAMB-Past-Questions': 'CRK',
    'ECONOMICS-JAMB-Past-Questions': 'Economics',
    'GOVERNMENT-JAMB-Past-Questions': 'Government',
    'MATHEMATICS-JAMB-Past-Questions-1983-2004': 'Maths',
    'Physics-JAMB-Past-Questions': 'Physics',
    'Principles-of-Accounts-JAMB-Past-Questions': 'Accounts',
}
PAGES = {
    'Biology': 53, 'Chemistry': 70, 'Commerce': 29, 'CRK': 59,
    'Economics': 70, 'Government': 56, 'Maths': 64, 'Physics': 97,
    'Accounts': 38,
}
total_q = 0
for stem, label in FILES.items():
    rows = json.load(open(f'content-folder/_parsed/{stem}.json', encoding='utf-8'))
    yrs = sorted(set(r['year'] for r in rows))
    full = [r for r in rows if all((r['options'].get(k) or '').strip() for k in 'ABCD')]
    print(f'{label}: {PAGES[label]} pages | {len(rows)} parsed | {len(full)} with 4 options | years {yrs[0]}-{yrs[-1]} ({len(yrs)} yrs)')
    total_q += len(rows)
print('TOTAL parsed:', total_q)
