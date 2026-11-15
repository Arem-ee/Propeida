# Physics — flagged for manual review (2026-11-15)

All 496 calculation-heavy records were re-solved step-by-step from their stems.
**No answer was changed silently.** Where derivation and the printed key (or a
public compilation) disagree, or the print is defective, the row is listed here
with what was kept and why. Keys remain exactly as printed in the live DB.

Companion to: `docs/physics-bank-live-2026-11-15.md`.
The bank record keeps the flag in `needsManualReview` for the held rows; these
explanations are in the DB verbatim and are honest as printed.

## A. Do NOT ingest / live-keyed as-is

| ID | Flag | Status as-is |
|---|---|---|
| physics-2003-q22 | Derived A = 1.2×10⁶/(400×30) = **1.0×10² m²** (option b); keyed (a) 1.0×10³ m² is 10× off; compilation prints b | Keyed live; do not trust as keyed |
| physics-2002-q42 | Faraday electrolysis row carries a transposed radioactivity option list; 2 g matches no option; key 'd' is not a mass | Unsolvable as printed; keyed 'd' live |
| physics-2000-q03 | Friction: keyed (b) "I, II and III" contradicts the law of friction (III is false); every public source keys "I, II and IV"; key kept with confidence downgraded | Keyed 'b' live |
| physics-1997-q36 | Sight defect: sign-correct f = **30.0 cm (option d)** verified in two sign conventions; key (a) 15.0 cm unreachable | Keyed 'a' live |
| physics-1983-q42 | Fire-alarm bimetal: copper top / steel below / contact above; derivation gives **I and III (option d)**; key 'e' follows the public misconception | Keyed 'e' live |
| physics-2004-q18 | Vectors of 10/4/8/6 N: net horizontal = **13 N → option (d)**; compilation also keys 13 N; key (a) 7√3 mis-expected | Keyed 'a' live |
| physics-2004-q19 | Average life τ = 1/λ = **1.00×10⁷ s (option c)**; keyed (b) 1.00×10⁻⁷ s is a rate | Keyed 'b' live |
| physics-2004-q38 | Thermal expansion: ΔL = 2.0×10⁻⁵×20×50 = **0.02 m (option c)**; keyed (d) 0.20 m is the original length | Keyed 'd' live |
| physics-1993-q02 | % error in thickness: (2+1)/2 = 1.5 mm over 5.5 mm = **27% (option a)**; key (c) 9% unreachable from the print | Keyed 'c' live |
| physics-1993-q10 | Max pressure (smallest face): **4×10⁴ N/m² (option b)**; key (d) 2×10⁴ is the *minimum* | Keyed 'd' live |
| physics-1993-q13 | T = W − upthrust = **1.0 N (option a)**; key (b) 3.0 N equals the buoyancy itself | Keyed 'b' live |
| physics-1993-q23 | Radar echo: d = ct/2 = **600 km (option a)**; key (d) 6.0×10⁵ km implies ~4 s range | Keyed 'd' live |
| physics-1983-q01 | Closed pipe resonance: f₂/f₁ = **3 (option b)**; keyed (c) 2 — compilation also keys 3 | Keyed 'c' live |
| physics-2001-q12 | Print corrupt (v = 120 m/s matches no option); options encode **v = 240 m/s (option b)**; key (b) kept under repair only | Keyed 'b' live |
| physics-2003-q09 | Literal stem "8.8 g" yields **2.8 cm (option b)**; keyed (a) 25.2 cm only via restoration to 79.2 g | Keyed 'a' live |
| physics-2000-q01 | Constant vs linear force reading; keyed (c) 2×10³ N; compilation's linear reading gives (b) 4×10³ N | Keyed 'c' live |
| physics-1997-q45 | Option list belongs to the next question; true options give **1.8×10⁷ J (true option (c))**; key (c) respected under repair | Keyed 'c' live |
| physics-2002-q07 | Figure-dependent; trapezium gives **7.5×10⁻³ J (option b)**; input arithmetic itself supports b; key (d) triangle kept | Keyed 'd' live |

## B. Keys that are consistent only under repair — likely OK, reviewer should eyeball

