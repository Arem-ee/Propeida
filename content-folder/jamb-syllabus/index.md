# JAMB UTME Syllabus Collection

The official JAMB UTME syllabus for all 25 subjects, extracted from the Joint Admissions and Matriculation Board's own Integrated Brochure & Syllabus System (IBASS).

> **Propeida is not affiliated with JAMB.** These files are preparation material extracted from official JAMB publications. They are not JAMB publications, and nothing here is a promise of an admission outcome.

## How this was built

1. The PDFs in `pdfs/` were downloaded from JAMB's own servers at `ibass.jamb.gov.ng`. Those URLs carry a build hash, so they change when JAMB redeploys. The files are kept here to make the extraction reproducible.
2. `tools/extract-syllabi.py` reads each PDF's two-column table (TOPICS/CONTENTS on the left, OBJECTIVES on the right), pairs each topic with its objectives by vertical band, and writes one markdown file per subject.
3. `tools/validate-syllabi.py` cross-checks the result against the PDFs' own bold headings.

Re-run with:

```
python tools/extract-syllabi.py     # rebuild the markdown
python tools/validate-syllabi.py     # check against the source
```

## Subjects

| Subject | Sections | Topics | Sub-items | Objectives | File |
|---|---:|---:|---:|---:|---|
| Use of English | 1 | 3 | 23 | 12 | [`english.md`](english.md) |
| Mathematics | 5 | 22 | 78 | 65 | [`mathematics.md`](mathematics.md) |
| Physics | 1 | 35 | 337 | 320 | [`physics.md`](physics.md) |
| Chemistry | 1 | 17 | 115 | 226 | [`chemistry.md`](chemistry.md) |
| Biology | 1 | 22 | 148 | 160 | [`biology.md`](biology.md) |
| Agricultural Science | 2 | 41 | 158 | 147 | [`agricultural-science.md`](agricultural-science.md) |
| Economics | 1 | 23 | 124 | 132 | [`economics.md`](economics.md) |
| Commerce | 1 | 16 | 110 | 109 | [`commerce.md`](commerce.md) |
| Principles of Accounts | 1 | 18 | 108 | 82 | [`principles-of-accounts.md`](principles-of-accounts.md) |
| Government | 1 | 33 | 85 | 76 | [`government.md`](government.md) |
| Geography | 5 | 23 | 76 | 122 | [`geography.md`](geography.md) |
| History | 7 | 42 | 148 | 140 | [`history.md`](history.md) |
| Literature-in-English | 1 | 4 | 36 | 3 | [`literature-in-english.md`](literature-in-english.md) |
| Christian Religious Studies | 4 | 58 | 122 | 185 | [`christian-religious-studies.md`](christian-religious-studies.md) |
| Islamic Studies | 1 | 20 | 158 | 142 | [`islamic-studies.md`](islamic-studies.md) |
| Home Economics | 4 | 25 | 130 | 154 | [`home-economics.md`](home-economics.md) |
| Computer Studies | 7 | 36 | 113 | 223 | [`computer-studies.md`](computer-studies.md) |
| Physical and Health Education | 5 | 32 | 129 | 121 | [`physical-and-health-education.md`](physical-and-health-education.md) |
| Art | 4 | 13 | 37 | 35 | [`art.md`](art.md) |
| Music | 12 | 49 | 80 | 76 | [`music.md`](music.md) |
| French | 1 | 6 | 40 | 18 | [`french.md`](french.md) |
| Arabic | 5 | 21 | 45 | 24 | [`arabic.md`](arabic.md) |
| Hausa | 3 | 22 | 75 | 113 | [`hausa.md`](hausa.md) |
| Igbo | 4 | 61 | 28 | 78 | [`igbo.md`](igbo.md) |
| Yoruba | 1 | 3 | 41 | 44 | [`yoruba.md`](yoruba.md) |

**Total: 25 subjects, 645 topics, 2544 sub-items, 2807 objectives.**

## Source documents

