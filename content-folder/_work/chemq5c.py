"""Find Q5-Q8 content in raw Chemistry 1983 text."""
import pdfplumber
import re

with pdfplumber.open('content-folder/CHEMISTRY-JAMB-Past-Questions.pdf') as pdf:
    raw_full = chr(10).join((p.extract_text() or '') for p in pdf.pages)
i = raw_full.find('Chemistry 1983')
j = raw_full.find('Chemistry 1984')
seg = raw_full[i:j]
print('section chars:', len(seg))
# every occurrence of a question-like number
for m in re.finditer(r'(?m)^.{0,20}?\b([5-8])\.\s', seg):
    print(repr(m.group(0)[:80]))
print('---- lines containing "5." anywhere:')
for ln in seg.split('\n'):
    if '5.' in ln and len(ln.strip()) > 10:
        print(repr(ln[:110]))
        break
