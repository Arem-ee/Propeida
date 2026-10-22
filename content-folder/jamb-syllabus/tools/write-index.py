"""Write the corpus index for the JAMB syllabus collection."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
summary = json.loads((ROOT / "_index.json").read_text(encoding="utf-8"))
manifest = {m["key"]: m for m in json.loads((ROOT / "pdfs" / "_manifest.json").read_text(encoding="utf-8"))}

order = [
    "english",
    "mathematics",
    "physics",
    "chemistry",
    "biology",
    "agricultural-science",
    "economics",
    "commerce",
    "principles-of-accounts",
    "government",
    "geography",
    "history",
    "literature-in-english",
    "christian-religious-studies",
    "islamic-studies",
    "home-economics",
    "computer-studies",
    "physical-and-health-education",
    "art",
    "music",
    "french",
    "arabic",
    "hausa",
    "igbo",
    "yoruba",
]
rank = {k: i for i, k in enumerate(order)}
rows = sorted(summary, key=lambda s: rank.get(s["key"], 999))

out = []
out.append("# JAMB UTME Syllabus Collection")
out.append("")
out.append(
    "The official JAMB UTME syllabus for all 25 subjects, extracted from the "
    "Joint Admissions and Matriculation Board's own Integrated Brochure & "
    "Syllabus System (IBASS)."
)
out.append("")
out.append(
    "> **Propeida is not affiliated with JAMB.** These files are preparation "
    "material extracted from official JAMB publications. They are not JAMB "
    "publications, and nothing here is a promise of an admission outcome."
)
out.append("")
out.append("## How this was built")
out.append("")
out.append("1. The PDFs in `pdfs/` were downloaded from JAMB's own servers at "
           "`ibass.jamb.gov.ng`. Those URLs carry a build hash, so they change "
           "when JAMB redeploys. The files are kept here to make the extraction "
           "reproducible.")
out.append("2. `tools/extract-syllabi.py` reads each PDF's two-column table "
           "(TOPICS/CONTENTS on the left, OBJECTIVES on the right), pairs each "
           "topic with its objectives by vertical band, and writes one "
           "markdown file per subject.")
out.append("3. `tools/validate-syllabi.py` cross-checks the result against the "
           "PDFs' own bold headings.")
out.append("")
out.append("Re-run with:")
out.append("")
out.append("```")
out.append("python tools/extract-syllabi.py     # rebuild the markdown")
out.append("python tools/validate-syllabi.py     # check against the source")
out.append("```")
out.append("")
out.append("## Subjects")
out.append("")
out.append("| Subject | Sections | Topics | Sub-items | Objectives | File |")
out.append("|---|---:|---:|---:|---:|---|")
for s in rows:
    out.append(
        f"| {s['subject']} | {s['sections']} | {s['topics']} | {s['sub_items']} | "
        f"{s['objectives']} | [`{s['key']}.md`]({s['key']}.md) |"
    )
out.append("")
out.append(
    f"**Total: {len(rows)} subjects, "
    f"{sum(s['topics'] for s in rows)} topics, "
    f"{sum(s['sub_items'] for s in rows)} sub-items, "
    f"{sum(s['objectives'] for s in rows)} objectives.**"
)
out.append("")
out.append("## Source documents")
out.append("")
out.append("| Subject | Official PDF |")
out.append("|---|---|")
for s in rows:
    out.append(f"| {s['subject']} | [{manifest[s['key']]['url']}]({manifest[s['key']]['url']}) |")
out.append("")
out.append("## Notes on the extraction")
out.append("")
out.append(
    "- Each subject file lists the general objectives, then every section, "
    "topic, sub-item and objective in the order JAMB prints them."
)
out.append(
    "- A few physics formulas come through in a garbled reading order. The "
    "Greek letters and bracket pieces are restored, but fractions in the "
    "source PDFs are drawn as stacked glyphs that text extraction cannot "
    "reassemble. The topic text around them is correct."
)
out.append(
    "- Where JAMB's PDF prints a formula, the topic line still describes the "
    "concept, which is what the lesson content is written from."
)
out.append("")

(ROOT / "index.md").write_text("\n".join(out), encoding="utf-8", newline="\n")
print("wrote index.md", len("\n".join(out)), "bytes")
