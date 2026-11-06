# Biology Independent Audit — 2026-11-05

**Scope:** All 89 Biology lessons (A.1–E.2), structured syllabus `content-folder/jamb-syllabus/structured/biology.json` (24 syllabus topics), external JAMB syllabus cross-check (jambsyllabus.com / allschool.ng / jambkit.com, 2026). Method: strict rule — Covered = taught in headed section + tested by inline check or worked calculation. Keyword mention = Partial.

**External check result:** No topic missing. External sources agree on 23–24 topics; the only count variance is Biotechnology (D.3), which external sites fold into Heredity objectives, while the structured file lists it as its own topic with 5 items. We cover it as a separate lesson, so nothing is missed. No new JAMB area (e.g., cell division, taxonomy, binomial nomenclature) appears in the official syllabus; those appear only in third-party summary sites, not the IBASS syllabus. Syllabus file has OCR truncations (B.9 a.i/c.i, E.2 iv "such as…", B.2 "Types of Nutrition" empty), but lesson content was judged against the readable items.

## Remediation status — 2026-11-06

The findings below are the audit snapshot. All P1 and P2 items have since been fixed in `scripts/_bio-lessons.json`, rebuilt into `content-folder/biology-curriculum.json`, and reseeded. The original findings are retained as the record of what was wrong and why.

**P1 (14/14 fixed).** Lamarck's two inverted keys corrected; soil porosity restated as clay's higher total porosity but lower permeability; Cross River National Park placed in the South-South and Borgu absorbed into Kainji Lake NP; Yankari and Omo named as national parks; tongue rolling, PTC tasting and earlobes qualified as not single-gene Mendelian traits; male-pattern baldness taught as polygenic, androgen-dependent and sex-influenced; calcium moved to the macronutrients; cassava/yam depletion corrected; photosynthetic oxygen described as a by-product, not excretory waste; marsupial distribution corrected for South America and Australian bats/rodents; the dihybrid ratio no longer claimed to prove independent assortment; the fictional soil probe replaced with real soil measurements; and the Darwin material qualified (Galápagos finches, branching horse series, Tiktaalik as an early shallow-water step).

**P2 (fixed or qualified).** The 10% law is a 5–20% range around 10%; sperm chemotaxis is limited to plant and invertebrate sperm; cramp is not attributed to lactate; ATP is quoted as textbook 36–38 with modern estimates of 30–32; the appendix is reduced, not functionless; Striga is parasitism, not competition; the ant–egret fusion was replaced; N'Dama trypanotolerance is stated correctly; the ocean sink is dissolved carbon dioxide with carbonate burial; legacy kingdom names carry modern-taxonomy caveats; cerebellum, parathyroid, pancreas and gonad positions were corrected; cactus, deer, raspberry/blackberry, flax/celery/pear, tilapia and Old World monkey tails were localised or qualified; and biotic×abiotic interaction, intra-specific niche differentiation, soil air/water measurement and hormone-controlled flowering were added.

**Coverage checks.** New or improved inline checks now cover the taught-but-untested points flagged below, including B.2 flowering/non-flowering autotrophs, carbon (IV) oxide necessity and P/K deficiency; B.4 respiring seeds; B.6 water and touch tropisms; C.1 instruments and biotic factors; C.2 parasitism/amensalism and the water-to-nutrient link; C.4 Guinea savanna, rainforest location and desert/highland features; C.5 interactions; C.6 soil measurement; C.7 STIs and treatment; D.1 fingerprints; D.2 base pairing and recombinant products; and D.3 pharmaceuticals. The B.9 gland-position and flowering gaps are now taught in prose.

**Re-verification (2026-11-06).**

- Strict prose scan: 0 of 89 lessons with issues — intro 25–40 words, 1–3 core sections at 120–180 words, exam tip 30–50 words, every paragraph ≤3 sentences, 2–4 bullets, four-option checks with valid keys, and depth sections at 180–300 words where present.
- Depth checker: all 89 pass.
- Answer-key comparator against `scripts/_check-bio.mjs`: 0 mismatches.
- Database: 89 Biology topics, 89 published lessons and 638 Biology blocks; library totals are 170 published topics and 170 published lessons. Depth: 5 of 89 Biology lessons.
- Browser sweep on a clean production build (`npm run build`, `npm run start -- --port 3001`): 89/89 pages returned 200 at 360px and 1280px; all inline checks returned the correct feedback; every recap had three items; no page or figure overflow; 16 lessons carry one figure each.

**Re-verification (2026-11-07, batches 1–6).** Strict prose scan on the rebuilt 92-lesson file: 0 issues; no section now uses more than three paragraphs. Depth checker: all 92 pass. Targeted comparator: 0 mismatches. Database: 92 Biology topics, 92 published lessons and 746 Biology blocks; 34 Biology lessons carry depth (5 original plus batches through B.4: A.1/A.2/A.3 remaining, B.1, B.2, B.3 and B.4). Production-build browser spot checks on the split and merged lessons passed at 360px and 1280px earlier; depth remains collapsed in the player and is verified by counts.

