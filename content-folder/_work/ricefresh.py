"""Where is the rice question in the fresh parse, and with what key?"""
import json

fresh = json.load(open('content-folder/_parsed/JAMB-Economics-Past-Questions-and-Answers.json', encoding='utf-8'))
for r in fresh:
    if r['year'] == '2012' and 'rice bought decreases' in r['text']:
        print('number:', r['number'], '| answer:', r['answer'])
        print('text:', r['text'][:200].replace('\n', ' / '))
        break
