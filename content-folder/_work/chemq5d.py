"""Trace the fused Q5 line through processing."""
import pdfplumber
import importlib.util

spec = importlib.util.spec_from_file_location('jp', 'scripts/jamb-parse.py')
jp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(jp)

with pdfplumber.open('content-folder/CHEMISTRY-JAMB-Past-Questions.pdf') as pdf:
    raw_full = chr(10).join((p.extract_text() or '') for p in pdf.pages)
    proc_full = chr(10).join(jp.page_text(p) for p in pdf.pages)

i = raw_full.find('Chemistry 1983')
seg = raw_full[i:i + 12638]
for ln in seg.split('\n'):
    if ln.strip().startswith('5. If an element'):
        print('RAW:', repr(ln[:150]))
        break

pi = proc_full.find('Chemistry 1983')
pseg = proc_full[pi:pi + 14000]
for ln in pseg.split('\n'):
    if 'lectronic configuration' in ln:
        print('PROC:', repr(ln[:200]))
