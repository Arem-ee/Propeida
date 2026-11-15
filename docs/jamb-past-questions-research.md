# Public access to JAMB past questions

Research date: 2 November 2026. Scope: what is publicly accessible, whether it can be
used, how good it is, and what that means for Propeida's question bank.

This is a product and sourcing assessment, not legal advice. Before any commercial
launch that republishes past papers, take Nigerian IP counsel's opinion.

## Bottom line

There is **no official JAMB past-question archive**. JAMB publishes the syllabus and
brochure, CBT manuals and centre software, not past papers. Everything marketed as
"JAMB past questions" is a third-party compilation, an app, or a commercial API.

Public access is **not** a licence. Exam papers are literary works owned by JAMB or its
examiners, and the Copyright Act 2022 gives government works 50 years of protection.
The exam and instruction exceptions do not cover selling or republishing the papers in a
commercial product, and the FOI Act expressly lets a public institution withhold test
questions and scoring keys.

The free material is also **incomplete and damaged**. Coverage clusters in 1983-2004 and
2010-2018; 2019-2026 is not reliably public. Old papers use five options where current
UTME uses four. Answer keys in third-party compilations are frequently wrong. Our own
parsed corpus is 15,013 rows but only 1,284 carry an answer, and the text has hundreds of
known extraction defects. It also covers only **11 of the 25 subjects**; 14 subjects have
no parsed past questions at all.

**Recommendation: use past papers as an internal reference corpus, not as shippable
content. Author and hand-verify original items against the syllabus. Licence a dataset
only if the vendor can prove chain of title from JAMB and grant commercial display,
storage and modification rights with indemnity.** Keep a provenance register so the
"checked by hand" claim stays true.

## What "public access" actually means

### Official JAMB channels

| Channel | What it publishes | Past questions? |
|---|---|---|
| `jamb.gov.ng` | Syllabus/brochure links, CBT manuals, JAMBTEST centre installers, bulletins, CAPS/eFacility | No archive. "Past questions" appears only as study advice in a 2025 bulletin. |
| `ibass.jamb.gov.ng` | Integrated Brochure and Syllabus System: entry requirements, subject syllabi, set texts, exam organisation | No question archive. |
| `learn.jamb.gov.ng` | JAMB LMS: login-based teaching/test authoring for institutions | No public paper archive. |
| JAMBTEST downloads | CBT delivery software and manuals for accredited centres | Centre software, not candidate practice material. |
| JAMB Archives / Publications | Corporate publications and reports | No past-paper collection indexed there. |

JAMB's own CBT manual describes the delivery system and candidate instructions, not a
public question bank. The Board has never, on the evidence checked, published a
year-by-year past-paper archive or an official answer-key set.

### Free web and PDF sources

These are the sources learners actually find. All are third-party.

| Source | Claimed coverage | Format | Access conditions | Main risk |
|---|---|---|---|---|
| Iyierioba | 1983-2025, 12+ subjects | PDF, per subject | Direct page / Google Drive | Claims years it may not actually hold; no key provenance |
| CampusNinja | 15 subjects, multi-year and single-year files | PDF via Google Drive | Free | Says it has "not authenticated every question or checked every supplied answer" |
| EduPadi | Multi-subject PDFs | PDF | Free/blog | Compilation of unknown origin |
| Awajis, SchoolNews, MySchoolGist | Multi-subject packs | PDF | Free/blog | Recycled files; labels often wrong |
| Assessly | JAMB Mathematics 2015-2024, other packs | PDF packs | Free during early launch | New site; no verification statement |
| Jambite, PassJAMB, Acelume, JAMBFit | Multi-subject practice | Web/PDF | Free or freemium | PassJAMB itself warns of wrong keys, recycled WAEC/NECO content and outdated formats |
| JAMB Pro app | 16,000+ questions, 16 subjects | Offline app | Free, no sign-up | Closed corpus; no provenance or licence statement |
| Myschool | ~70,000 questions | Web/app | Paid | Largest commercial compilation; no chain of title shown |

Typical defects in this tier: scanned pages with OCR noise, missing diagrams, fused
options, empty option slots, answer sections that do not line up with question numbers,
and year labels that are marketing rather than fact. Many "2025" files are re-badged older
papers.

### Commercial APIs and datasets

| Source | Claimed coverage | Delivery | Licence position |
|---|---|---|---|
| SdashAPI | 25 subjects, 1988-2026, metadata, images, explanations | JSON/CSV/SQL, API | Developer terms allow API use but forbid raw dataset redistribution/mirroring; permanent or offline use needs a separate Dataset Licence; content "as is"; not affiliated with JAMB |
| ALOC | 20,000 questions, 2001-2020, UTME/WASSCE/Post-UTME | API | Free tier ~7,000 calls; legacy endpoints announced end-of-life 12 months from 1 Aug 2026, successor `aloc.com.ng` |
| MyQuest API, Class54, PrepPlug | Subject packs / APIs | API/PDF | Commercial; terms vary, provenance rarely disclosed |
| Hugging Face `remi54/Jamb-ai-dataset` | 254 rows | Dataset | No dataset card, no licence; old five-option format |
| GitHub `Seunope/aloc-endpoints` | ALOC client/docs | Code | Not a data dump; no rights to the questions |

