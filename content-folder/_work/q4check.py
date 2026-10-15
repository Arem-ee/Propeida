"""Find both candidate Q4s in the raw 2012 text."""
import pdfplumber

with pdfplumber.open('content-folder/JAMB-Economics-Past-Questions-and-Answers.pdf') as pdf:
    full = chr(10).join((p.extract_text() or '') for p in pdf.pages)
i = full.find('UTME 2012 ECONOMICS')
j = full.find('UTME 2013 ECONOMICS')
seg = full[i:j]
for m in ['rice bought decreases', 'sign of the slope']:
    k = seg.find(m)
    print(m, '->', 'FOUND' if k >= 0 else 'missing')
    if k >= 0:
        print(repr(seg[max(0, k - 260):k + 200]))
        print('======')