**Residual risks (not P1/P2).** Depth remains incomplete at 34 of 92 (in progress, batches through B.4 in 2026-11-07). Visual coverage is 16 figures across 89 lessons and follows the "only where prose fails" rule.

## Structural remediation — 2026-11-07

The two one-concept risks and the paragraph residue are closed:

- **Splits.** `darwin-and-organic-evolution` is now Darwin-only natural selection (overproduction, variation, finches/moths, Lamarck-versus-Darwin; 570 core words). The modern synthesis became a separate lesson, `the-organic-theory-of-evolution` (inherited variation, mutation as new alleles, speciation; 578 words).
- **Evidence split.** `evidence-of-evolution` is now `Fossil Evidence for Evolution` (rock record, transitional fossils, horse series; 559 words). Comparative anatomy/embryology (569 words) and biogeography/vestigial/DNA (537 words) are separate lessons. E-block order is now theories, Darwin, organic theory, fossils, comparative anatomy, biogeography. Slugs retained for the first lesson of each group; three new topics carry syllabus refs E.1/E.2.
- **Paragraph redistribution.** All 45 sections that used 4–5 short paragraphs now use 2–3 paragraphs, each at most three sentences. Adjacent paragraphs were merged and, where needed, the last two sentences fused with ", and" to respect the sentence cap; facts, word budgets, bullets, takeaways and checks are unchanged.
- **Totals.** 92 Biology topics, 92 published lessons and 746 Biology blocks; library totals are 173 published topics, 173 lessons and 42 depth lessons. Biology depth is 34 of 92.

## Coverage verdicts (summary)

**A.1–A.3 (16 lessons):** A.1 Fully covered (characteristics, cell, 5 levels). A.2 Covered for Monera-Fungi-Plantae-Vertebrates; Partial for Bryophyta (Brachymenium never named), Invertebrate example list (mosquito/cockroach/housefly/bee/butterfly appear only in Insects lesson), economic/environmental value checks, vertebrate economic importance (no check), countershading (fish only), warning colouration in mushrooms (no check), mosquito/moth mouthparts (no check), territorial behaviour (no check). A.3 Otherwise covered.

**B.1–B.9 (47 lessons):** B.1, B.3–B.6 largely Covered. Gaps:
- B.2 Nutrition: flowering vs non-flowering (no check), CO2 necessity (no check), P/K deficiency (no check), nutritional value (partial), digestive enzyme general characteristics (no teaching), end products of digestion (Missing — glucose/amino acids/fatty acids+glycerol never taught), scurvy/rickets (no dedicated check).
- B.4 Respiration: experimental deduction of gases/heat (Missing), yeast economic importance (no check).
- B.6 Support: water/touch tropisms (no check).
- B.7 Reproduction: succulent fruits (taught, not checked).
- B.9 Coordination: conditioned reflex exemplar "riding a bicycle" taught as "braking a bicycle"; pancreas/gonads location never stated; phytohormone flowering never taught.

**C.1–C.7 (16 lessons):**
- C.1 Factors: wind speed/direction, thermometer check, biotic check all missing (Partial).
- C.2 Interactions: parasitism/saprophytism/amensalism/cooperation/predation (taught, never checked); chains-to-distribution (no check); water→other nutrient cycles (Missing).
- C.4 Biomes: Southern vs Northern Guinea (not distinguished), desert (no check), montane forests (never taught), location (no check).
- C.5 Populations: competition↔succession (taught, not checked), biotic factors (not checked), biotic×abiotic interaction e.g. drought→food shortage→disease (Missing), niche differentiation framed as inter- not intra-specific.
- C.6 Soil: soil air/water amounts + experimental measurement (no procedure/check), renewal methods (mostly unchecked).
- C.7 Humans/Environment: gonorrhoea/syphilis never named; polio/TB/STI untested; treatment (antibiotics/antimalarials) absent; IRCS and ministries never mentioned; park locations/importance sparse (see error 26).

**D.1–D.3 (7 lessons):**
- D.1 Variation: habitat role (not taught), weight measurement/graphs (absent), colour record (no check), paternity/crime (worked example only, no check), transfusion only.
- D.2 Heredity: chromosome structure (centromere only), DNA base pairing (no check), crossing-over/recombination (not taught — conflated with independent assortment), baldness (taught, never checked), GMO ethics debate (absent), interferon/enzymes (not checked).
- D.3 Biotech: pharmaceuticals (no check).