An API licence is not the same as a copyright licence. A vendor can license its database
and still lack the right to license JAMB's question text. That is the central due-diligence
question, and most vendors do not answer it publicly.

## Legal position

### Copyright

- Exam questions are literary works under the Copyright Act 2022.
- **Section 7** confers copyright on works made by or under the direction or control of
  government, a government agency or a prescribed international body. JAMB is a federal
  agency; its papers are likely government works, with examiners' contributions assigned
  or commissioned.
- **Section 19(1)(b)** gives works deriving from section 7 a term of **50 years** after
  the end of the year the work was first made available to the public, or 50 years after
  creation if not published within that time. Papers from 1983-2004 are still in copyright.
- **Section 3(5)** says copyright in a compilation does not confer an exclusive right in
  the pre-existing material. A site's "compiled by" notice does not make its questions
  its own.
- **Section 20** fair dealing covers private use, non-commercial research and private
  study, criticism/review and quotation. Reading and analysing past papers internally is
  defensible. Republishing them in a paid or lead-generating product is not
  "non-commercial research".
- **Section 21(3)** says copyright is not infringed by anything done for the purposes of
  an examination by way of setting, communicating or answering questions. This is an
  exam-administration exception, not a publishing licence. **Section 24(1)** then treats a
  copy authorised under section 21 as an infringing copy if it is subsequently sold,
  offered for sale or rented. A commercial question bank sits on the wrong side of that
  line.
- **Section 21(1)** allows copying in the course of instruction or preparation for
  instruction, but only where the copying is not by a reprographic process. That does not
  authorise digitising and serving a paper bank.

### Freedom of Information

FOI Act 2011 **section 19(1)(a)** lets a public institution deny an application for
"test questions, scoring keys and other examination data used to administer an academic
examination". Section 19(2) has a public-interest override, but it is discretionary and
litigation-backed. FOI is not a practical route to a question bank.

### Practical conclusion

1. **Free PDFs are not public domain.** Do not ingest them into the product.
2. **A third-party compiler cannot grant rights it does not own.** A paid API may reduce
   risk but does not eliminate it.
3. **Internal reference use is the safe harbour.** Read papers to learn style, topic
   frequency, trap design and difficulty; write new items.
4. **If licensing, demand chain of title.** Ask for the JAMB assignment/permission, the
   right to store and modify, commercial display rights, indemnity, audit rights, and
   continuity on termination. "As is" plus "not affiliated with JAMB" is not enough.

## Quality of the public material

### Coverage

- Free packs concentrate on 12-15 subjects. The 25-subject spine needs sources for Art,
  Arabic, French, Hausa, Igbo, History, Home Economics, Islamic Studies, Literature,
  Music, PHE, Yoruba and others that most free sites do not carry.
- Years cluster in **1983-2004** and **2010-2018**. 2019-2026 is not reliably public; some
  sites label old files with new years.
- **Format drift:** 1983-2004 papers can have five options (A-E); current UTME uses four
  (A-D). The 2026 mock shape is 180 questions in two hours: English 60 plus 40 in each of
  three other subjects. Old items cannot simply be re-keyed; they need rewriting.
- **Figure loss:** scanned papers drop diagrams, tables, graphs and circuit images. A
  question without its figure is unusable.

### Answer keys

Third-party keys are the weakest part. Concrete cases from our own audit work:

- 2018 Economics Q22 keyed the mean of `X 2 3 4 5 / F 2 5 2 1` at 2.5; the mean is 3.2.
- 2018 Economics Q23 keyed the median at 4; the median is 3.
- 2018 Economics Q32 called taxes and government expenditure "tax policy"; they are
  fiscal policy.
- 2014 Economics had an offset key; six keys were wrong and had to be corrected (Q9, Q13,
  Q21, Q28, Q30, Q47).
- 2020 Government Q19 keyed the UN Security Council presidency at one year; it is one
  month.
- 2020 Government Q24 keyed Abuja for NEPAD's adoption; it was Lusaka, 2001.
- The same UNSC error survives in 2018 Government Q2/Q3 and must not be published.

This is why the existing bank rejects rows rather than guessing. The Economics starter
vertical kept 70 published questions after auditing 2017/2018, 2014 and authored
foundations; the Government vertical kept 104 after auditing 2019/2020 and repairing or
rejecting damaged rows.

