# English JAMB inventory — exclusions ledger

Companion to `docs/content-audit.md`.  Lists the categories of records in
`content-folder/english-jamb-staged-clean-v3.json` that are permanently
excluded from any JAMB English seed or downstream import.  Source of
truth for every excluded record is the JSON itself, which carries:

* `"quarantine": true`
* `"quarantineReason"` — a short note naming the defect
* `"exclusionClass"` — set by this ledger (if populated)

## Prescribed-novel exclusions (decision 2026-11-12)

Study of today's JAMB (2026) prescribed text — _The Lekki Headmaster_ —
shows the papers use a _current_ novel, not old ones.  The obsolete
literature used in these papers is not examinable for current students
and is excluded permanently:

* Chukwuemeka Ike — *The Potter's Wheel*  (2003 and 2013 — Obu, Samuel, the
  Fallen Goliath, Teacher, coffin/pad)
* Jerry Agada      — *The Successors*      (2013 – 2015; the novel used as comprehension text)
* S. L. Manyika     — *IN DEPENCE*           (2017; Tayo, Kayode, Vanessa, Edward)
* A. H. Mohammed    — *The Last Days at
  Forcados High School*                      (2015; Efua, Jimi, Nene, Ansa, Mr Malium)

All questions that require the student to know these texts live in
`"exclusionClass": "obsolete-novels"` — **34 records** in the staged
inventory, all of them already quarantined.  They are never to be used to
train English comprehension and are retained only in a non-importable
marker carrying the exact reason code.

## Other permanent exclusions

(from the same audit, still quarantined)

* **Phonology items** whose task instruction (rhyme / stress / sound) is missing or ambiguous.
* **Option sets fused from unrelated questions** (lexical mismatch — e.g. answer texts swallowed by the question stem, or option arrays picked up from the following item).
* **Passage absent from source dump** (music-related items in 2013,
  2017 items whose passage was truncated by the PDF emitter).
* **2018 paper fragments** whose answer text was swallowed by the stem.
* A handful of miscellaneous items whose only option choice is absent,
  or whose stem requires details of an external source we never had.

Each of these is in quarantine.  **The production importer must drop any
quarantine record regardless of other metadata.**  The only way a
quarantine flag is cleared is a verified answer derived from a verbatim
source passage held on file.  Flags never come off by a bare instruction
to "add it back anyway".

## Schema / audit keys

QA audit above these exclusions confirms **zero defects** in the 4,090
solved records.  See `docs/propeida-product-requirements.md` for the
full inventory expectations.
