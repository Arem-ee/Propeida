"""Find years split into multiple sections."""
import json
from collections import Counter

rows = json.load(open('content-folder/_parsed/Physics-JAMB-Past-Questions.json', encoding='utf-8'))
# reconstruct sections: JSON is flat; use source? No per-row section id.
# Instead check the parse directly.
import importlib.util
import pdfplumber

spec = importlib.util.spec_from_file_location('jp', 'scripts/jamb-parse.py')
jp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(jp)

with pdfplumber.open('content-folder/Physics-JAMB-Past-Questions.pdf') as pdf:
    texts = [jp.page_text(p) for p in pdf.pages]
sections = jp.parse(texts)
print('sections:', [(s['year'], len(s['qblocks'])) for s in sections])
