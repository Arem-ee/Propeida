"""Dump a JAMB PDF to text for structure inspection.

Usage: python scripts/jamb-dump.py <pdf-path> [max-pages]
Writes content-folder/_dump/<name>.txt (first max-pages pages, default all).
"""
import sys
import pdfplumber
from pathlib import Path

src = Path(sys.argv[1])
max_pages = int(sys.argv[2]) if len(sys.argv) > 2 else -1

out_dir = Path('content-folder/_dump')
out_dir.mkdir(exist_ok=True)
out = out_dir / (src.stem + '.txt')

with pdfplumber.open(src) as pdf:
    pages = pdf.pages if max_pages < 0 else pdf.pages[:max_pages]
    with out.open('w', encoding='utf-8') as f:
        for i, page in enumerate(pages):
            f.write(f'\n===== PAGE {i + 1} =====\n')
            f.write(page.extract_text() or '')

print(f'wrote {out} ({out.stat().st_size} bytes)')
