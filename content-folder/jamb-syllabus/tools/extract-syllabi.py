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
ROMAN_SECTION_RE = re.compile(
    r"^\s*(I{1,3}|IV|VI{0,3}|IX|XI{0,3})\.\s+([A-Z][A-Z0-9 ,\-&/()'\.]{3,})$"
)
# Topics are numbered "1.", "17-", "3." and, in a few PDFs, "(2)" or "(2a)".
NUM_TOPIC_RE = re.compile(r"^\s*(\d{1,2})\s*[\.\-–—]\s*(\S.*)$")
PAREN_NUM_TOPIC_RE = re.compile(r"^\s*\((\d{1,2})([a-z]?)[\.\)]\s*(\S.*)$")
BARE_NUM_TOPIC_RE = re.compile(r"^\s*(\d{1,2})\s+([A-Z][^\s].*)$")
PAREN_ROMAN_ONE_RE = re.compile(r"^\s*\(I\)\.?\s+(\S.*)$")
BARE_ROMAN_ONE_RE = re.compile(r"^\s*I\.\s+(\S.*)$")
LETTER_TOPIC_RE = re.compile(r"^\s*\(?([A-Z])\)?\.?\s+([A-Z]\S.*)$")
# A section heading that JAMB left inside the table, e.g. "D: HEREDITY AND VARIATIONS".
LETTER_COLON_RE = re.compile(r"^\s*([A-Z])\s*:\s+([A-Z][^\t]{2,})$")
SECTION_SUFFIX_RE = re.compile(
    r"\s*candidates\s+should\s+be\s+able\s+(?:to|do)?\s*[:;]?\s*$", re.IGNORECASE
)
GENERIC_HEADINGS = {
    "GENERAL OBJECTIVES",
    "DETAILED SYLLABUS",
    "TOPICS/CONTENTS/NOTES",
    "OBJECTIVES",
    "SYLLABUS",
}
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


def split_page(page, allow_rescue=True):
    """Return (prose_lines, left_lines, right_lines, is_table) for a page."""
    words = page.extract_words(x_tolerance=1.6, y_tolerance=2.2, keep_blank_chars=False)
    top = find_table_top(page, words)
    if top is None:
        return to_lines(words), [], [], False

    prose_words = [w for w in words if w["top"] < top]
    table_words = [w for w in words if w["top"] >= top]

    # Some pages stack two tables: the tail of the previous section (no
    # repeated header) above a new table that repeats the header lower down.
    # Anything above that header that opens with an item/topic marker is
    # table content, not prose.
    if allow_rescue and top > page.height * 0.25 and prose_words:
        rescued = []
        kept = []
        ordered = sorted(prose_words, key=lambda w: w["top"])
        groups = []
        for w in ordered:
            if groups and w["top"] - groups[-1][0] < 5.0:
                groups[-1][1].append(w)
            else:
                groups.append([w["top"], [w]])
        marker_lines = 0
        letter_marker = False
        for _ref, group in groups:
            group.sort(key=lambda w: w["x0"])
            text = clean(" ".join(w["text"] for w in group))
            if starts_marker(text):
                marker_lines += 1
                if not NUM_TOPIC_RE.match(text) and not PAREN_NUM_TOPIC_RE.match(text):
                    letter_marker = True
                rescued.extend(group)
            else:
                kept.extend(group)
        if marker_lines >= 3 and letter_marker:
            prose_words = kept
            table_words = table_words + rescued

    xm = header_split(page, table_words)
    if xm is None:
        # The header row is not repeated on every page. Prefer the empty band
        # between the two columns over the table rules, which also include the
        # narrow S/N divider.
        xm = gap_split(page, table_words)
    if xm is None:
        rules = rect_rules(page)
        if rules:
            xm = rules[1] if len(rules) > 2 else rules[0]
    if xm is None:
        return to_lines(prose_words), [], to_lines(table_words), False

    left, right = [], []
    for w in table_words:
        centre = (w["x0"] + w["x1"]) / 2
        (left if centre < xm else right).append(w)
    left, right = to_lines(left), to_lines(right)

    # A centred section heading can straddle the column rule, which puts half
    # of its words in the objectives column. Keep any such row whole.
    if right:
        absorbed = set()
        for line in left:
            if not (SECTION_LINE_RE.match(line["text"]) or PART_RE.match(line["text"])):
                continue
            row = [
                r
                for r in right
                if abs(r["top"] - line["top"]) < 5.0 and r["x0"] > line["x0"]
            ]
            if row:
                line["text"] = clean(" ".join([line["text"]] + [r["text"] for r in row]))
                absorbed.update(id(r) for r in row)
        if absorbed:
            right = [r for r in right if id(r) not in absorbed]

    return to_lines(prose_words), left, right, True


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


