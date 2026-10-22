import json, pathlib
d = json.loads(pathlib.Path(r"content-folder\english-section-a.json").read_text(encoding="utf-8"))
print("lessons:", len(d["lessons"]))
ok = True
for L in d["lessons"]:
    types = {}
    for b in L["blocks"]:
        types[b["type"]] = types.get(b["type"], 0) + 1
        if b["type"] == "text":
            c = b["content"]
            assert c.get("paragraphs") and c.get("bullets") is not None, f"{L['slug']} text missing paragraphs"
        if b["type"] == "passage":
            c = b["content"]
            assert c["paragraphs"] and c["questions"], f"{L['slug']} passage empty"
            for q in c["questions"]:
                assert len(q["options"]) == 4, f"{L['slug']} options != 4"
                assert q["answer"] in ["A","B","C","D"], f"{L['slug']} bad answer"
                assert q.get("evidenceStrings"), f"{L['slug']} no evidence"
    print(f"  {L['slug']:<26} blocks={len(L['blocks']):>2} {types}")
print("\nJSON OK")
