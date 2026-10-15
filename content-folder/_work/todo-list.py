"""List unexplained drafts compactly for triage (to file, utf-8)."""
import json

rows = json.load(open('content-folder/_work/econs-full.json', encoding='utf-8'))
todo = [r for r in rows if not r.get('explanation')]
out = [f'to triage: {len(todo)}']
for r in todo:
    out.append('==== ' + r['id'] + ' | key=' + r['correct_answer'] + ' | ' + r['source'].split('(')[0].strip())
    out.append('Q: ' + r['question_text'][:180].replace('\n', ' / '))
    for o in r['options']:
        out.append(f"  {o['key']}) {o['text'][:75]}")
    if r.get('review_note'):
        out.append('  NOTE: ' + r['review_note'][:150])
open('content-folder/_work/todo-econs.txt', 'w', encoding='utf-8').write('\n'.join(out))
print('wrote todo-econs.txt')
