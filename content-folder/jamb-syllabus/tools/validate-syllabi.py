"""Validate the extraction against the PDFs' own bold headings.

JAMB sets topic headings in bold, so the number of bold heading lines in the
topics column is an independent count of what the extraction should have
found. A large shortfall means topics were missed.
"""
import importlib.util
import json
import re
from pathlib import Path

import pdfplumber

WORK = Path(__file__).resolve().parent
ROOT = WORK.parent
PDF_DIR = ROOT / "pdfs"
OUT = ROOT

spec = importlib.util.spec_from_file_location("ex", WORK / "extract-syllabi.py")
ex = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ex)

manifest = json.loads((PDF_DIR / "_manifest.json").read_text(encoding="utf-8"))
summary = {s["key"]: s for s in json.loads((OUT / "_index.json").read_text(encoding="utf-8"))}

print(f"{'subject':<32} {'found':>6} {'bold':>6} {'ratio':>7}  verdict")
print("-" * 72)
tot_found = tot_bold = 0
for meta in manifest:
    key = meta["key"]
    path = PDF_DIR / f"{key}.pdf"
    bold_headings = []
    all_x = []
    with pdfplumber.open(path) as doc:
        for page in doc.pages:
            prose, left, right, is_table = ex.split_page(page)
            if not left:
                continue
            page_words = page.extract_words(
                x_tolerance=1.6, y_tolerance=2.2, extra_attrs=["fontname"]
            )
            for line in left:
                if line["text"].upper().startswith("TOPICS"):
                    continue
                all_x.append(line["x0"])
                words = [
                    w
                    for w in page_words
                    if abs(w["top"] - line["top"]) < 2.5
                ]
                if words and any("Bold" in (w.get("fontname") or "") for w in words):
                    bold_headings.append(line)

    # Only headings at the base indent are topic-level; bold sub-headings are
    # indented further.
    if all_x:
        base = min(all_x)
        topic_bold = [b for b in bold_headings if b["x0"] <= base + 6]
    else:
        topic_bold = []

    found = summary.get(key, {}).get("topics", 0) + summary.get(key, {}).get("sections", 0)
    bold = len(topic_bold)
    tot_found += found
    tot_bold += bold
    ratio = found / bold if bold else 1.0
    verdict = "ok" if ratio >= 0.85 else ("close" if ratio >= 0.6 else "CHECK")
    print(f"{meta['name']:<32} {found:>6} {bold:>6} {ratio:>7.2f}  {verdict}")

print("-" * 72)
print(f"{'TOTAL':<32} {tot_found:>6} {tot_bold:>6}")
