"""Dump raw text around Government 1983 header."""
import pdfplumber

with pdfplumber.open('content-folder/GOVERNMENT-JAMB-Past-Questions.pdf') as pdf:
    for i, p in enumerate(pdf.pages):
        t = p.extract_text() or ''
        if 'Government 1983' in t:
            print('header on page', i + 1, 'of', len(pdf.pages))
            chunk = []
            for j in range(i, min(i + 4, len(pdf.pages))):
                chunk.append(f'===== RAW PAGE {j + 1} =====')
                chunk.append(pdf.pages[j].extract_text() or '')
            with open('content-folder/_dump/gov-raw.txt', 'w', encoding='utf-8') as f:
                f.write('\n'.join(chunk))
            print('wrote gov-raw.txt')
            break
