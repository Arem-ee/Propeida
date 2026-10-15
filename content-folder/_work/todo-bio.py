"""List Bio drafts compactly for triage (to file, utf-8)."""
import json

rows = json.load(open('content-folder/_work/bio-full.json', encoding='utf-8'))
out = [f'bio drafts: {len(rows)}']
for r in rows:
    out.append('==== ' + r['id'] + ' | key=' + r['correct_answer'] + ' | ' + r['source'].split('(')[0].strip())
    out.append('Q: ' + r['question_text'][:180].replace('\n', ' / '))
    for o in r['options']:
        out.append(f"  {o['key']}) {o['text'][:75]}")
    if r.get('review_note'):
        out.append('  NOTE: ' + r['review_note'][:150])
    if r.get('explanation'):
        out.append('  EXP: ' + r['explanation'][:100])
open('content-folder/_work/todo-bio.txt', 'w', encoding='utf-8').write('\n'.join(out))
print('wrote todo-bio.txt')
