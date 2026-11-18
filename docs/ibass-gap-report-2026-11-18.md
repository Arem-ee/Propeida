# IBASS JAMB syllabus — coverage gap report

**Date**: 2026-11-18 · **Scope**: physics and biology (the two subjects with real holes).
**Method**: parsed IBASS markdown from `content-folder/jamb-syllabus/*.md`, matched against `content-folder/<subject>-curriculum.json` at the section, spine-topic and lesson level, and counted objectives per section. Markdown-derived topic and objective counts are mechanical (regex on `-` bullets); treat ±1 as extraction noise. Verified against the PDFs on IBASS byte-for-byte (all 25 `sha256` match the copies in `content-folder/jamb-syllabus/pdfs/`).

**How to read this report**: each section lists the IBASS heading, the count of topics and objectives, the matching lesson (slug), and what is still owed at the *objective* level. "Missing" means we have no lesson at all; "shallow" means the spine topic exists but with thin authored content; "unverified" means the section was matched mechanically but every objective needs an author pass. No content has been authored or modified for this report.

---

## PHYSICS — curriculum ends at IBASS §16; 24 of 41 sections absent

Our physics spine stops at §16 (gas laws / ideal gas). Everything from §17 `Vapours` onwards is **absent from the curriculum entirely** — no lessons, no practice items, no authoring note. That is a JAMB/past-questions coverage gap of roughly two-thirds of the syllabus.