### Text corruption

Our rescue ledgers record the extraction damage in the owned PDFs:

| Subject | Short/damaged option rows | Fused markers | Fragment prefixes | Genuine option loss |
|---|---:|---:|---:|---:|
| CRK | 158 | 61 | 49 | 45 |
| Economics | 203 | 67 | 36 | 77 |
| Government | ~218 | 51 | 107 | 57 |

CRK also has a double-printed 1989 paper (100 rows for 50 questions), missing numbers
(1992 Q23/Q40, 1993 Q17, 2001 Q22, 2003 Q1, 2004 Q27) and duplicate rows. Economics has
five junk-number blocks, including three real lost questions, and missing numbers across
1987-2004. Mathematics is figure-heavy: 72 orphans, 36 dropped junk-number blocks and 38
duplicates. These are not cosmetic; a fused option can change the answer.

## What we already hold

Audit of `content-folder/_parsed/*.json` on 2 November 2026, excluding `_rejected-*`:

| Metric | Count |
|---|---:|
| Parsed rows across 16 files | 15,013 |
| Rows with at least 3 option strings | 14,720 (98%) |
| Rows with a non-empty answer | 1,284 (8.6%) |
| Rows after dropping the redundant 638-row English partial | ~14,375 |
| Answer coverage of the de-duplicated corpus | ~8.9% |
| Duplicate rows outside the English file | ~227 |
| Rows flagged `needs_figure` | 163 |
| Rows flagged `orphan` | 127 |

The English file's 2,999 repeated stems are mostly passage-linked questions sharing a
passage, not 2,999 duplicate items; they still need passage-aware de-duplication.

The keyed files are small: Government 2,051 rows / 832 keys, Economics 413 / 265,
Biology 282 / 104, Literature 317 / 83. The nine core booklets (Biology, Chemistry,
Commerce, CRK, Economics, Government, Mathematics, Physics, Accounts) are **keyless**:
8,230 rows with no answers at all. English is keyless too.

In other words: the public corpus gives us question *text* at volume, but not trustworthy
*answers*. The answers are the expensive part. That is exactly the work the existing
verticals already do by hand.

The live bank has 637 rows in total, but only **301 are published**: English 77,
Mathematics 50, Government 104 and Economics 70. The other 336 are drafts or rejected
legacy rows (Economics alone carries 172 rejects). The schema already has `status`,
`verified_state`, `verified_by/at`, `review_note` and an append-only `question_reviews`
trail, but **no provenance fields** for where an item came from or under what licence.

### Subject coverage is the real gap

The corpus is not spread across the 25-subject spine. It covers **11 subjects**:

English, Mathematics, Biology, Chemistry, Physics, Economics, Government, Commerce,
Christian Religious Studies, Literature in English and Principles of Accounts.

**Fourteen subjects have no parsed past questions at all** — and no live questions either:

Agricultural Science, Arabic, Art, Computer Studies, French, Geography, Hausa, History,
Home Economics, Igbo, Islamic Studies, Music, Physical and Health Education and Yoruba.

That is the constraint that matters. The 15,013 rows are enough raw material for the 11
covered subjects, but they do nothing for the 14 uncovered ones. For those, there is no
free JAMB archive to process: the options are NECO/WAEC papers (broader subject coverage,
different format), a licensed dataset that actually covers all 25 subjects, or authoring
from the syllabus.

## Options considered

### A. Licence a dataset and ingest at volume

**Pros:** fast coverage, metadata, explanations, images, 25 subjects, recent years.

**Cons:** cost; the vendor may not own the underlying rights; licences often forbid raw
storage, offline use or redistribution; "as is" shifts quality risk to us; every item
still needs independent key verification to keep the hand-checked claim true; lock-in and
termination risk.

**Verdict:** only with chain of title, commercial display/storage/modification rights,
indemnity and a paid pilot. Not a shortcut around verification.

### B. Reference-only, author original items

**Pros:** clean rights; matches the existing authoring standard and hand-checked claim;
items can be written to the syllabus, the 120-180 word lesson, the four-option format and
Nigerian examples; no dependency on a vendor; explanations are ours.

**Cons:** slow; needs subject writers and reviewers; volume is the bottleneck.

**Verdict:** the correct default. The existing 174-question bank proves the model works;
the constraint is reviewer throughput, not source availability.

### C. Hybrid: reference corpus plus licensed metadata

**Pros:** use past papers privately to map topic frequency and style; use a licensed
dataset only where rights are clear; author the rest; keep one provenance register.

**Cons:** two workflows; licence management; risk of drift between licensed and authored
items.

**Verdict:** the practical target. Reference-only is the default; licensing is an
exception with a contract, not a content strategy.

## Recommendation

