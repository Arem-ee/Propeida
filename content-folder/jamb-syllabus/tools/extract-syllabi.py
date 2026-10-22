"""Extract the official JAMB UTME syllabi from the IBASS PDFs into structured markdown.

Each JAMB syllabus PDF is a table: TOPICS/CONTENTS/NOTES on the left and
OBJECTIVES on the right. A topic and its objectives share the same vertical
band, so we pair them by band.

Words are assigned to a column by their own geometry (never cropped), which
avoids duplicating words that straddle the column rule.

JAMB syllabi differ in how they number their topics: most use "1.", "2."
while Geography, Hausa and Use of English use "A.", "(d)" and so on. The
extractor reads the whole document first to decide which level is the topic
level, then walks the lines in order.
"""
import json
import re
import sys
from pathlib import Path

import pdfplumber

WORK = Path(__file__).resolve().parent
ROOT = WORK.parent
PDF_DIR = ROOT / "pdfs"
OUT_DIR = ROOT

SUBJECTS = json.loads((PDF_DIR / "_manifest.json").read_text(encoding="utf-8"))

# Adobe Symbol font code points that Word emits into the private use area.
SYMBOL_MAP = {
    "\uF066": "\u03C6",   # phi
    "\uF06C": "\u03BB",   # lambda
    "\uF06D": "\u03BC",   # mu
    "\uF070": "\u03C0",   # pi
    "\uF072": "\u03C1",   # rho
    "\uF0E9": "\u23A1",   # left bracket, top
    "\uF0EA": "\u23A2",   # left bracket, extension
    "\uF0EB": "\u23A3",   # left bracket, bottom
    "\uF0F9": "\u23A4",   # right bracket, top
    "\uF0FA": "\u23A5",   # right bracket, extension
    "\uF0FB": "\u23A6",   # right bracket, bottom
    "\uF0B1": "(",
    "\uF0B4": ")",
    "\uF0B5": "\u00F7",
    "\uF0AE": "\u2260",
    "\uF0B3": "\u2265",
    "\uF0B2": "\u2264",
}

SECTION_WORD_RE = re.compile(r"^\s*SECTION\s+([A-Z]{1,4})\s*:?\s*(.*)$")
ROMAN_SECTION_RE = re.compile(r"^\s*([IVXLC]{1,4})\.\s+([A-Z][A-Z0-9 ,\-&/()'\.]{3,})$")
NUM_TOPIC_RE = re.compile(r"^\s*(\d{1,2})\.\s+(\S.*)$")
LETTER_TOPIC_RE = re.compile(r"^\s*\(?([A-Z])\)?\.?\s+([A-Z]\S.*)$")
PAREN_LETTER_RE = re.compile(r"^\s*\(([a-z])\)\s+(\S.*)$")
LOWER_LETTER_RE = re.compile(r"^\s*([a-z])\.\s+(\S.*)$")
ROMAN_ITEM_RE = re.compile(r"^\s*\(?([ivxl]{1,6})\)?\.?\s+(\S.*)$", re.IGNORECASE)
LEAD_IN_RE = re.compile(
    r"^\s*(candidates\s+should\s+be\s+able\s+to:?|candidates\s+should\s+be\s+able\s+to\s+do:?)\s*$",
    re.IGNORECASE,
)
NOISE_RE = re.compile(r"^(TOPICS/CONTENTS/NOTES|OBJECTIVES|PROPEIDA\s+\d+|\d{1,2})$")
FORMULA_JUNK_RE = re.compile(r"^(?:[0-9o\u2022\u00b7|/\\\-\u2013\u2014()\[\]^*+=<>0-9\s]){1,40}$")
REAL_TEXT_RE = re.compile(r"[A-Za-z]{3,}")


def clean(text):
    text = text.replace("\ufffd", "")
    for src, dst in SYMBOL_MAP.items():
        text = text.replace(src, dst)
    return re.sub(r"\s+", " ", text).strip()


def is_formula_junk(text):
    if REAL_TEXT_RE.search(text):
        return False
    return bool(FORMULA_JUNK_RE.match(text))


def to_lines(words):
    """Group words into visual lines, keeping the x indent of the line."""
    if not words:
        return []
    ordered = sorted(words, key=lambda w: w["top"])
    groups = []
    for w in ordered:
        if groups and w["top"] - groups[-1][0] < 5.0:
            groups[-1][1].append(w)
        else:
            groups.append([w["top"], [w]])
    lines = []
    for ref_top, group in groups:
        group.sort(key=lambda w: w["x0"])
        text = clean(" ".join(w["text"] for w in group))
        if text:
            lines.append({"top": min(w["top"] for w in group),
                          "x0": min(w["x0"] for w in group),
                          "text": text})
    return lines


