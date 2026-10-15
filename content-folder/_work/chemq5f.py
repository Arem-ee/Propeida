"""Simulate main-loop guard on Chemistry 1983 lines 55-100."""
import pdfplumber
import importlib.util
import re

spec = importlib.util.spec_from_file_location('jp', 'scripts/jamb-parse.py')
jp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(jp)

with pdfplumber.open('content-folder/CHEMISTRY-JAMB-Past-Questions.pdf') as pdf:
    proc_full = chr(10).join(jp.page_text(p) for p in pdf.pages)

i = proc_full.find('Chemistry 1983')
seg = proc_full[i:i + 6000]
lines = seg.split('\n')
print('--- raw lines 55-100 with Q/OPT markers flagged:')
for j in range(55, 100):
    ln = lines[j]
    tag = ''
    if jp.Q_RE.match(ln):
        tag = 'Q?'
    if jp.OPT_RE.match(ln):
        tag += 'OPT'
    print(j, tag, repr(ln[:95]))
