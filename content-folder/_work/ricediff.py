"""Diff the rice row: banked vs fresh parse."""
import json

banked = json.load(open('content-folder/_work/econs-bank.json', encoding='utf-8'))
fresh = json.load(open('content-folder/_parsed/JAMB-Economics-Past-Questions-and-Answers.json', encoding='utf-8'))
for b in banked:
    if b['question_text'].startswith('If the quantity of rice'):
        print('BANKED:', repr(b['question_text'][:300]))
        break
for r in fresh:
    if r['year'] == '2012' and r['number'] == 4:
        print('FRESH Q4:', repr(r['text'][:300]))
        print('opts:', {k: v[:50] for k, v in r['options'].items() if v})
        print('answer:', r['answer'])
        break
