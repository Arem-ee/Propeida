"""Export the extracted JAMB syllabi as a structured JSON tree.

extract-syllabi.py already builds `sections -> topics -> items/objectives`,
but render_markdown() flattens most of that back into prose. The curriculum
spine needs the tree, so this script re-runs the same extraction and writes
`structured/<key>.json` without touching the committed markdown.

Section recovery: JAMB puts section headings either in the page prose
("A: VARIETY OF ORGANISMS", "PHYSICAL GEOGRAPHY") or, occasionally, inside
the table ("D: HEREDITY AND VARIATIONS"). Both are collected by the extractor.
Where a heading is missing, a numbering reset still marks a new section, so
the section is kept under an inferred letter and its title is left as a
placeholder for curation.

Usage:
  python content-folder/jamb-syllabus/tools/export-structured.py
  python content-folder/jamb-syllabus/tools/export-structured.py biology
"""
import importlib.util
import json
import re
import sys
from pathlib import Path

import pdfplumber

WORK = Path(__file__).resolve().parent
ROOT = WORK.parent
PDF_DIR = ROOT / "pdfs"
OUT_DIR = ROOT / "structured"

GENERIC_TITLES = {"syllabus", "core", "detailed syllabus"}
PART_HEADING_RE = re.compile(r"^\s*PART\s+[IVXLC0-9]+\b", re.IGNORECASE)
PAGE_RANGE_RE = re.compile(r"\b\d+\s*[-–]\s*\d+\s*$")

# Two source defects worth correcting in the spine (the PDF text is wrong).
TOPIC_TITLE_FIXES = {
    ("physics", "37"): "Conduction of Electricity Through Liquids and Gases",
}
SECTION_TITLE_FIXES = {
    "Agriculture Economics and Extension": "Agricultural Economics and Extension",
}