def rect_rules(page):
    return sorted({round(r["x0"], 1) for r in page.rects if abs(r["x1"] - r["x0"]) < 1.5})


def header_split(page, words):
    """Split x where the OBJECTIVES column starts.

    The label is centred in its column, so the boundary is the table rule to
    the left of it. This works for two-column tables (TOPICS | OBJECTIVES) and
    three-column ones (S/N | TOPICS | OBJECTIVES) alike. The header row is
    located first, because the body also uses the word "Objectives".
    """
    obj = [w for w in words if "OBJECTIVES" in w["text"].upper()]
    if not obj:
        return None

    topics_header = [
        w
        for w in words
        if "TOPICS" in w["text"].upper()
        or "CONTENTS" in w["text"].upper()
        or w["text"].upper() == "S/N"
    ]
    if topics_header:
        header_top = min(w["top"] for w in topics_header)
        same_row = [w for w in obj if abs(w["top"] - header_top) < 20]
        if same_row:
            obj = same_row

    obj_left = min(w["x0"] for w in obj)
    obj_mid = (obj_left + max(w["x1"] for w in obj)) / 2

    rules = rect_rules(page)
    if rules:
        before = [x for x in rules if x < obj_mid]
        if before:
            return max(before)
        return rules[0]

    topics = topics_header
    if topics:
        t_max = max(w["x1"] for w in topics)
        if t_max < obj_left:
            return (t_max + obj_left) / 2
    return obj_left


def gap_split(page, words):
    """Find a wide empty vertical band that separates two text columns."""
    if not words:
        return None
    lo = min(w["x0"] for w in words)
    hi = max(w["x1"] for w in words)
    merged = []
    for a, b in sorted((w["x0"], w["x1"]) for w in words):
        if merged and a <= merged[-1][1] + 1:
            merged[-1][1] = max(merged[-1][1], b)
        else:
            merged.append([a, b])
    best = None
    for (a1, a2), (b1, b2) in zip(merged, merged[1:]):
        gap = b1 - a2
        mid = (a2 + b1) / 2
        if gap >= 22 and mid > lo + 25 and mid < hi - 25:
            if best is None or gap > best[0]:
                best = (gap, mid)
    return best[1] if best else None


def find_table_top(page, words):
    """The y where the topics/objectives table starts on this page.

    JAMB usually repeats the table header on every page, so the header row
    marks the top of the table and anything above it is prose. Some PDFs split
    the header across separate words, and some repeat it only once, so the
    table's own top rule is the fallback.
    """
    if not words:
        return None

    ordered = sorted(words, key=lambda w: w["top"])
    groups = []
    for w in ordered:
        if groups and w["top"] - groups[-1][0] < 5.0:
            groups[-1][1].append(w)
        else:
            groups.append([w["top"], [w]])

    for ref_top, group in groups:
        tokens = [w["text"].upper() for w in group]
        blob = " ".join(tokens)
        if "TOPICS" in blob and "CONTENTS" in blob:
            return ref_top - 3

    rules = [
        r["top"]
        for r in page.rects
        if abs(r["bottom"] - r["top"]) < 1.5 and (r["x1"] - r["x0"]) > 80
    ]
    if rules:
        return min(rules) - 3
    return None


def split_page(page):
    """Return (prose_lines, left_lines, right_lines, is_table) for a page."""
    words = page.extract_words(x_tolerance=1.6, y_tolerance=2.2, keep_blank_chars=False)
    top = find_table_top(page, words)
    if top is None:
        return to_lines(words), [], [], False

    prose_words = [w for w in words if w["top"] < top]
    table_words = [w for w in words if w["top"] >= top]

    xm = header_split(page, table_words)
    if xm is None:
        rules = rect_rules(page)
        if rules:
            xm = rules[1] if len(rules) > 2 else rules[0]
        else:
            xm = gap_split(page, table_words)
    if xm is None:
        return to_lines(prose_words), [], to_lines(table_words), False

    left, right = [], []
    for w in table_words:
        centre = (w["x0"] + w["x1"]) / 2
        (left if centre < xm else right).append(w)
    return to_lines(prose_words), to_lines(left), to_lines(right), True


