"""Stage-3 CRK batch-1 solutions (indices into crk-candidates)."""
import json

crk = json.load(open('content-folder/_work/crk-candidates.json', encoding='utf-8'))

SOLVED = {
    0: ('A', 'The true mother surrenders the child rather than see him split — giving him to her opponent.',
        'AI-solved; option E is leaked text — verify or reject.'),
    1: ('B', 'God told Moses to raise the bronze serpent; whoever looked at it lived.', None),
    3: ('B', 'Jeremiah presents Babylon\u2019s yoke as God\u2019s own instrument — part of the divine purpose, not accident.',
         'AI-solved; options C/D/E tails garbled — verify.'),
    4: ('C', 'Day three: dry land (and vegetation) — light was day one, firmament day two.', None),
    5: ('A', 'The riot began on the charge that Paul brought Greeks past the temple barrier.', None),
    9: ('E', 'The same cure as in the wilderness — a look at the bronze serpent.', None),
    10: ('D', 'Moses was barred for the Meribah rebellion, so Joshua led Israel in.', None),
    11: ('A', 'Deuteronomy renews the covenant because a new generation stands at Moab.',
          'AI-solved; option E is next-stem leak — verify.'),
    14: ('D', 'Lebanon supplied cedar timber for Solomon\u2019s temple, paid in wheat and oil.', None),
    17: ('B', 'The women carried spices to anoint Jesus\u2019 body.', None),
    18: ('B', 'Spoken to the self-righteous — the Pharisee boasts while the tax collector repents.', None),
    19: ('B', 'The Sanhedrin seized them for proclaiming the resurrection in Jesus.',
          'AI-solved; stem head cut (arrested by the Sanhedrin) — verify.'),
    20: ('D', 'The Seven were chosen to serve tables so the Twelve could preach.', None),
    21: ('A', 'Acts 28: Paul calls the local Jewish leaders first.',
          'AI-solved; options B/E garbled in source — verify.'),
    22: ('D', 'Day six: land animals and man.', None),
    23: ('E', 'The waters prevailed 150 days (Genesis 7:24).', None),
    24: ('C', 'Genesis 17:1 came to 99-year-old Abram.', None),
    25: ('E', 'After the gnats, Pharaoh\u2019s magicians concede the finger of God (Exodus 8:19).', None),
    26: ('B', 'Israel\u2019s pledge at Sinai (Exodus 19:8).',
          'AI-solved; option E is next-stem leak — verify.'),
    27: ('C', 'He grew up in Nazareth of Galilee.', None),
    28: ('C', 'Zacchaeus the tax collector — salvation comes to his house (Luke 19:9).',
          'AI-solved; option A fused with next stem — verify or reject.'),
    29: ('D', 'Acts 15: circumcision and the Gentiles — the fate of Gentile Christians.', None),
}

out = []
for idx, (ans, exp, note) in SOLVED.items():
    r = crk[idx]
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
json.dump(out, open('content-folder/_work/crk-solved1.json', 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
print('solutions:', len(out))
