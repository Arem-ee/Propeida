"""Regression: every banked Econs row must still parse byte-identical."""
import json

banked = json.load(open('content-folder/_work/econs-bank.json', encoding='utf-8'))
fresh = json.load(open('content-folder/_parsed/JAMB-Economics-Past-Questions-and-Answers.json', encoding='utf-8'))
fresh_texts = set(r['text'] for r in fresh)
missing = [b for b in banked if b['question_text'] not in fresh_texts]
print(f'banked={len(banked)} still-parse-identical={len(banked) - len(missing)} changed={len(missing)}')
for b in missing[:10]:
    print('CHANGED:', b['source'], '|', b['question_text'][:90].replace('\n', ' / '))