1983-q14 (1000→100 cm³), 1984-q09 (figure), 1984-q23 (DUPLICATE ID — two live DB rows share it; options garbled), 1984-q45 (options polluted), 1985-q12 (print corrupt), 1985-q18 (α = 2.0 vs 2.5×10⁻⁵ K⁻¹ — literal print makes key 'c'), 1986-q14 (key a vs comp b; 2.4×10⁵ vs 24×10⁴ — same figure), 1986-q31 (ambiguous optics), 1987-q10 (kept b, derivation says c), 1987-q02 (orphan options recovered from PDF), 1988-q08/q30/q37/q41/q49, 1989-q13 (~248 K vs keyed 243 K — source slip; key kept), 1989-q25 (print exponents lost), 1990-q33 (units-of-force options vs Hz answer), 1990-q03 (figure absent), 1991-q09, 1991-q13 (data does not resolve), 1991-q30 (no compilation check), 1992-q37 (orientation-dependent), 1993-q25 (figure absent), 1994-q08, 1994-q12 (π dropped), 1994-q19 (key d kept, compilation a impossible — keep ours), 1994-q35/q36, 1995-q08, 1995-q12, 1995-q19, 1995-q26, 1995-q37, 1998-q05, 1998-q28 (closed vs open pipe), 1999-q19 (restore fundamental 40 Hz), 1999-q22 (identical dup options), 1999-q30, 1999-q35, 1999-q42 (DUPLICATE ID with a different question — second row is figure-held; both share an id), 2000-q02, 2000-q05, 2000-q42, 2001-q14, 2002-q33, 2003-q13, 2003-q29 (figure recovered), 2003-q44 (key (c) 600 W kept; compilation's 1200 W misuses ½ factor), 2004-q20, 2004-q21, 2004-q45.

## C. Systemic print damage (content-level)

- Every physics option(e) string is EMPTY in the source parse (both in bank and
  live DB). Papers from 1993 onward were A–D; pre-2013 should be A–E, so option
  (e) was never p used in these years — but the 5-option invariant should be
  audited before relying on E-keys (n/a: papers are A–D for late editions; E
  letters carry no answers in this bank).
- Duplicate ids: `physics-1984-q23` (two texts), `physics-1999-q42` (two texts).
  In the DB, one 1984-q23 is a duplicate text (skipped by seed), the 1999-q42
  duplicates are two different questions sharing an id. Ids should be
  disambiguated at a re-ingest.
- Confidence tags carried from research MDs are unchanged; nothing was promoted.

## D. JAMB printing conventions observed

- Pre-2013 papers are A–E (five options); the bank preserves them.
- JAMB prints use glyphs (π, Ω, µF, °C) that are often dropped or mojibake'd in
  the PDF text layer; most rows above trace to that layer, not to reasoning.
- Figures are required by many items (resonance tubes, spring graphs, circuit
  schematics, vector diagrams). The bank kept ~110 as figure-held, unseeded.

## 2026-11-15 re-key applied to live DB (user-authorised hand re-key)

After the review pass, the disputed rows were re-derived by hand against the
source PDF (content-folder/Physics-JAMB-Past-Questions.pdf, page references
throughout) and the following 17 changes were applied directly to the live DB
(service role, `question_answers.correct_answer` + repaired `options`/`text`).
Explanations in those rows were restored to plain prose because the current
build cannot parse worked-steps JSON — post-deploy push will rewrite them.

| ID | Change | Evidence |
|---|---|---|
| physics-2003-q22 | a → b | A = P/(k∇T) = 1.2e6/(400·30) = 1.0e2 m²; print page 90 |
| physics-2000-q03 | b → a | Laws of friction: I, II, IV true; III false (approx const speed) |
| physics-1997-q36 | a → d | 1/f = 1/25 − 1/150 → f = 30 cm (hypermetropia) |
| physics-1983-q42 | e → d | Bimetal strip: arc concave toward low-α metal (steel, on top or bottom accordingly); contact above ⇒ I & III true |
| physics-2004-q18 | a → d | Net horizontal = 10−4+8cos60+6cos60 = 13 N; print page 95 |
| physics-2004-q19 | b → c | Average life τ = 1/λ = 1.0e7 s; print page 95 |
| physics-2004-q38 | d → c | ΔL = αLΔT = 2.0e-5·20·50 = 0.02 m (metro-reading; print page 96) |
| physics-1993-q02 | c → a | t = (32−21)/2 = 5.5 mm; worst-case Δt = 1.5 mm → 27 % |
| physics-1993-q10 | d → b | Max pressure on 3×2 m face = ρgV/A = 4×10⁴ N/m² (maximum = small face, not large) |
| physics-1993-q13 | b → a | T = mg − upthrust = 4.0 − 3.0 = 1.0 N |
| physics-1993-q23 | d → a | d = ct/2 = 6.0e5 m = 600 km |
| physics-1983-q01 | c → b | Closed pipe resonances = odd harmonics; f₂/f₁ = 3 |
| physics-2002-q07 | d → b | Area under F–x from E to F (trapezium) = 7.5e-3 J; print figure p.86 |
| physics-2003-q09 | a → b | Print "8.8 g" verbatim: h = m/ρπr² = 2.8 cm (print page 90) |
| physics-2001-q12 | print repaired | "120 ms-1" → "240 ms-1" (options require it); answer stays b |
| physics-1997-q45 | options repaired | Print page 68 Q45: 5.3/6.5/1.8/2.3 ×10ʷ J (batch had Q36's option list fused); answer stays c |
| physics-2002-q42 | options repaired | Print page 89 Q42: 18/10/6/2 g (batch had Q43's radioactivity options); answer stays d |

Also: one earlier Chemistry-parallel gap closed — today's physics seed inserted all
496 worked-steps-v1 explanations into the bank **before** the learner build can
parse them. The live DB's explanation for these 15 rows was therefore restored to
plain prose immediately; the post-deploy push rewrites them as worked-steps-v1.

## F. What this means for learners today

The physics questions live in practice sessions with `source_cited` answers.
Section A is now re-keyed: **the live DB answers match derivation or the source
print verbatim.** The rows still tagged `figure-dependent` (held) remain
unseeded.
