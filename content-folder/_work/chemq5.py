"""Dump raw + processed text around Chemistry 1983 Q5."""
import pdfplumber
import importlib.util
import re

spec = importlib.util.spec_from_file_location('jp', 'scripts/jamb-parse.py')
jp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(jp)

with pdfplumber.open('content-folder/CHEMISTRY-JAMB-Past-Questions.pdf') as pdf:
    raw_full = chr(10).join((p.extract_text() or '') for p in pdf.pages)
    proc_full = chr(10).join(jp.page_text(p) for p in pdf.pages)

i = raw_full.find('Chemistry 1983')
seg = raw_full[i:i + 600]
lines = seg.split('\n')
# find line index with 5.
for j, ln in enumerate(lines):
    if re.match(r'^\s*5[\.\)]', ln):
        lo = max(0, j - 2)
        with open('content-folder/_dump/chem1983-q5.txt', 'w', encoding='utf-8') as f:
            f.write('RAW:\n' + '\n'.join(lines[lo:lo + 25]))
        break

pi = proc_full.find('Chemistry 1983')
pseg = proc_full[pi:pi + 600]
plines = pseg.split('\n')
for j, ln in enumerate(plines):
    if re.match(r'^\s*5[\.\)]', ln):
        with open('content-folder/_dump/chem1983-q5.txt', 'a', encoding='utf-8') as f:
            f.write('\n\nPROCESSED:\n' + '\n'.join(plines[max(0, j - 2):j + 25]))
        break
print('done')
