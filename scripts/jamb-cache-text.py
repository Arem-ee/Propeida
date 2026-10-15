"""Cache pypdf extraction for huge PDFs (English bank is 694 pages).

Usage: python scripts/jamb-cache-text.py <pdf-path>
Writes content-folder/_dump/<stem>.full.txt
"""
import sys
from pathlib import Path
from pypdf import PdfReader

src = Path(sys.argv[1])
out = Path('content-folder/_dump') / (src.stem + '.full.txt')
reader = PdfReader(src)
with out.open('w', encoding='utf-8') as f:
    for i, p in enumerate(reader.pages):
        f.write(f'\n===== PAGE {i + 1} =====\n')
        f.write(p.extract_text() or '')
print(f'wrote {out} ({out.stat().st_size} bytes)')
