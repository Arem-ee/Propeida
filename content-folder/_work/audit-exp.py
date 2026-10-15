"""Integrity audit to file (console-safe)."""
import json

new = json.load(open('content-folder/_work/econs-now.json', encoding='utf-8'))
explained = [r for r in new if r.get('explanation')]
lines = [f'explained rows: {len(explained)}']
for r in explained:
    lines.append('====')
    lines.append(f"ID: {r['id']}")
    lines.append(f"Q: {r['question_text'][:130]} | key={r['correct_answer']}")
    lines.append(f"OPTS: {[(o['key'], o['text'][:45]) for o in r['options']]}")
    lines.append(f"EXP: {r['explanation'][:220]}")
    lines.append(f"NOTE: {(r.get('review_note') or '')[:150]}")
open('content-folder/_work/audit-exp.txt', 'w', encoding='utf-8').write('\n'.join(lines))
print('wrote audit-exp.txt')