| Subject | Official PDF |
|---|---|
| Use of English | [https://ibass.jamb.gov.ng/static/media/Use-of-English.885e843b1f51e6a3d062.pdf](https://ibass.jamb.gov.ng/static/media/Use-of-English.885e843b1f51e6a3d062.pdf) |
| Mathematics | [https://ibass.jamb.gov.ng/static/media/Mathematics.c0621f4b8b674e75fd05.pdf](https://ibass.jamb.gov.ng/static/media/Mathematics.c0621f4b8b674e75fd05.pdf) |
| Physics | [https://ibass.jamb.gov.ng/static/media/Physics.16527a294cb7e7a87a35.pdf](https://ibass.jamb.gov.ng/static/media/Physics.16527a294cb7e7a87a35.pdf) |
| Chemistry | [https://ibass.jamb.gov.ng/static/media/Chemistry.9efd0b98043d56922aaa.pdf](https://ibass.jamb.gov.ng/static/media/Chemistry.9efd0b98043d56922aaa.pdf) |
| Biology | [https://ibass.jamb.gov.ng/static/media/Biology.0075e70afd357d7a39ae.pdf](https://ibass.jamb.gov.ng/static/media/Biology.0075e70afd357d7a39ae.pdf) |
| Agricultural Science | [https://ibass.jamb.gov.ng/static/media/AgricPdf.9465f3cd595e9542868a.pdf](https://ibass.jamb.gov.ng/static/media/AgricPdf.9465f3cd595e9542868a.pdf) |
| Economics | [https://ibass.jamb.gov.ng/static/media/Economics.da2a30ae8659e29c8bb4.pdf](https://ibass.jamb.gov.ng/static/media/Economics.da2a30ae8659e29c8bb4.pdf) |
| Commerce | [https://ibass.jamb.gov.ng/static/media/Commerce.819d9c6929bc849d1cd9.pdf](https://ibass.jamb.gov.ng/static/media/Commerce.819d9c6929bc849d1cd9.pdf) |
| Principles of Accounts | [https://ibass.jamb.gov.ng/static/media/Principles-of-Accounting.64fc902ad37449d1f6ff.pdf](https://ibass.jamb.gov.ng/static/media/Principles-of-Accounting.64fc902ad37449d1f6ff.pdf) |
| Government | [https://ibass.jamb.gov.ng/static/media/Government.92e42612590a98eeba28.pdf](https://ibass.jamb.gov.ng/static/media/Government.92e42612590a98eeba28.pdf) |
| Geography | [https://ibass.jamb.gov.ng/static/media/Geography.0bf33e33f48e4139be13.pdf](https://ibass.jamb.gov.ng/static/media/Geography.0bf33e33f48e4139be13.pdf) |
| History | [https://ibass.jamb.gov.ng/static/media/History.64d0bbe89bb7585bcddc.pdf](https://ibass.jamb.gov.ng/static/media/History.64d0bbe89bb7585bcddc.pdf) |
| Literature-in-English | [https://ibass.jamb.gov.ng/static/media/Literature.f24a00818658eb8ecbd0.pdf](https://ibass.jamb.gov.ng/static/media/Literature.f24a00818658eb8ecbd0.pdf) |
| Christian Religious Studies | [https://ibass.jamb.gov.ng/static/media/CRS.7f96f8e535ca408ca474.pdf](https://ibass.jamb.gov.ng/static/media/CRS.7f96f8e535ca408ca474.pdf) |
| Islamic Studies | [https://ibass.jamb.gov.ng/static/media/Islamic.973a07ea012af6554ed3.pdf](https://ibass.jamb.gov.ng/static/media/Islamic.973a07ea012af6554ed3.pdf) |
| Home Economics | [https://ibass.jamb.gov.ng/static/media/Home-Economics.89dc0fce33c5910e66c6.pdf](https://ibass.jamb.gov.ng/static/media/Home-Economics.89dc0fce33c5910e66c6.pdf) |
| Computer Studies | [https://ibass.jamb.gov.ng/static/media/Computer.ea1ead8cea82f53d3717.pdf](https://ibass.jamb.gov.ng/static/media/Computer.ea1ead8cea82f53d3717.pdf) |
| Physical and Health Education | [https://ibass.jamb.gov.ng/static/media/PHE.d3add6c626efcb3f0f2b.pdf](https://ibass.jamb.gov.ng/static/media/PHE.d3add6c626efcb3f0f2b.pdf) |
| Art | [https://ibass.jamb.gov.ng/static/media/Artpdf.85197ba4c495458e1ba8.pdf](https://ibass.jamb.gov.ng/static/media/Artpdf.85197ba4c495458e1ba8.pdf) |
| Music | [https://ibass.jamb.gov.ng/static/media/Music.6a7142057d840d45959d.pdf](https://ibass.jamb.gov.ng/static/media/Music.6a7142057d840d45959d.pdf) |
| French | [https://ibass.jamb.gov.ng/static/media/French.170eeaabf96471e303c5.pdf](https://ibass.jamb.gov.ng/static/media/French.170eeaabf96471e303c5.pdf) |
| Arabic | [https://ibass.jamb.gov.ng/static/media/Arabic.233fe7117fc534609a6e.pdf](https://ibass.jamb.gov.ng/static/media/Arabic.233fe7117fc534609a6e.pdf) |
| Hausa | [https://ibass.jamb.gov.ng/static/media/Hausa.ca90bfcfca9f88527acf.pdf](https://ibass.jamb.gov.ng/static/media/Hausa.ca90bfcfca9f88527acf.pdf) |
| Igbo | [https://ibass.jamb.gov.ng/static/media/Igbo.7a09449bbeefc39b4f44.pdf](https://ibass.jamb.gov.ng/static/media/Igbo.7a09449bbeefc39b4f44.pdf) |
| Yoruba | [https://ibass.jamb.gov.ng/static/media/Yoruba.c9f0848e61ff86f1349b.pdf](https://ibass.jamb.gov.ng/static/media/Yoruba.c9f0848e61ff86f1349b.pdf) |

## Notes on the extraction

- Each subject file lists the general objectives, then every section, topic, sub-item and objective in the order JAMB prints them.
- A few physics formulas come through in a garbled reading order. The Greek letters and bracket pieces are restored, but fractions in the source PDFs are drawn as stacked glyphs that text extraction cannot reassemble. The topic text around them is correct.
- Where JAMB's PDF prints a formula, the topic line still describes the concept, which is what the lesson content is written from.
