"""Stage-3 Accounts remaining 10 solutions (indices into acc-candidates)."""
import json

acc = json.load(open('content-folder/_work/acc-candidates.json', encoding='utf-8'))

SOLVED = {
    5: ('B', 'The petty cashier is advanced a float and reimbursed on replenishment — debited at establishment and at every replenishment.',
        None),
    10: ('C', 'Debtors 6000\u2212320 = 5680; 2.5% of 5680 = 142. Provision stands at 190, so credit P&L with 190\u2212142 = 48.',
         'AI-solved; provision rate obscured in source (2.%); 2.5% locks the arithmetic — verify.'),
    12: ('B', 'Receipts and payments records all cash received and paid in the year, regardless of period — unlike income and expenditure.',
         'AI-solved; stem typo ac- count — verify wording.'),
    14: ('A', 'A club\u2019s trading surplus is income of the year — into the income and expenditure account.',
         None),
    17: ('A', 'Only purchased goodwill ever enters the books — home-grown goodwill is never raised.',
          'AI-solved; typos beewn/wnew/insolv — verify wording.'),
    19: ('B', 'Articles of association govern internal running (shares, meetings); the memorandum defines external relations.',
          'AI-solved; typo theregulations — verify wording.'),
    20: ('B', 'Ratios turn figures into comparisons — they facilitate decision-making; they neither find fraud nor come from law.',
         None),
    21: ('B', 'A tax levied to service maturing debt sits in the Debt Service Fund.',
         None),
    22: ('C', 'Giant firms split ownership from control, forcing systematic accounts — growth plus separation developed accounting.',
          'AI-solved; options A/B garbled in source — verify.'),
    24: ('A', 'Capital = assets \u2212 liabilities: (3600+5000+1650+4800+250+6910) \u2212 (1000+2560) = 23210 \u2212 3560 = N19,650.',
          'AI-solved; stem head cut (Calculate the capita[l]) — verify.'),
}

out = []
for idx, (ans, exp, note) in SOLVED.items():
    r = acc[idx]
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
json.dump(out, open('content-folder/_work/acc-solved2.json', 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
print('solutions:', len(out))