def merge_items(lines):
    """Merge continuation lines into logical items.

    A new item starts with a marker such as (a), i. or 3. Lines without a
    marker continue the previous item.
    """
    items = []
    for line in lines:
        text = line["text"]
        if NOISE_RE.match(text) or LEAD_IN_RE.match(text) or is_formula_junk(text):
            continue
        if any(
            p.match(text)
            for p in (PAREN_LETTER_RE, LOWER_LETTER_RE, ROMAN_ITEM_RE, NUM_TOPIC_RE, LETTER_TOPIC_RE)
        ):
            items.append(text)
        elif items:
            items[-1] = items[-1] + " " + text
        else:
            items.append(text)
    return items


def starts_marker(text):
    """True when a line opens a new item rather than continuing one."""
    return bool(
        PAREN_LETTER_RE.match(text)
        or LOWER_LETTER_RE.match(text)
        or ROMAN_ITEM_RE.match(text)
        or NUM_TOPIC_RE.match(text)
    )


def is_all_caps(text):
    letters = [c for c in text if c.isalpha()]
    return bool(letters) and all(c.isupper() for c in letters)


def classify(text, mode):
    """Return ('section'|'topic'|'item', number, rest) for a left column line.

    mode is the document's heading scheme:
      'numeric' - topics are "1.", "2." and "(a)" is a sub-item
      'letter'  - topics are "A.", "B." and "(a)" is a sub-item
      'paren'   - topics are "(a)", "(b)" and "i." is a sub-item
    """
    m = SECTION_WORD_RE.match(text)
    if m:
        return "section", m.group(1), clean(m.group(2))

    m = ROMAN_SECTION_RE.match(text)
    if m and is_all_caps(m.group(2)):
        return "section", m.group(1), clean(m.group(2))

    m = NUM_TOPIC_RE.match(text)
    if m and len(m.group(2)) > 1:
        return "topic", m.group(1), clean(m.group(2).rstrip(":"))

    m = LETTER_TOPIC_RE.match(text)
    if m and len(m.group(2)) > 1:
        rest = clean(m.group(2))
        if is_all_caps(rest):
            return "section", m.group(1), rest
        return "topic", m.group(1), rest

    m = PAREN_LETTER_RE.match(text)
    if m and len(m.group(2)) > 1:
        if mode == "paren":
            return "topic", m.group(1), clean(m.group(2))
        return "item", m.group(1), clean(m.group(2))

    return "item", None, text


def detect_mode(pages):
    """Work out how this document numbers its topics."""
    numeric = 0
    letter = 0
    for _prose, left, _right, _is_table in pages:
        for line in left:
            text = line["text"]
            m = NUM_TOPIC_RE.match(text)
            if m and len(m.group(2)) > 1:
                numeric += 1
                continue
            m = LETTER_TOPIC_RE.match(text)
            if m and len(m.group(2)) > 1 and not is_all_caps(m.group(2)):
                letter += 1
    if numeric >= 3:
        return "numeric"
    if letter >= 2:
        return "letter"
    return "paren"


def build_subject(doc, meta):
    # Pass one: read every page and work out how this document numbers its
    # topics.
    pages = []
    for page in doc.pages:
        pages.append(split_page(page))
    mode = detect_mode(pages)

    # Prose above the table: general objectives on the first pages,
    # recommended texts at the end.
    preamble = []
    notes = []
    seen_table = False
    for prose, _left, _right, is_table in pages:
        for l in prose:
            t = clean(l["text"])
            if t and not NOISE_RE.match(t) and not is_formula_junk(t):
                (notes if seen_table else preamble).append(t)
        if is_table:
            seen_table = True

    # Flatten the pages into one continuous stream so that a topic whose
    # notes run over a page break keeps the rest of its items.
    left = []
    right = []
    for pi, (_prose, page_left, page_right, is_table) in enumerate(pages):
        if not is_table:
            continue
        for l in page_left:
            left.append({**l, "gpos": pi * 100000 + l["top"]})
        for r in page_right:
            right.append({**r, "gpos": pi * 100000 + r["top"]})

    sections = []
    current_section = None

    for i, line in enumerate(left):
        text = line["text"]
        if NOISE_RE.match(text) or is_formula_junk(text):
            continue
        kind, number, rest = classify(text, mode)
        if kind == "item":
            continue

        # The heading may wrap onto the following lines, but only onto
        # lines that continue the title rather than open a new item.
        heading = rest
        j = i + 1
        while j < len(left):
            nxt = left[j]["text"]
            if NOISE_RE.match(nxt) or is_formula_junk(nxt):
                j += 1
                continue
            if starts_marker(nxt):
                break
            if classify(nxt, mode)[0] != "item":
                break
            if left[j]["x0"] - line["x0"] > 18:
                break
            heading = clean(heading + " " + nxt)
            j += 1

        if kind == "section":
            current_section = {"heading": heading, "topics": []}
            sections.append(current_section)
            continue

        # Topic: collect the items that belong to it. A topic owns every
        # line up to the next heading, however deeply those lines are
        # indented, including any that run onto the next page.
        items = []
        band_bottom = None
        for k in range(j, len(left)):
            nxt = left[k]["text"]
            if NOISE_RE.match(nxt):
                continue
            if classify(nxt, mode)[0] in ("section", "topic"):
                band_bottom = left[k]["gpos"]
                break
            items.append(nxt)
        if band_bottom is None:
            band_bottom = left[-1]["gpos"] + 1

        objectives = [
            r["text"] for r in right if line["gpos"] <= r["gpos"] < band_bottom
        ]

        topic = {
            "number": number,
            "title": heading,
            "items": merge_items([{"text": t} for t in items]),
            "objectives": merge_items([{"text": t} for t in objectives]),
        }
        if current_section is None:
            current_section = {"heading": "Syllabus", "topics": []}
            sections.append(current_section)
        current_section["topics"].append(topic)

    return {
        "subject": meta["name"],
        "key": meta["key"],
        "source": meta["url"],
        "preamble": preamble,
        "sections": sections,
        "notes": notes,
    }