def demote_bare_roman(kind, text, mode, previous_topic):
    """A bare "I." mid-topic is a list item, not the mangled topic "1"."""
    if (
        kind == "topic"
        and mode == "numeric"
        and previous_topic is not None
        and BARE_ROMAN_ONE_RE.match(text)
    ):
        return "item"
    return kind


def starts_marker(text):
    """True when a line opens a new item rather than continuing one."""
    return bool(
        PAREN_LETTER_RE.match(text)
        or LOWER_LETTER_RE.match(text)
        or ROMAN_ITEM_RE.match(text)
        or NUM_TOPIC_RE.match(text)
        or PAREN_NUM_TOPIC_RE.match(text)
        or LETTER_TOPIC_RE.match(text)
    )


def is_all_caps(text):
    letters = [c for c in text if c.isalpha()]
    return bool(letters) and all(c.isupper() for c in letters)


def has_word(text, length=3):
    return bool(re.search(r"[A-Za-z]{%d,}" % length, text))


CITATION_RE = re.compile(r"\((?:19|20)\d{2}[a-z]?\)")
AUTHOR_RE = re.compile(r"^[A-Z][A-Za-z'\-]+,\s*[A-Z]\.(?:\s*[A-Z]\.)*")
PART_RE = re.compile(r"^\s*PART\s+[IVXLC0-9]+\b", re.IGNORECASE)
SECTION_LINE_RE = re.compile(r"^\s*SECTION\b", re.IGNORECASE)
PARENTHETICAL_RE = re.compile(r"^[\(\[]\s*.+\s*[\)\]]$")
# A wrapped heading often stops on a connector: "HISTORY AND LITERATURE OF".
CONNECTOR_TAIL_RE = re.compile(
    r"(?:\b(?:of|and|the|in|to|for|with|a|an|at|by|from|on|or|as|into|through|"
    r"between|under|over|its|their|his|her|this|these|those|up|down|since|before|"
    r"after|during|against|within|without|towards?|among|per|via|versus|vs)|[:;,\-–—])$",
    re.IGNORECASE,
)


def is_citation(text):
    """Numbered bibliography entries are notes, not syllabus topics."""
    return bool(CITATION_RE.search(text)) or bool(AUTHOR_RE.match(text))


def section_title(text):
    title = re.sub(r"\s+", " ", text).strip(" .,:;-")
    title = re.sub(r"^PART\s+[IVXLC0-9]+\s*[:.\-]?\s*", "", title, flags=re.IGNORECASE)
    title = re.split(r"\bS/N\b|TOPICS?/CONTENTS?|TOPIC/CONTENT/NOTES", title)[0]
    title = SECTION_SUFFIX_RE.sub("", title).strip(" .,:;-")
    return title


def split_heading_colon(text):
    """Split "Topic: descriptor" at the first colon or semicolon outside brackets.

    Returns (title, descriptor). The descriptor is empty when the separator
    closes the heading or sits inside a reference such as "(Isaiah 6:1-13)".
    """
    depth = 0
    for index, char in enumerate(text):
        if char in "([":
            depth += 1
        elif char in ")]":
            depth = max(0, depth - 1)
        elif char in ":;" and depth == 0:
            head = text[:index].strip(" .,:;-")
            tail = text[index + 1 :].strip()
            if len(head) >= 3 and tail:
                return head, tail
            break
    return text.strip(" .,:;-"), ""


def is_parenthetical(text):
    return bool(PARENTHETICAL_RE.match(text.strip()))


