"""Instrument the parse of the Chemistry 1983 Q4-Q6 region."""
import pdfplumber
import importlib.util
import re

spec = importlib.util.spec_from_file_location('jp', 'scripts/jamb-parse.py')
jp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(jp)

with pdfplumber.open('content-folder/CHEMISTRY-JAMB-Past-Questions.pdf') as pdf:
    proc_full = chr(10).join(jp.page_text(p) for p in pdf.pages)

i = proc_full.find('Chemistry 1983')
seg = proc_full[i:i + 3000]
lines = seg.split('\n')
# find line indices around Q4 options end and Q5
for j, ln in enumerate(lines):
    if ln.strip().startswith(('4. ', '5. ', '6. ', '9. ')) and len(ln.strip()) < 120:
        print(j, repr(ln[:110]))

print('---- simulate guard ----')
# reconstruct: feed region lines through clean + show what clean emits
cleaned = jp.clean(lines[0:60])
for j, ln in enumerate(cleaned):
    if re.match(r'^\s*\d+\.', ln) or re.match(r'^[A-E]\.', ln):
        print('C', j, repr(ln[:100]))
