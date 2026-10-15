"""Stage-3 Physics batch-1 solutions (indices into phy-candidates)."""
import json

phy = json.load(open('content-folder/_work/phy-candidates.json', encoding='utf-8'))

SOLVED = {
    0: ('B', 'v = c/n = 3.0\u00D710\u2078/1.5 = 2.0\u00D710\u2078 m/s.',
        'AI-solved; exponents lost in source (10\u00B3 for 10\u2078); stem tail fused — verify.'),
    1: ('A', 'Mass is intrinsic: RD \u00D7 volume = 19 \u00D7 20 = 380 g whether immersed or not.',
        'AI-solved; immersion is a red herring — verify.'),
    7: ('C', 'I = V/R = 2.0/4 = 0.5 A; r = (E\u2212V)/I = 0.2/0.5 = 0.4 \u03A9.',
        'AI-solved; stem head cut — verify.'),
    10: ('A', 'Parallel pair: 1.5 V with 1 \u03A9 internal; plus 1 \u03A9 load = 2 \u03A9; I = 1.5/2 = 0.75 A.',
         'AI-solved; options wrongly unitised as Ohms — verify.'),
    11: ('C', 'Heat = I\u00B2Rt = 4\u00D75\u00D730 = 600 J vaporises 5 g: L = 600/5 = 120 J/g.',
         None),
    13: ('C', 'c = Q/(m\u0394T) = (100\u00D720)/(0.01\u00D75) = 2000/0.05 = 4.0\u00D710\u2074 J/kg/K.',
          'AI-solved; typos mrate/5 0C/ktg — verify.'),
    16: ('C', 'h = P/(\u03C1g) = 10\u2075/(1\u00D710) = 10,000 m.',
          'AI-solved; 105N and 10m s-1 read as powers — verify.'),
    17: ('C', 'A microphone turns sound into electrical signals — the reverse of a loudspeaker.',
          None),
    20: ('B', '650 W \u00D7 10 h = 6.5 kWh at 2 kobo = 13 kobo = N0.13.',
          None),
    21: ('D', 'T scales with \u221AL: doubling length multiplies period by \u221A2 — 2.0 \u00D7 1.414 = 2.83 s.',
          None),
    26: ('D', '\u0394A = 2\u03B1A\u0394T = 2 \u00D7 2.5\u00D710\u207B\u2075 \u00D7 1.5 \u00D7 (\u221240) = \u22120.003 m\u00B2; A = 1.497 m\u00B2.',
          'AI-solved; 1,5002m and -200C read as 1.500 m\u00B2 and \u221220\u00B0C — verify.'),
    27: ('A', '600 C liberates the copper (1.98/0.0033); at 2 A that is 300 s = 5 minutes.',
          None),
    29: ('B', 'Vs/Vp = Ns/Np: 120 \u00D7 2500/500 = 600 V.',
          None),
}

out = []
for idx, (ans, exp, note) in SOLVED.items():
    r = phy[idx]
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
json.dump(out, open('content-folder/_work/phy-solved1.json', 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
print('solutions:', len(out))
