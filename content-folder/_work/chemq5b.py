"""Find what's between parsed Q4 and Q9 in Chemistry 1983 raw text."""
import pdfplumber
import json

rows = json.load(open('content-folder/_parsed/CHEMISTRY-JAMB-Past-Questions.json', encoding='utf-8'))
y83 = [r for r in rows if r['year'] == '1983']
for r in y83:
    if r['number'] in (4, 9):
        print('Q' + str(r['number']) + ':', r['text'][:120].replace('\n', ' / '))
        print('   opts:', [(k, v[:40]) for k, v in r['options'].items() if v])
