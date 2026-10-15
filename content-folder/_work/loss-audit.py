"""Loss audit: per (file, year) — rows captured vs 50 expected, missing numbers."""
import json

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
grand_cap = 0
grand_exp = 0
for stem in FILES:
    rows = json.load(open(f'content-folder/_parsed/{stem}.json', encoding='utf-8'))
    by_year = {}
    for r in rows:
        by_year.setdefault(r['year'], set()).add(r['number'])
    cap = sum(len(v) for v in by_year.values())
    exp = len(by_year) * 50
    grand_cap += cap
    grand_exp += exp
    worst = sorted(by_year.items(), key=lambda kv: len(kv[1]))[:3]
    print(f'{stem[:28]}: captured={cap} expected~{exp} ({100 * cap // max(exp, 1)}%)')
    for y, nums in worst:
        missing = [n for n in range(1, 51) if n not in nums]
        print(f'    worst {y}: {len(nums)}/50 missing {len(missing)}: {missing[:18]}')
print(f'TOTAL captured={grand_cap} expected~{grand_exp} ({100 * grand_cap // grand_exp}%)')