1. **Do not bulk-import public PDFs straight into serving tables.** Download into a
   quarantine/reference area such as `content-folder/_parsed`, normalise and rewrite
   there, and keep the seeder away from it.
2. **Adopt a written sourcing policy:** every published item is either (a) authored by us,
   (b) licensed with documented chain of title, or (c) a paraphrased original inspired by
   a past-paper topic. No verbatim past question without a licence.
3. **Use the corpus for analysis, not display:** topic frequency by year, command words,
   distractor patterns, difficulty, and the topics JAMB repeats. That is legitimate
   reference use and improves coverage.
4. **Build the provenance register before the next import.** Minimum columns:
   `source_type` (`authored` / `licensed` / `public_reference`), `source_ref`,
   `source_url`, `source_year`, `licence_id`, `inspiration_ref`, `verified_state`,
   `verified_by`, `verified_at`, `review_note`. Keep `question_reviews` as the audit trail.
5. **If licensing, run a 200-item paid pilot.** Re-key every item independently, compare
   against the vendor's key, measure defect rate, and only then negotiate volume. Require:
   commercial display, storage/offline, modification, explanation rights, indemnity,
   audit, source-year metadata and continuity on termination.
6. **Set the item standard:** four options, one defensible key, three plausible
   distractors, an explanation, a syllabus ref, a topic link and a difficulty. Reject
   ambiguous, figure-dependent or format-drifted items rather than repairing them by
   guesswork.
7. **Protect the claim.** "Questions checked by hand" means a named reviewer and a
   `question_reviews` row for every published item. Licensed items get the same treatment;
   a vendor's key is a candidate, not a verification.
8. **Run two coverage lanes.** Lane one is the 11 subjects with a parsed corpus: process,
   solve, rewrite and verify what is already on disk. Lane two is the 14 subjects with
   nothing: source from NECO/WAEC papers, license a 25-subject dataset, or author from the
   syllabus — there is no JAMB PDF pile to process. Complete the 180-item core mock
   (English 60, Mathematics 40, Government 40, Economics 40), deepen each subject to at
   least twice the mock size so repeats are rare, then expand the 14 zero-coverage
   subjects in syllabus order. Micro-pools of 4-15 items per topic remain the unit of
   coverage.

## Decisions this research forces

1. **Budget:** is there money for a dataset licence, or is the bank author-only for now?
2. **Permission route:** do we make a formal approach to JAMB for a written licence or
   partnership? FOI is not the route; a commercial/educational partnership request is.
3. **Labelling:** do we ever say "real past questions", or only "JAMB-style" / "past-paper
   style"? Recommend the latter unless a licence explicitly permits the former.
4. **Pilot subject:** if licensing is explored, pilot on one subject with the worst public
   coverage (e.g. a language or arts subject), not on English where we can author and
   verify ourselves.

## Source register

Accessed 2 November 2026 unless stated.

Official:

- `https://www.jamb.gov.ng/`
- `https://www.jamb.gov.ng/JAMBTEST_Downloads`
- `https://www.jamb.gov.ng/thirdparty.aspx` (maintenance page at access)
- `https://ibass.jamb.gov.ng/`
- `https://ibass.jamb.gov.ng/help`
- `https://learn.jamb.gov.ng/`
- `https://www.jamb.gov.ng/PDFs/2024/RAPID_TEST_MULTILENT_JAMB_2024_CBT_Manual.pdf`

Law:

- Copyright Act 2022, Nigerian Copyright Commission:
  `https://nipc.gov.ng/assets/resources/copyright-act-2022/copyright-act-2022.pdf`
  (ss. 3, 7, 19, 20, 21, 24)
- Freedom of Information Act 2011:
  `https://osgf.gov.ng/storage/app/media/pdf/FOIA2011.pdf` (s. 19)

Commercial and free sources:

- `https://www.sdashapi.com/datasets/jamb`
- `https://www.sdashapi.com/Terms-of-Service`
- `https://questions.aloc.com.ng/`
- `https://aloc.com.ng/`
- `https://github.com/Seunope/aloc-endpoints`
- `https://huggingface.co/datasets/remi54/Jamb-ai-dataset`
- `https://campusninja.com.ng/jamb-past-questions-and-answers-pdf/`
- `https://edupadi.com/blog/download-jamb-past-questions-answers-pdf-free`
- `https://iyierioba.com/jamb-past-questions-pdf-download/`
- `https://www.assessly.ng/admissions/question-bank`
- `https://jambproapp.com/`

Internal evidence:

- `content-folder/_parsed/*.json` (audit above)
- `content-folder/_work/question-totals.md`
- `content-folder/_work/*-rescue-notes.md`
- `docs/deferred.md` (Economics and Government audit records)
- `supabase/migrations/20261011000012_question_editorial.sql`
- `supabase/migrations/20261011000014_review_history.sql`
