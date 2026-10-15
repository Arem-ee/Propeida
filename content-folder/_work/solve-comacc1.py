"""Stage-3 Commerce + Accounts batch-1 solutions."""
import json

com = json.load(open('content-folder/_work/com-candidates.json', encoding='utf-8'))
acc = json.load(open('content-folder/_work/acc-candidates.json', encoding='utf-8'))
Cb = {1: com, 2: acc}

SOLVED = {
    (1, 0): ('C', 'Net profit = (108 \u2212 91) \u00D7 (1 \u2212 0.45) = 17 \u00D7 0.55 = N9.35 million.',
             'AI-solved; stem head restored from same-source leak — verify.', 'REPAIR_STEM',
             'A company earned a total revenue of N108 million with a total cost of N91 million in 1991. If it paid 45% tax on its gross profit for that year, determine its net profit.'),
    (1, 1): ('C', 'Fixtures and fittings serve the business long-term — fixed assets.', None, None, None),
    (1, 2): ('C', 'Duties raise revenue, retaliate and protect home industry — redistributing domestic income is not among their reasons.', None, None, None),
    (1, 3): ('B', 'Sole enterprise needs little capital and personal supervision — retailing fits; mining, oil and car assembly do not.', None, None, None),
    (1, 4): ('B', 'Coin machines sell directly to final buyers without salespeople — automatic retailing.', None, None, None),
    (1, 5): ('B', 'The wholesaler\u2019s core job is breaking bulk: buying in bulk and selling on in small lots.', None, None, None),
    (1, 6): ('D', 'Export prices against import prices is the terms of trade.',
             'AI-solved; stem typo different for difference — verify.', None, None),
    (1, 10): ('C', 'Printed materials and samples win immediate sales — sales promotion; television is advertising, and cash figures are not promotion tools.',
              'AI-solved; options A/B are leaked figures — verify or reject.', None, None),
    (1, 11): ('A', 'Only face-to-face selling answers back at once — instant feedback.', None, None, None),
    (1, 12): ('C', 'In an agreement to sell, ownership passes later — the transfer is deferred; in a sale it is immediate.', None, None, None),
    (1, 13): ('D', 'N29 against N30 is a counter-offer, not an acceptance — offer but no acceptance.', None, None, None),
    (1, 14): ('A', 'Nationalization moves ownership to the state — government.', None, None, None),
    (1, 16): ('D', 'Computers in banking reflect applied technology — technological development.',
              'AI-solved; typos cotmputers/ecionomic — verify wording.', None, None),
    (1, 18): ('D', 'The Lake Chad Basin Commission manages the lake\u2019s shared water resources among member states.',
              'AI-solved; options A/B are leaked text — verify or reject.', None, None),
    (1, 19): ('D', 'Extraction, manufacturing and construction are industrial; banking and insurance are services.', None, None, None),
    (1, 20): ('A', 'Bricklaying builds houses and roads — shoemaking, blacksmithing and car assembly are crafts, not construction.', None, None, None),
    (1, 22): ('D', 'The factor buys the debts owed by the customers — trade debts of the customers.',
              'AI-solved; verify against source.', None, None),
    (1, 23): ('C', 'Current assets against current liabilities is the current (working-capital) ratio.', None, None, None),
    (1, 25): ('A', 'Goods re-exported earn back the duty paid — customs drawback.', None, None, None),
    (1, 26): ('C', 'Exporters insist on bank-guaranteed payment — the irrevocable confirmed letter of credit.', None, None, None),
    (1, 27): ('C', 'RRF is the Central Bank\u2019s Refinancing and Rediscounting Facility.', None, None, None),
    (1, 28): ('B', 'Trade flows in order: order, delivery note, invoice, debit note, then statement.',
              'AI-solved; typo state ment — verify wording.', None, None),
    (2, 0): ('C', 'The accounting period is the time span — usually one year — covered by a set of financial statements.', None, None, None),
    (2, 1): ('C', 'Matching revenues of a period with the expenses that earned them is the matching concept.', None, None, None),
    (2, 2): ('A', 'The folio column cross-references ledger pages — for referencing.', None, None, None),
    (2, 4): ('C', 'Errors that break double entry leave the trial balance out — the difference waits in the suspense account until the error is found.',
             'AI-solved; stem typo sluspense — verify.', None, None),
}

out = []
batches = {1: com, 2: acc}
for (b, idx), v in SOLVED.items():
    ans, exp, note = v[0], v[1], v[2]
    r = batches[b][idx]
    item = {
        'year': r['year'],
        'number': r['number'],
        'text': ' '.join((v[4] if len(v) > 4 and v[4] else r['text']).split()),
        'options': {k: (r['options'].get(k) or '').strip() for k in 'ABCDE' if (r['options'].get(k) or '').strip()},
        'answer': ans,
        'explanation': exp,
        'note': (note or 'AI-solved — verify answer and explanation against source.'),
        'source': f"{r['source']}",
    }
    if len(v) > 3 and v[3] == 'REPAIR_STEM':
        item['note'] = 'AI-solved; stem head restored from same-source leak — verify. ' + item['note']
    out.append(item)
json.dump(out, open('content-folder/_work/comacc-solved1.json', 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
print('solutions:', len(out))
