"""Count year headers in Physics raw text."""
import pdfplumber
import re
from collections import Counter

with pdfplumber.open('content-folder/Physics-JAMB-Past-Questions.pdf') as pdf:
    full = chr(10).join((p.extract_text() or '') for p in pdf.pages)
heads = re.findall(r'(?m)^Physics ((?:19|20)\d{2})', full)
print(Counter(heads))
print('total headers:', len(heads))
