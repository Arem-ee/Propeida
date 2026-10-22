import json, pathlib
d = json.loads(pathlib.Path(r"content-folder\english-section-a.json").read_text(encoding="utf-8"))
bad = []
for L in d["lessons"]:
    for b in L["blocks"]:
        if b["type"] != "passage": continue
        paras = b["content"]["paragraphs"]
        for qi, q in enumerate(b["content"]["questions"]):
            for e in q["evidenceStrings"]:
                p = e["paragraph"]
                if p >= len(paras):
                    bad.append((L["slug"], qi, p, "PARAGRAPH OUT OF RANGE", e["text"])); continue
                if e["text"] not in paras[p]:
                    bad.append((L["slug"], qi, p, "NOT FOUND", e["text"]))
            # also: every question needs at least one evidence item
            if not q["evidenceStrings"]:
                bad.append((L["slug"], qi, -1, "NO EVIDENCE", q["question"][:40]))
if bad:
    for b in bad: print("  BAD:", b)
else:
    print("all evidence strings resolve")