def load_extractor():
    spec = importlib.util.spec_from_file_location("extract_syllabi", WORK / "extract-syllabi.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def slugify(text):
    text = text.lower().replace("&", " and ")
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-") or "section"


def tidy(title):
    title = re.sub(r"\s+", " ", title).strip(" .,:;-")
    title = re.sub(r"(?<=[A-Za-z])-\s+(?=[A-Za-z])", "-", title)
    title = re.sub(r"\s*&\s*", " & ", title)
    title = re.sub(r"\s+Examples of$", "", title, flags=re.IGNORECASE)
    return title.strip()


def sequence_value(number):
    """Numeric order of a topic number: 3, '2a', 'B' all have one."""
    text = str(number).strip().upper()
    match = re.match(r"^(\d+)", text)
    if match:
        return int(match.group(1))
    if len(text) == 1 and text.isalpha():
        return ord(text) - ord("A") + 1
    return None


TEXTS_HEADING_RE = re.compile(
    r"(RECOMMENDED\s+TEXTS?|LIST\s+OF\s+SET\s+TEXTS?|PRESCRIBED\s+TEXTS?|"
    r"FURTHER\s+READING|REFERENCES)\b",
    re.IGNORECASE,
)


def collect_headings(raw, cutoff=None):
    """All real section headings in document order, letters resolved.

    Some PDFs repeat the section list above the detailed table, so a title can
    appear twice; the copy nearest the topics (the later one) is kept. Headings
    that belong to the recommended-texts appendix are dropped.
    """
    items = []
    for heading in sorted(raw, key=lambda h: h["gpos"]):
        if cutoff is not None and heading["gpos"] >= cutoff:
            continue
        title = tidy(heading.get("title", ""))
        letter = heading.get("letter")
        if not title:
            # Some PDFs print only "SECTION A" and leave the title implicit.
            if not letter:
                continue
            title = f"SECTION {letter}"
        if title.lower() in GENERIC_TITLES or title.upper().endswith("SYLLABUS"):
            continue
        if TEXTS_HEADING_RE.search(title):
            continue
        items.append(
            {
                "letter": letter,
                "title": title,
                "gpos": heading["gpos"],
                "part": bool(heading.get("part")),
            }
        )

    # A syllabus that names real sections does not also use PART dividers as
    # sections (History); one that only has PARTs does (Government).
    if any(not item["part"] for item in items):
        items = [item for item in items if not item["part"]]

    last_index = {}
    for index, item in enumerate(items):
        last_index[item["title"].casefold()] = index
    items = [
        item for index, item in enumerate(items) if last_index[item["title"].casefold()] == index
    ]

    used = {item["letter"] for item in items if item["letter"]}
    next_letter = 0
    for item in items:
        if item["letter"]:
            continue
        while chr(ord("A") + next_letter) in used:
            next_letter += 1
        item["letter"] = chr(ord("A") + next_letter)
        used.add(item["letter"])
        next_letter += 1
    return items


def dedupe_headings(headings):
    """First occurrence of each letter, in document order."""
    seen = set()
    out = []
    for heading in headings:
        if heading["letter"] in seen:
            continue
        seen.add(heading["letter"])
        out.append(heading)
    return out


def collapse_set_texts(topics):
    """Turn a run of page-referenced set texts into one topic with items.

    Igbo lists twenty prescribed poems as numbered lines with page ranges.
    They are reading material for the literature topic, not twenty topics.
    """
    out = []
    group = []

    def flush():
        if not group:
            return
        out.append(
            {
                "number": str(len(out) + 1),
                "title": "Selected Poems (Abụ Ndị A Họpụtara)",
                "gpos": group[0]["gpos"],
                "items": [t["title"] for t in group]
                + [item for t in group for item in t.get("items", [])],
                "objectives": [],
            }
        )
        group.clear()

    for topic in topics:
        if PAGE_RANGE_RE.search(topic["title"]):
            group.append(topic)
        else:
            flush()
            out.append(topic)
    flush()
    return out



def assign_sections(topics, headings):
    """Group topics under the section heading that precedes them.

    JAMB restarts topic numbering inside a section (Igbo lists twenty set poems
    as 1..20 before the customs topics restart at 1), so a numbering reset is
    not a section boundary. The printed headings are the boundary. A heading
    letter can repeat when a syllabus has two parts (History), so repeated
    letters are given the next free letter while keeping their real title.
    """
    ordered = sorted(headings, key=lambda h: h["gpos"])
    if topics:
        first_topic = topics[0]["gpos"]
        pre = [h for h in ordered if h["gpos"] < first_topic]
        # A syllabus sometimes repeats its section list above the detailed
        # table. Drop that list, but keep the heading that sits with the
        # first topic (the last one before it).
        if len(pre) > 1 and len({h["gpos"] // 100000 for h in pre}) == 1:
            dropped = {id(h) for h in pre[:-1]}
            ordered = [h for h in ordered if id(h) not in dropped]
    used = set()
    for heading in ordered:
        letter = heading.get("letter")
        if not letter or letter in used:
            letter = next(
                (chr(ord("A") + n) for n in range(26) if chr(ord("A") + n) not in used),
                "?",
            )
        heading["letter"] = letter
        used.add(letter)

    sections = []
    current = None
    heading_index = 0
    for topic in topics:
        while heading_index < len(ordered) and ordered[heading_index]["gpos"] <= topic["gpos"]:
            current = {
                "letter": ordered[heading_index]["letter"],
                "title": ordered[heading_index]["title"],
                "topics": [],
            }
            sections.append(current)
            heading_index += 1
        if current is None:
            current = {"letter": "A", "title": "Core", "topics": []}
            sections.append(current)
        current["topics"].append(topic)

    return [section for section in sections if section["topics"]]


def main():
    extractor = load_extractor()
    subjects = json.loads((PDF_DIR / "_manifest.json").read_text(encoding="utf-8"))
    only = sys.argv[1] if len(sys.argv) > 1 else None

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    summary = []

    for meta in subjects:
        if only and only != meta["key"]:
            continue
        pdf_path = PDF_DIR / f"{meta['key']}.pdf"
        if not pdf_path.exists():
            print(f"MISSING PDF {meta['key']}")
            continue

        with pdfplumber.open(pdf_path) as doc:
            data = extractor.build_subject(doc, meta)

        topics = []
        for section in data["sections"]:
            for topic in section["topics"]:
                topics.append(topic)
        topics.sort(key=lambda t: t["gpos"])

        headings = collect_headings(data.get("headings", []), data.get("cutoff"))
        labelled = assign_sections(topics, headings)

        seen_slugs = set()
        sections = []
        for segment in labelled:
            section_title_text = SECTION_TITLE_FIXES.get(segment["title"], segment["title"])
            key = "core" if section_title_text.lower() in GENERIC_TITLES else slugify(section_title_text)
            section_topics = []
            used_numbers = set()
            max_number = 0
            for topic in collapse_set_texts(segment["topics"]):
                number = str(topic["number"])
                if number.isdigit():
                    value = int(number)
                    if value in used_numbers:
                        value = max_number + 1
                        number = str(value)
                    used_numbers.add(value)
                    max_number = max(max_number, value)
                title = tidy(topic["title"])
                title = TOPIC_TITLE_FIXES.get((meta["key"], number), title)
                base = slugify(title)
                slug = base
                n = 2
                while slug in seen_slugs:
                    slug = f"{base}-{n}"
                    n += 1
                seen_slugs.add(slug)
                section_topics.append(
                    {
                        "slug": slug,
                        "number": number,
                        "title": title,
                        "items": [tidy(i) for i in topic["items"] if tidy(i)],
                        "objectives": [tidy(o) for o in topic["objectives"] if tidy(o)],
                    }
                )
            sections.append(
                {
                    "key": key,
                    "letter": segment["letter"],
                    "title": section_title_text,
                    "topics": section_topics,
                }
            )

        out = {
            "key": meta["key"],
            "subject": meta["name"],
            "source": meta["url"],
            "sections": sections,
        }
        (OUT_DIR / f"{meta['key']}.json").write_text(
            json.dumps(out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
        )

        topic_count = sum(len(s["topics"]) for s in sections)
        item_count = sum(len(t["items"]) for s in sections for t in s["topics"])
        objective_count = sum(len(t["objectives"]) for s in sections for t in s["topics"])
        summary.append(
            {
                "key": meta["key"],
                "sections": len(sections),
                "topics": topic_count,
                "items": item_count,
                "objectives": objective_count,
            }
        )
        print(
            f"{meta['name']:<34} sections={len(sections):>2} topics={topic_count:>3} "
            f"items={item_count:>4} objectives={objective_count:>4}"
        )

    if not only:
        (OUT_DIR / "_index.json").write_text(
            json.dumps(summary, indent=2) + "\n", encoding="utf-8"
        )
        print(
            f"\nTOTAL {len(summary)} subjects, {sum(s['topics'] for s in summary)} topics, "
            f"{sum(s['items'] for s in summary)} items, "
            f"{sum(s['objectives'] for s in summary)} objectives"
        )


if __name__ == "__main__":
    main()
