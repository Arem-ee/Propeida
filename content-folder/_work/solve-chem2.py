"""Stage-3 chemistry batches 1+2 solutions."""
import json

b1 = json.load(open('content-folder/_work/chem-candidates.json', encoding='utf-8'))
b2 = json.load(open('content-folder/_work/chem2-candidates.json', encoding='utf-8'))

# (batch, index) -> (answer, explanation, note)
SOLVED = {
    (1, 0): ('D', 'Welding and cutting metals needs the hottest flame — oxy-acetylene (about 3500\u00b0C).',
             'AI-solved; stem typo cotton for cutting? — verify.'),
    (1, 2): ('C', 'Yeast fermentation of sugar is the basis of the brewing industry.',
             'AI-solved; stem head fragmentary — verify.'),
    (1, 7): ('C', 'More negative \u0394H means more heat evolved: 406 kJ in (II) beats 286 kJ in (I) — so less heat is evolved in (I).',
             'AI-solved; equations and option A mangled in source — verify figures.'),
    (1, 8): ('D', 'Mg and Fe sit above hydrogen in the activity series and displace it; lead coats itself in insoluble PbCl2 and copper is below hydrogen.',
             'AI-solved; source typos Mgm/Fem — verify.'),
    (1, 9): ('B', 'Stainless steel is iron alloyed with chromium (plus carbon) — read ion as iron.',
             'AI-solved; source typo ion for iron — verify.'),
    (1, 10): ('A', '2NaOH needs 1 H2SO4: 0.1\u00D720/1000 = 0.002 mol NaOH \u2192 0.001 mol acid \u2192 0.001/0.5 L = 2.0 cm\u00B3.',
              'AI-solved; formulae mangled in source — verify figures.'),
    (1, 12): ('B', 'BaCl2 gives white BaSO4 with sulphates, and Cu\u00B2\u207A colours the flame green — copper(II) tetraoxosulphate(VI).',
              'AI-solved; subscripts mangled in source — verify formulae.'),
    (1, 13): ('D', 'Protons plus neutrons make essentially all atomic mass — electrons are negligible.', None),
    (1, 18): ('D', 'Brine is solution-mined salt water; evaporating the water leaves sodium chloride.', None),
    (1, 21): ('C', 'Fe\u00B3\u207A gains an electron (reduction to Fe\u00B2\u207A) while I\u207B loses one — iodide is oxidised to iodine.',
              'AI-solved; options A/B garbled in source — verify.'),
    (1, 26): ('D', 'Triple-bonded carbon uses sp hybrid orbitals.', 'AI-solved; option A typo Sp^ — verify.'),
    (1, 27): ('D', 'Breaking big hydrocarbons into smaller, lower-boiling ones by heat is cracking.', None),
    (1, 29): ('B', 'Graphite\u2019s delocalised electrons conduct — diamond, sulphur and red phosphorus cannot.', None),
    (2, 7): ('C', 'At 323 K every liquid listed is below its boiling point, so the most volatile — lowest boiling point, ethanol at 351.3 K — has the highest vapour pressure.',
             'AI-solved; source typos button-2-ol/373.OK — verify.'),
    (2, 14): ('C', '2CO + O2 \u2192 2CO2 releases about 283 kJ per mole of CO2 — the standard enthalpy is \u2212282.9 kJ.',
              'AI-solved; equation mangled in source — verify.'),
    (2, 15): ('B', 'Sulphate is confirmed last with acidified barium chloride — white BaSO4.',
              'AI-solved; source typo chloridem — verify.'),
    (2, 17): ('C', 'Decolourising acidified permanganate marks a C=C bond, while a negative Tollens rules out aldehydes/terminal alkynes — an alkene.',
              'AI-solved; reagent typos KMnC/ammonic — verify.'),
    (2, 18): ('C', 'Sodium hydroxide absorbs atmospheric CO2 and becomes sodium carbonate, Na2CO3.',
              'AI-solved; subscripts lost in source — verify formulae.'),
    (2, 19): ('D', 'Carboxylic acids carry \u2013COOH.',
              'AI-solved; option D spacing mangled — verify.'),
    (2, 22): ('B', 'Only sodium\u2019s formula is wrong (Na2O, not NaO) — CaO, CuO and Fe3O4 are all correct products.',
              'AI-solved; formula typos Copper (11)/FeO 3 4 — verify.'),
    (2, 25): ('C', 'Molecules escaping from the liquid surface into gas is evaporation.',
              None),
    (2, 28): ('A', '5.85 g NaCl is 0.1 mol, so Cl atoms = 0.1 \u00D7 6.02\u00D710\u00B2\u00B3 = 6.02\u00D710\u00B2\u00B2.',
              'AI-solved; option B exponent incomplete; tail is next-stem leak — verify.'),
    (2, 29): ('B', 'Mg + 2HCl: 0.5\u00D70.25 = 0.125 mol HCl needs 0.0625 mol Mg \u00D7 24 = 1.5 g.',
              None),
}

batches = {1: b1, 2: b2}
out = []
for (b, idx), (ans, exp, note) in SOLVED.items():
    r = batches[b][idx]
    out.append({
        'year': r['year'],
        'number': r['number'],
        'text': ' '.join(r['text'].split()),
        'options': {k: (r['options'].get(k) or '').strip() for k in 'ABCDE' if (r['options'].get(k) or '').strip()},
        'answer': ans,
        'explanation': exp,
        'note': note or 'AI-solved — verify answer and explanation against source.',
        'source': f"{r['source']}",
    })
json.dump(out, open('content-folder/_work/chem-solved12.json', 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
print('solutions:', len(out))
