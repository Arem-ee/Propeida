"""Emit stage-3 solutions for chemistry batch 1 (indices into chem-candidates)."""
import json

cands = json.load(open('content-folder/_work/chem-candidates.json', encoding='utf-8'))

# index -> (answer, explanation, note)
SOLVED = {
    0: ('D', 'Welding and cutting metals needs the hottest flame — oxy-acetylene (about 3500\u00b0C).',
        'AI-solved; stem typo cotton for cutting? — verify.'),
    2: ('C', 'Yeast fermentation of sugar is the basis of the brewing industry.',
        'AI-solved; stem head fragmentary — verify.'),
    7: ('C', 'More negative \u0394H means more heat evolved: 406 kJ in (II) beats 286 kJ in (I) — so less heat is evolved in (I).',
        'AI-solved; equations and option A mangled in source — verify figures.'),
    8: ('D', 'Mg and Fe sit above hydrogen in the activity series and displace it; lead coats itself in insoluble PbCl2 and copper is below hydrogen.',
        'AI-solved; source typos Mgm/Fem — verify.'),
    9: ('B', 'Stainless steel is iron alloyed with chromium (plus carbon) — read ion as iron.',
        'AI-solved; source typo ion for iron — verify.'),
    10: ('A', '2NaOH needs 1 H2SO4: 0.1\u00D720/1000 = 0.002 mol NaOH \u2192 0.001 mol acid \u2192 0.001/0.5 L = 2.0 cm\u00B3.',
        'AI-solved; formulae mangled in source (MH SO 2 4) — verify figures.'),
    12: ('B', 'BaCl2 gives white BaSO4 with sulphates, and Cu\u00B2\u207A colours the flame green — copper(II) tetraoxosulphate(VI).',
        'AI-solved; subscripts mangled in source — verify formulae.'),
    13: ('D', 'Protons plus neutrons make essentially all atomic mass — electrons are negligible.',
        None),
    18: ('D', 'Brine is solution-mined salt water; evaporating the water leaves sodium chloride.',
        None),
    21: ('C', 'Fe\u00B3\u207A gains an electron (reduction to Fe\u00B2\u207A) while I\u207B loses one — iodide is oxidised to iodine.',
        'AI-solved; options A/B garbled in source — verify.'),
    26: ('D', 'Triple-bonded carbon uses sp hybrid orbitals.',
        'AI-solved; option A typo Sp^ — verify.'),
    27: ('D', 'Breaking big hydrocarbons into smaller, lower-boiling ones by heat is cracking.',
        None),
    29: ('B', 'Graphite\u2019s delocalised electrons conduct — diamond, sulphur and red phosphorus cannot.',
        None),
}

out = []
for idx, (ans, exp, note) in SOLVED.items():
    r = cands[idx]
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
json.dump(out, open('content-folder/_work/chem-solved1.json', 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
print('solutions:', len(out))