def rect_rules_present(lines):
    return False


def render_markdown(data):
    out = []
    out.append(f"# JAMB UTME Syllabus — {data['subject']}")
    out.append("")
    out.append(
        "> Official source: JAMB Integrated Brochure & Syllabus System (IBASS). "
        f"PDF: {data['source']}"
    )
    out.append(">")
    out.append(
        "> Propeida is not affiliated with JAMB. This document is preparation material only "
        "and is not an official JAMB publication."
    )
    out.append("")

    if data["preamble"]:
        out.append("## General objectives")
        out.append("")
        for line in data["preamble"]:
            out.append(f"- {line}")
        out.append("")

    for section in data["sections"]:
        out.append(f"## {section['heading']}")
        out.append("")
        for topic in section["topics"]:
            out.append(f"### {topic['number']}. {topic['title']}")
            out.append("")
            if topic["items"]:
                out.append("**Topics and notes**")
                out.append("")
                for item in topic["items"]:
                    out.append(f"- {item}")
                out.append("")
            if topic["objectives"]:
                out.append("**Candidates should be able to**")
                out.append("")
                for obj in topic["objectives"]:
                    out.append(f"- {obj}")
                out.append("")

    if data["notes"]:
        out.append("## Recommended texts and additional notes")
        out.append("")
        for note in data["notes"]:
            out.append(f"- {note}")
        out.append("")

    return "\n".join(out)


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    only = sys.argv[1] if len(sys.argv) > 1 else None
    summary = []

    for meta in SUBJECTS:
        if only and only != meta["key"]:
            continue
        pdf_path = PDF_DIR / f"{meta['key']}.pdf"
        if not pdf_path.exists():
            print(f"MISSING PDF {meta['key']}")
            continue
        try:
            with pdfplumber.open(pdf_path) as doc:
                data = build_subject(doc, meta)
        except Exception as exc:
            print(f"ERROR {meta['key']}: {exc}")
            continue

        md = render_markdown(data)
        (OUT_DIR / f"{meta['key']}.md").write_text(md, encoding="utf-8")

        topics = sum(len(s["topics"]) for s in data["sections"])
        objs = sum(len(t["objectives"]) for s in data["sections"] for t in s["topics"])
        items = sum(len(t["items"]) for s in data["sections"] for t in s["topics"])
        summary.append(
            {
                "key": meta["key"],
                "subject": meta["name"],
                "sections": len(data["sections"]),
                "topics": topics,
                "sub_items": items,
                "objectives": objs,
                "chars": len(md),
            }
        )
        print(
            f"{meta['name']:<32} sections={len(data['sections']):>2} "
            f"topics={topics:>3} items={items:>4} objectives={objs:>4} md={len(md):>6}B"
        )

    if not only:
        (OUT_DIR / "_index.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
        print(f"\nTOTAL: {len(summary)} subjects, {sum(s['topics'] for s in summary)} topics, "
              f"{sum(s['objectives'] for s in summary)} objectives")


if __name__ == "__main__":
    main()