def heading_continues(heading, nxt, stop_at_colon=False):
    """True when nxt is the wrapped remainder of a heading, not body text."""
    heading = heading.strip()
    if not heading:
        return True
    # A topic colon ends the heading: what follows is the descriptor list, not
    # the title. Section lines keep their colon ("SECTION A:" + title).
    if stop_at_colon and heading.endswith(":"):
        return False
    # A wrapped heading can resume on a lowercase connector: "Middle East" +
    # "and West Africa:". Body text starts with a capital.
    if re.match(r"^(?:and|or|of|the|in|to|for|with|at|by|from|on|as)\s", nxt):
        return True
    if is_parenthetical(nxt):
        return True
    if CONNECTOR_TAIL_RE.search(heading):
        return True
    # Centred continuations ("AFRICAN MUSIC") and short title-case tails
    # ("Appreciation") complete a heading; a sentence or a list item does not.
    if heading.endswith(")") or heading.endswith("]"):
        return False
    if is_all_caps(nxt) and len(nxt.split()) <= 7:
        return True
    if re.search(r"[.;:]$", nxt):
        return False
    if starts_marker(nxt):
        return False
    words = nxt.split()
    # Title-case headings also wrap ("General and Current" + "Affairs (...)").
    # A body sentence ends in punctuation or opens with an item marker.
    if len(words) <= 6 and not re.search(r"[.;:,]$", nxt):
        return True
    return len(words) <= 4 and len(heading.split()) <= 2


def classify(text, mode, x0=None, topic_indent=None):
    """Return ('section'|'topic'|'item', number, rest) for a left column line.

    mode is the document's heading scheme:
      'numeric' - topics are "1.", "2." and "(a)" is a sub-item
      'letter'  - topics are "A.", "B." and "(a)" is a sub-item
      'paren'   - topics are "(a)", "(b)" and "i." is a sub-item
    """
    m = SECTION_WORD_RE.match(text)
    if m:
        return "section", m.group(1), section_title(clean(m.group(2)))

    if PART_RE.match(text):
        return "section", None, section_title(clean(text))

    m = ROMAN_SECTION_RE.match(text)
    if m and is_all_caps(m.group(2)):
        return "section", m.group(1), section_title(clean(m.group(2)))

    m = LETTER_COLON_RE.match(text)
    if m:
        rest = clean(m.group(2))
        first = rest.split(" ")[0] if rest else ""
        if is_all_caps(first) and len(first) > 2:
            return "section", m.group(1), section_title(rest)

    # A bare "I." inside a numeric document is a mangled "1.".
    if mode == "numeric":
        m = PAREN_ROMAN_ONE_RE.match(text) or BARE_ROMAN_ONE_RE.match(text)
        if m:
            return "topic", "1", section_title(clean(m.group(1)))

    m = PAREN_NUM_TOPIC_RE.match(text)
    if m and len(m.group(3)) > 1:
        rest = re.sub(r"^\([a-z]\)\s*", "", clean(m.group(3)))
        return "topic", f"{m.group(1)}{m.group(2)}", section_title(rest)

    m = NUM_TOPIC_RE.match(text)
    if m and len(m.group(2)) > 1:
        return "topic", m.group(1), section_title(clean(m.group(2)).rstrip(":"))

    # "4 Gravitational field" - numbered, but the dot is missing. Only trust
    # this at the topic indent, where the other topic numbers sit.
    if mode == "numeric" and x0 is not None and topic_indent is not None:
        m = BARE_NUM_TOPIC_RE.match(text)
        if m and len(m.group(2)) > 3 and has_word(m.group(2)) and x0 <= topic_indent + 6:
            return "topic", m.group(1), section_title(clean(m.group(2)))

    m = LETTER_TOPIC_RE.match(text)
    if m and len(m.group(2)) > 1 and mode != "numeric":
        return "topic", m.group(1), clean(m.group(2))

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
            m = PAREN_NUM_TOPIC_RE.match(text)
            if m and len(m.group(3)) > 1:
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


