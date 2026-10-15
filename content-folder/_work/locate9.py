"""Locate the 9 ambiguous rows in the live DB by content."""
import json

rows = json.load(open('content-folder/_work/econs-full.json', encoding='utf-8'))
needles = {
    'tax-burden': 'tax burden',
    'ordinal': 'ordinal utility',
    'dimmu': 'diminishing marginal',
    'elastic-rev': 'revenue accruing',
    'surplus120': 'spend 120k',
    'supply-shift': 'shift the supply',
    'es-gt-1': 'greater than one',
    'byproduct': 'by-product',
    'elastic-firms': 'to be elastic when firms',
}
for label, n in needles.items():
    hits = [r for r in rows if n in r['question_text'].lower() or any(n in o['text'].lower() for o in r['options'])]
    for h in hits:
        print(label, '|', h['id'][:8], '| key=' + h['correct_answer'], '| exp=', 'YES' if h.get('explanation') else 'no', '| note=', (h.get('review_note') or '')[:60])