**E.1–E.2 (3 lessons):** Lamarck, Darwin Covered; organic theory = modern synthesis asserted without source (Partial); organic evolution definition (sum total triad) scattered, not taught as definition; E.2 evidence list truncated in source, 6 families taught but only 3 checked (analogous, embryology, biogeography, vestigial unchecked).

## Factual errors — P1 (must fix for exam correctness)

1. **E.1 Lamarck keys inverted (2 wrong keys).** theories-of-evolution check key "Their father inherited stronger arms" reverses Lamarck; second key rewards rejected inheritance claim as "lasting contribution."
2. **Soil porosity reversed.** soil lesson: sand high porosity / clay low porosity. Clay total porosity 45–60% > sand 35–40%; sand wins only on pore size/permeability. Check reinforces error.
3. **Cross River National Park region wrong.** pollution lesson check: "Cross River is in the south-east" — it is South-South.
4. **Borgu double-count.** pollution lesson lists Borgu as separate game reserve — absorbed into Kainji Lake NP in 1979.
5. **Yankari/Omo status.** ecological-succession calls Yankari "Game Reserve" (upgraded to National Park 1991) and Omo "Forest Reserve" (now Omo National Park).
6. **Tongue rolling / PTC / earlobe as single dominant genes.** physiological-variation + variation-in-population teach Mendelian dogma; both are polygenic/developmental, learnable, with contradicting pedigrees.
7. **Baldness model wrong.** sex-determination lesson teaches dominant, anticipating, "two genes in women" — male-pattern baldness is polygenic, androgen-dependent, sex-influenced, not X-linked.
8. **Calcium listed as micronutrient.** photosynthesis lesson.
9. **Cassava/yam depletion reversed.** soil-fertility: cassava is low-nutrient tolerant; yam depletes more.
10. **Oxygen of photosynthesis called excretion.** plant-excretion syllabus wording followed uncritically.
11. **Marsupials "rare elsewhere, without placental competition."** South American diversity + Australian bats/rodents ignored. evidence-of-evolution.
12. **Dihybrid 9:3:3:1 "confirms independent assortment."** Single ratio cannot prove unlinked; "Ratios seem weary" garbled sentence.
13. **Fictional "soil probe"** measures moisture/texture/nutrients (factors lesson).
14. **Darwin "survival of the fittest" + Gould finches omitted; horse ladder as linear series; Tiktaalik "moving on land successfully."** JAMB-tolerable but unqualified.

## Factual errors — P2 (JAMB-tolerable simplifications / presentation)

- 10% law taught as exact constant (range 5–20%).
- Mammalian sperm chemotaxis overstated; lactate-cramp myth; ATP 36–38 dated; appendix "functionless"; embryonic "gill slits"; Striga labelled competition not parasitism; ants guarding egrets fused example; N'Dama crosses less resistant than purebreds (reversed in context); Ocean carbon sink via shells (dissolved CO2 is the sink).
- Modern taxonomy taught as current: Monera/Protista/Thallophyta/Coelenterata presented without "legacy" caveat; cerebellum "smooth muscle" confusion; parathyroids "embedded in thyroid"; right kidney high-Sudan etc.
- Nigerian example anachronisms: cactus as Nigerian xerophyte (no native cacti in Nigeria); deer (absent); raspberry/blackberry, flax/celery/pear; tilapia as introduced (native); monkeys with grasping tails (Old World immobile tails); yankari gorillas across rainforest.

## Criteria compliance (re-checked 2026-11-06)

- **Depth checker:** 89/89 pass (500–700 core, 1–3 teaching cards, takeaway/check, PR checks). Strict prose scan: 0/89 with issues. Browser (production build): 89/89 pages status 200, 360/1280 no overflow, all checks correct, three-item recaps.
- **Structure:** four-option checks now cover the previously untested list-type knowledge; the answer-key comparator reports 0 mismatches. Residual one-concept risks: `evidence-of-evolution` packs six evidence families; `darwin-and-organic-evolution` packs selection + modern synthesis.
- **Depth checker:** 92/92 pass (500–700 core, 1–3 teaching cards, takeaway/check, PR checks). Strict prose scan: 0/92 with issues. Browser (production build): 92/92 pages status 200 posture (89 earlier full sweep; spot checks for splits), 360/1280 no overflow, all checks correct, three-item recaps.
- **Structure:** four-option checks now cover the previously untested list-type knowledge; the answer-key comparator reports 0 mismatches. One-concept risks closed by the 2026-11-07 splits.
- **Depth tier:** 34 of 92 Biology lessons carry Go deeper (library total 42 of 173). Core coverage complete, depth in progress through B.4.

## Recommendation (2026-11-07)

The P1/P2 corrections and coverage checks close the exam-accuracy findings. Remaining work is optional: finish depth beyond 34/92 and add visuals only where prose handles the relationship badly. Keep the provenance register with the authored items.