def topic_indent(pages):
    """Leftmost indent of the numbered topic column, used to spot topics."""
    xs = []
    for _prose, left, _right, _is_table in pages:
        for line in left:
            if NUM_TOPIC_RE.match(line["text"]):
                xs.append(line["x0"])
    if not xs:
        return None
    xs.sort()
    return xs[len(xs) // 2]


def prose_heading(text, subject_name, is_tail, is_table):
    """Section heading that sits in the page prose rather than the table."""
    raw_text = clean(text)
    if PART_RE.match(raw_text):
        return {
            "letter": None,
            "title": section_title(raw_text),
            "part": True,
        }

    clean_text = section_title(raw_text)
    if not clean_text or len(clean_text) > 90:
        return None
    upper = clean_text.upper()
    if upper in GENERIC_HEADINGS or upper == subject_name.upper():
        return None
    if upper.endswith("SYLLABUS") or "RECOMMENDED TEXTS" in upper:
        return None

    m = re.match(r"^SECTION\s+([A-Z])\s*:?\s*(.*)$", clean_text, re.IGNORECASE)
    if m:
        return {"letter": m.group(1).upper(), "title": section_title(m.group(2))}

    m = re.match(r"^([A-Z])\s*:\s*(.+)$", clean_text)
    if m and is_all_caps(m.group(2)):
        return {"letter": m.group(1), "title": section_title(m.group(2))}

    # A bare all-caps line is only a section heading when it sits in the tail
    # of the prose above a table; anywhere else it is body text (set texts,
    # publisher names, running heads).
    if is_table and is_tail and is_all_caps(clean_text) and has_word(clean_text):
        words = clean_text.split()
        if len(words) >= 2 or len(clean_text) >= 5:
            return {"letter": None, "title": clean_text}
    return None


TEXTS_RE = re.compile(
    r"(RECOMMENDED\s+TEXTS?|LIST\s+OF\s+SET\s+TEXTS?|FURTHER\s+READING|REFERENCES)\b",
    re.IGNORECASE,
)


def sequence_value(number):
    """Numeric order of a topic number: 3, '2a', 'B' all have one."""
    text = str(number).strip().upper()
    match = re.match(r"^(\d+)", text)
    if match:
        return int(match.group(1))
    if len(text) == 1 and text.isalpha():
        return ord(text) - ord("A") + 1
    return None


def plausible_topic(number, previous):
    """Reject numbers that cannot continue the section's sequence.

    Scripture references and wrapped notes often start with a number; a
    real topic is the next number, a reset to the start, or a small jump
    where the PDF skipped a row.
    """
    value = sequence_value(number)
    previous_value = sequence_value(previous) if previous else None
    if value is None or previous_value is None:
        return True
    return value == 1 or previous_value <= value <= previous_value + 2


def build_subject(doc, meta):
    # Pass one: read every page and work out how this document numbers its
    # topics.
    pages = []
    for index, page in enumerate(doc.pages):
        pages.append(split_page(page, allow_rescue=index > 0))
    mode = detect_mode(pages)
    indent = topic_indent(pages)

    # Prose above the table: general objectives on the first pages,
    # recommended texts at the end. Prose also carries section headings
    # ("A: VARIETY OF ORGANISMS", "PHYSICAL GEOGRAPHY").
    preamble = []
    notes = []
    prose_lines = []
    seen_table = False
    headings = []
    cutoff = None

    def header_like(text):
        upper = text.upper()
        return bool(
            NOISE_RE.match(text)
            or "TOPICS/CONTENTS" in upper
            or "TOPIC/CONTENT" in upper
            or upper.startswith("S/N")
            or upper == "OBJECTIVES"
        )

    for pi, (prose, _left, _right, is_table) in enumerate(pages):
        significant = [i for i, l in enumerate(prose) if not header_like(clean(l["text"]))]
        tail = set(significant[-3:])
        entries = []
        for index, l in enumerate(prose):
            t = clean(l["text"])
            if not t or header_like(t):
                continue
            entries.append(
                {"text": t, "gpos": pi * 100000 + l["top"], "tail": index in tail}
            )

        for entry in entries:
            t = entry["text"]
            if not NOISE_RE.match(t) and not is_formula_junk(t):
                (notes if seen_table else preamble).append(t)
                prose_lines.append({"text": t, "gpos": entry["gpos"]})
                if cutoff is None and TEXTS_RE.search(t):
                    cutoff = entry["gpos"]

        index = 0
        while index < len(entries):
            entry = entries[index]
            head = prose_heading(entry["text"], meta["name"], entry["tail"], is_table)
            if not head:
                index += 1
                continue

            # Headings wrap over two or three lines in several PDFs, and the
            # wrapped part can be indented or centred well away from the first.
            following = index + 1
            while following < len(entries):
                nxt = entries[following]["text"]
                if TEXTS_RE.search(nxt) or NOISE_RE.match(nxt):
                    break
                if SECTION_LINE_RE.match(nxt) or PART_RE.match(nxt):
                    break
                if nxt.upper() in GENERIC_HEADINGS or nxt.upper().endswith("SYLLABUS"):
                    break
                if not (
                    entries[following]["tail"]
                    or is_parenthetical(nxt)
                    or is_all_caps(nxt)
                ):
                    break
                if not heading_continues(head["title"], nxt):
                    break
                head["title"] = section_title(f"{head['title']} {nxt}")
                following += 1

            headings.append({**head, "gpos": entry["gpos"]})
            index = following

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
            gpos = pi * 100000 + l["top"]
            if cutoff is not None and gpos >= cutoff:
                continue
            left.append({**l, "gpos": gpos})
        for r in page_right:
            gpos = pi * 100000 + r["top"]
            if cutoff is not None and gpos >= cutoff:
                continue
            right.append({**r, "gpos": gpos})

    sections = []
    current_section = None
    previous_topic = None

    for i, line in enumerate(left):
        text = line["text"]
        if NOISE_RE.match(text) or is_formula_junk(text):
            continue
        kind, number, rest = classify(text, mode, line["x0"], indent)
        kind = demote_bare_roman(kind, text, mode, previous_topic)
        if kind == "topic" and is_citation(rest):
            kind = "item"
        if kind == "topic" and mode == "numeric" and not plausible_topic(number, previous_topic):
            kind = "item"
        if kind == "item":
            continue

        # The heading may wrap onto the following lines, but only onto
        # lines that complete the title rather than open a new item.
        heading = rest
        colon_terminated = kind == "topic" and text.rstrip().endswith(":")
        j = i + 1
        while j < len(left):
            if colon_terminated:
                break
            nxt = left[j]["text"]
            if NOISE_RE.match(nxt) or is_formula_junk(nxt):
                j += 1
                continue
            if starts_marker(nxt):
                break
            if classify(nxt, mode, left[j]["x0"], indent)[0] != "item":
                break
            # "Chemical industries: Types, raw materials" is a descriptor,
            # not the rest of "Chemistry and Industry".
            _nxt_title, nxt_descriptor = split_heading_colon(nxt)
            if (
                kind == "topic"
                and nxt_descriptor
                and not CONNECTOR_TAIL_RE.search(heading)
            ):
                break
            near = abs(left[j]["x0"] - line["x0"]) <= 18
            connector = bool(CONNECTOR_TAIL_RE.search(heading))
            lower_connector = bool(
                re.match(
                    r"^(?:and|or|of|the|in|to|for|with|at|by|from|on|as)\s",
                    nxt,
                )
            )
            if not (
                near
                or connector
                or lower_connector
                or is_parenthetical(nxt)
                or is_all_caps(nxt)
            ):
                break
            if not heading_continues(heading, nxt, stop_at_colon=(kind == "topic")):
                break
            heading = clean(heading + " " + nxt)
            j += 1

        if kind == "section":
            headings.append(
                {
                    "letter": number,
                    "title": section_title(heading),
                    "gpos": line["gpos"],
                    "part": bool(PART_RE.match(text)),
                }
            )
            current_section = {"heading": heading, "topics": []}
            sections.append(current_section)
            previous_topic = None
            continue

        # A topic often reads "Topic: descriptor". Keep the topic name and
        # move the descriptor into the notes so the name stays short.
        heading, descriptor = split_heading_colon(heading)

        # Topic: collect the items that belong to it. A topic owns every
        # line up to the next heading, however deeply those lines are
        # indented, including any that run onto the next page.
        items = [descriptor] if descriptor else []
        band_bottom = None
        for k in range(j, len(left)):
            nxt = left[k]["text"]
            if NOISE_RE.match(nxt):
                continue
            next_kind, next_number, _next_rest = classify(nxt, mode, left[k]["x0"], indent)
            next_kind = demote_bare_roman(next_kind, nxt, mode, number)
            if next_kind in ("section", "topic"):
                bogus = (
                    next_kind == "topic"
                    and (
                        is_citation(_next_rest)
                        or (mode == "numeric" and not plausible_topic(next_number, number))
                    )
                )
                if not bogus:
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
            "gpos": line["gpos"],
            "items": merge_items([{"text": t} for t in items]),
            "objectives": merge_items([{"text": t} for t in objectives]),
        }
        if current_section is None:
            current_section = {"heading": "Syllabus", "topics": []}
            sections.append(current_section)
        current_section["topics"].append(topic)
        previous_topic = number

    return {
        "subject": meta["name"],
        "key": meta["key"],
        "source": meta["url"],
        "preamble": preamble,
        "prose": prose_lines,
        "headings": headings,
        "sections": sections,
        "notes": notes,
        "cutoff": cutoff,
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