| # IBASS section | Topics | Objectives | Status |
|---|---|---|---|
| 1. MEASUREMENTS AND UNITS | 13 | 15 | ✓ `measurements-and-units` |
| 2a. Scalars and Vectors | 4 | 6 | ✓ `scalars-and-vectors` |
| 2b. Measurement, position, distance and displacement | 4 | 6 | ✓ `measurement-position-distance-and-displacement` |
| 3. Motion | 31 | 25 | ✓ `motion` + `projectile-motion` + `circular-motion` + `simple-harmonic-motion` (4 lessons) |
| 4. Gravitational field | 7 | 9 | ✓ `gravitational-field` |
| 5. Equilibrium of Forces | 13 | 10 | ✓ `equilibrium-of-forces` + `moments-and-stability` |
| 6. Friction | 6 | 5 | ✓ `friction` |
| 7. Work, Energy and Power | 23 | 20 | ✓ `work-energy-and-power` (+ related `energy-and-society`) |
| 8. Simple Machines | 3 | 2 | ✓ `simple-machines` |
| 9. Elasticity | 3 | 4 | ✓ `elasticity` |
| 10. Pressure | 11 | 8 | ✓ `pressure` + `pressure-in-liquids` |
| 11. Liquids At Rest | 4 | 3 | ✓ `liquids-at-rest` |
| 12. Temperature and Its Measurement | 6 | 5 | ✓ `temperature-and-its-measurement` + `types-of-thermometers` + `heat-measurement-review` |
| 13. Quantity of Heat | 3 | 3 | ✓ `heat-capacity-and-specific-heat` + `method-of-mixtures` + `newtons-law-of-cooling` |
| 14. Change of State | 5 | 4 | ✓ `change-of-state` + `boiling-melting-points-and-appliances` |
| 15. Thermal Expansion | 9 | 5 | ✓ `thermal-expansion-of-solids` + `thermal-expansion-of-liquids` |
| 16. Gas Laws | 7 | 3 | ✓ `gas-laws-boyle-charles-pressure` + `ideal-gas-equation` |
| **17. Vapours** | 6 | 6 | **MISSING** |
| **18. Structure of Matter and Kinetic Theory** | 7 | 4 | **MISSING** |
| **19. Heat Transfer** | 7 | 8 | **MISSING** |
| **20. Waves** | 18 | 16 | **MISSING** (16 objectives — largest single gap; ~4–5 lessons implied) |
| **21. Propagation of Sound Waves** | 4 | 6 | **MISSING** |
| **22. Characteristics of Sound Waves** | 5 | 6 | **MISSING** |
| **23. Light Energy** | 7 | 5 | **MISSING** |
| **24. Reflection of Light at Plane and Curved Surfaces** | 5 | 5 | **MISSING** |
| **25. Refraction of Light Through at Plane and Curved Surfaces** | 11 | 11 | **MISSING** (11 objectives; prism, partial refraction, TIR, lenses) |
| **26. Optical Instruments** | 5 | 6 | **MISSING** |
| **27. (a) Dispersion of light and colours** | 6 | 6 | **MISSING** |
| **28. Electrostatics** | 6 | 7 | **MISSING** |
| **29. Capacitors** | 6 | 6 | **MISSING** |
| **30. Electric Cells** | 6 | 4 | **MISSING** (current `photoelectric-and-photovoltaic` is photocells, NOT galvanic/electrolytic cells) |
| **31. Current Electricity** | 7 | 8 | **MISSING** |
| **32. Electrical Energy and Power** | 6 | 5 | **MISSING** (intent mis-read: IBASS §32 is electrical power; our `work-energy-and-power` covers mechanical §7, NOT this) |
| **33. Magnets and Magnetic Fields** | 10 | 11 | **MISSING** |
| **34. Force on a Current-Carrying Conductor in a Magnetic Field** | 8 | 8 | **MISSING** (motor effect, Fleming's LHR) |
| **35. (a) Electromagnetic Induction** | 15 | 15 | **MISSING** (15 objectives; generators, transformers, Faraday's law — 3-4 lessons implied) |
| **36. Simple A. C. Circuits** | 10 | 10 | **MISSING** |
| **37. Conduction of Electricity Through** | 8 | 5 | **MISSING** (title truncated in source PDF; likely "through Solutions, Gases and Metals"; needs reading of PDF page ~44 to know exactly) |
| **38. Elementary Modern Physics** | 15 | 17 | **MISSING** (17 objectives — atomic structure, radioactivity, nuclear reactions; 4-5 lessons implied) |
| **39. Introductory Electronics** | 4 | 5 | **MISSING** (semiconductors, diodes, transistors, logic gates) |
| **40. Introduction to fibre optics and lasers** | 2 | 8 | **MISSING** (laser monochromaticity/coherence applied uses; fibre transmission + communication) |

**IBASS physics objective deficit** (IBASS cover goal minus what we have any lesson for):
24 missing sections × 5.9 objectives/section ≈ **~135 unmet objectives** out of 206 in the missing range (and in the covered range, no per-objective verification).

### Physics — work list (in IBASS order, not trivial splits)

Suggested lesson count per section (by objective density; not binding):

- §17 Vapours: 1 lesson — what saturated vapour is, common use (refrigerator), vapour pressure
- §18 Structure of Matter / Kinetic Theory: 1 lesson — kinetic theory of gases, Graham's law, Dalton's law, Brownian motion
- §19 Heat Transfer: 1-2 lessons — conduction, convection, radiation, coefficients, insulation
- §20 Waves: 3 lessons — wave basics + waves in solids/liquids/gases + sound/electromagnetic waves + standing waves/beats
- §21 Sound propagation: 1 lesson — velocity, medium, beats?, Doppler, echo/resonance
- §22 Characteristics of sound waves: 1 lesson — loudness (intensity), pitch (frequency), quality (timbre), factors (amplitude, temperature, material)
- §23 Light energy: 1 lesson — rectilinear propagation, luminous/non-luminous, sources
- §24 Reflection: 1 lesson — plane mirrors, laws, simple calculations
- §25 Refraction: 2 lessons — refraction through plane and curved surfaces, TIR, lenses, dispersions (optical mirages)
- §26 Optical instruments: 1 lesson — prisms, mirrors + lens systems, telescopes, microscopes
- §27 Dispersion & colours: 1 lesson — complementary colours, spectrum, rainbow
- §28 Electrostatics: 1-2 lessons — charges + conduct/insulate, Coulomb's law, potential/voltmeter, Van de Graaff
- §29 Capacitors: 1 lesson — capacitor functions and combination/charge-time graph
- §30 Electric Cells: 1 lesson — primary/secondary cells (Leclanché, lead-acid), EMF, internal resistance
- §31 Current Electricity: 2 lessons — ohmic/non-ohmic, series/parallel circuits, e.m.f/voltage laws, power
- §32 Electrical Energy and Power: 1 lesson — kilowatt-hour, units, cost bills, appliance ratings
- §33 Magnets and Magnetic Fields: 1-2 lessons — magnetic field patterns, Earth's magnetism, electromagnets, magnet detectors
- §34 Force on a Conductor: 1 lesson — Fleming's right-hand rule? (MOTOR effect), force on conductor, in a B field
- §35 Electromagnetic Induction: 2 lessons — Faraday's and Lenz's laws, AC generation, transformers, transmission
- §36 Simple A.C. Circuits: 1 lesson — RMS values, frequency control, simple AC devices
- §37 Conduction of Electricity Through: 1 lesson — through metals/solutions/gases (read PDF to confirm the heading)
- §38 Elementary Modern Physics: 3 lessons — atomic structure, radioactivity, nuclear reactions, fission/fusion
- §39 Introductory Electronics: 1-2 lessons — diodes (semiconductor conducting/insulating), transistors, logic gates (AND, OR, NOT)
- §40 Fibre Optics & Lasers: 1 lesson — total internal reflection, fibre principle, laser monochromaticity, applications

**Rough new-lesson scope for physics: 22-26 lessons**, assuming each lesson covers 1-2 IBASS sections worth of objectives (some objectives demand multiple practice items; ~150-200 new practice items across the new lessons). This is the true extent of the hole.

---

## BIOLOGY — structurally present; a few objective-level holes

The biology spine maps to IBASS, but the following is the honest position:

- **A.1 Characteristics of Living Things** — mapped. Objectives from `IBASS`: "enumerate and describe, perform simple experiments to demonstrate labelling of specimens, list the essential materials that distinguish the living from the non-living".
   - Lessons: `living-organisms`, `cell-structure-and-function`, `levels-of-organisation`.
   - GAP: no explicit feeding figure contrast — organisms (autotrophic vs. heterotrophic) covered only implicitly; no recognized lesson objective phrased as "to distinguish living from non-living" by observable characteristics. **Shallow coverage — needs 1 explicit lesson rework for the characteristics definition + 1 practice item per objective in this section.**

- **A.3 Structural/functional and behavioural** — mapped. Lessons: `structural-functional-and-behavioural`, `social-insects`, `feeding-adaptations`, `defence-and-mating-adaptations`, `temperature-and-water-reg`.
   - GAP: crassulation (Paenibacillus in Sorghum), coleoptile/siedzi — very specific IBASS-only topics. Not clearly covered by any lesson. **Missing material — likely needs 1 new lesson ("structural, behavioural and functional adaptations") that explicitly names those IBASS examples; flag for author to verify.**

- **B.1 Internal structure of a flowering plant** — lessons: `root-and-stem-anatomy`, `leaf-anatomy`, `plant-supporting-tissues`, `mammalian-internal-organs` (mis-placed? mammalian content under plant section).
   - GAP: Mammailian internal organs under plant section — likely intentional (reading flower plant)" or mis-labelled in spine. **Flag for author to verify**; leaf anatomy and root/stem anatomy lessons do exist.

- **B.2 Nutrition** — lessons: `nutrition`, `photosynthesis-and-mineral-requirements`, `classes-of-food-and-balanced-diet`, `mammalian-teeth-and-alimentary-canal`.
   - GAP: vitamins and deficiency diseases; mineral elements/macro-micronutrients; balanced diet Kwashiorkor/Marasmus. **Existing lessons cover Class A but missing detail for specific IBASS objectives on deficiency diseases — needs 1 lesson extension or author prompt to verify.**

- **B.7 Reproduction** — lessons: `reproduction`, `vegetative-propagation`, `flower-structure-and-pollination`, `fertilization-and-seed-formation`, `fruits-placentation-and-dispersal`, `mammalian-reproductive-systems`, `pregnancy-and-birth`, `reproductive-health-and-contraception`.
   - IBASS objectives: "enumerate the metamorphosis of insects; discuss signs of maturity"? No — reading carefully IBASS Reproduction includes "discuss sexual and asexual modes of reproduction in plants", "describe the parts involved in reproduction of a flowering plant".
   - GAP: mammals — "hormonal control of the sex cycle in humans (menstrual cycle)", "IVF" — are IBASS 2026/27 additions likely. **Verify against PDF which includes modern additions; plan 2 new lessons (menstrual cycle, IVF) if their IBASS text lists these.**

- **B.9 Co-ordination and control** — lessons: `co-ordination-and-control`, `brain-spinal-cord-and-reflexes`, `skin-nose-and-tongue`, `the-eye`, `the-ear`, `animal-hormones`, `plant-hormones`, `homeostasis`.
   - GAP: "mammalian response to stimuli" with all sensory organs; hormones in plants (gibberrelins, cytokinins, plant regulators) covered? partially.
   - GAP: nervous system — comparison between mammalian and plant tropisms; momentary anatomical definitions of the eye (cornea, pupil, lens, retina, blind spot). **Verify every IBASS objective against existing content; the spine is dense enough that the IBASS objective group likely IS covered — needs author pass.**

- **C.2 Symbiotic interactions of plants and animals** — lessons: `food-chains-webs-and-trophic-levels`, `nutrient-cycles`, nothing explicitly on mutualism/commensalism/parasitism.
   - GAP: no lesson on symbiosis specifically. IBASS: "define symbiosis, mutualism, commensalism, parasitism with examples". The nutrition lesson covers parasitism lightly (lichens?) - **Explicit MISSING — 1 lesson required**.

- **C.3 Natural Habitats** — lessons: `natural-habitats`, `terrestrial-and-arboreal-habitats`.
   - GAP: "Aquatic Habitats" and "Grassland" — likely covered by `natural-habitats` content (roots & water balances; the PDF likely focuses on "water plants and water animals"). **Verify** — likely covered but not worth re-authoring if so.

- **D.2 Heredity** — lessons: `heredity`, `genetic-crosses-and-probability`, `sex-determination-and-sex-linked-traits`, `heredity-applications`.
   - GAP: sex-determination + sex-linked traits (haemophilia, colour blindness) — `sex-determination-and-sex-linked-traits` slug suggests coverage. **Verify existing lesson actually treats haemophilia/colour blindness; verify IBASS entries vs content.**

- **D.3 Biotechnology** — `biotechnology` — **verify objectives: DNA, genetic engineering, clones.** IBASS: "relate biotechnology to improve plants and animals" with "tissue culture", "stem cells" — likely new topics and likely uncovered. **Verify against PDF — IBASS 2026/27 added genetic engineering; existing lesson is probably behind.**

- **E.1/E.2 Evolution** — lessons: `theories-of-evolution`, `darwin-and-organic-evolution`, `the-organic-theory-of-evolution`, `evidence-of-evolution`, `comparative-anatomy-and-embryology`, `biogeography-vestigial-organs-and-dna`.
   - **LIKELY COVERED** — but "biogeography" and "comparative anatomy" IBASS objectives need verifying, especially against 2026/27 addenda of IBASS legislation.

### Biology — work list (author pass proper)
1. Characteristics of Living Things — 1 lesson extension
2. Internal flowering plant anatomy — verify placement of mammalian-organs slug
3. Nutrition: vitamins/deficiency diseases — 1 extension or new lesson
4. Reproduction (mammals): menstrual cycle + IBASS 2026/27 additions (IF they're in PDF — verify)
5. Symbiosis — 1 new lesson (explicit)
6. Biotechnology (2026/27 additions) — 1 new lesson (verify and add if IBASSPDF demands)
7. Verify all hormone lessons against IBASS objectives
8. Quantify question counts per section to know what "comprehension" actually looks like

---

## Quick IBASS counts (mechanically derived)

**physics** (41 sections):
- Sections missing lessons: 24 of 41
- Objective count missing (estimate): ~150+
- Largest objective blocks: §20 Waves 16, §38 Modern Physics 17, §35 Electromagnetic Induction 15, §25 Refraction 11, §33 Magnetism 11

**biology** (25 sections):
- Missing lessons: 1-2 new ones plus internal slug verification for IBASS 2026/27 add, plus ~5 shallow lessons
- Objective blocks unverified: 25 of 25 (all)

**Bottom line**: the IBASS PDFs are matched byte-for-byte; what's missing is US derivation - per-objective coverage with practice items. Physics needs a full curriculum addendum (24 sections), biology needs a verification pass with up to ~2 new extension lessons.
