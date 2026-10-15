"""True count: global (year, number) dedupe + junk removal, per file."""
import json
import re

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
grand_raw = 0
grand_clean = 0
for stem in FILES:
    rows = json.load(open(f'content-folder/_parsed/{stem}.json', encoding='utf-8'))
    grand_raw += len(rows)
    seen = set()
    dupes = 0
    junk = 0
    clean = []
    for r in rows:
        key = (r['year'], r['number'])
        stem_text = re.sub(r'^\[Use the data below\]\n.*?\n\[Question\]\n', '', r['text'], flags=re.S)
        stem_text = re.sub(r'^\[Based on: [^\]]+\]\n', '', stem_text)
        # junk: absurd question numbers (real papers max ~60) or tiny stems
        if r['number'] > 60 or len(stem_text.strip()) < 15:
            junk += 1
            continue
        if key in seen:
            dupes += 1
            continue
        seen.add(key)
        clean.append(r)
    grand_clean += len(clean)
    print(f'{stem[:30]}: raw={len(rows)} dupes={dupes} junk={junk} clean={len(clean)}')
print(f'TOTAL raw={grand_raw} clean={grand_clean}')
