"""Page geometry audit for Chemistry 1983 section."""
import pdfplumber

with pdfplumber.open('content-folder/CHEMISTRY-JAMB-Past-Questions.pdf') as pdf:
    # find pages containing Chemistry 1983 section
    for i, p in enumerate(pdf.pages):
        t = p.extract_text() or ''
        if 'Chemistry 1983' in t:
            start = i
            break
    for i in range(start, min(start + 6, len(pdf.pages))):
        p = pdf.pages[i]
        words = p.extract_words()
        mid = p.width / 2
        left = sum(1 for w in words if (w['x0'] + w['x1']) / 2 < mid)
        right = len(words) - left
        imgs = len(p.images)
        print(f'page {i + 1}: w={len(words)} left={left} right={right} images={imgs}')
