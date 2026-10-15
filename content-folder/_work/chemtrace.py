"""Run the REAL parse() on Chemistry pages and report Chemistry 1983 blocks."""
import pdfplumber
import importlib.util
import json

spec = importlib.util.spec_from_file_location('jp', 'scripts/jamb-parse.py')
jp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(jp)

with pdfplumber.open('content-folder/CHEMISTRY-JAMB-Past-Questions.pdf') as pdf:
    texts = [jp.page_text(p) for p in pdf.pages]

sections = jp.parse(texts)
for sec in sections:
    if sec['year'] == '1983':
        print('section 1983 blocks:', len(sec['qblocks']))
        for qb in sec['qblocks']:
            print('  Q' + str(qb['number']), '| opts:', sorted((qb.get('options') or {}).keys()),
                  '| orphan' if qb.get('orphan') else '', '|', (qb.get('text') or '')[:60].replace('\n', ' '))
        print('  keys:', len(sec['keys']))
