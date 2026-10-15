"""Direct diff: find old rows with these contents and their new counterparts."""
import json

old = json.load(open('content-folder/_work/econs-solve.json', encoding='utf-8'))
new = json.load(open('content-folder/_work/econs-now.json', encoding='utf-8'))
idmap = json.load(open('content-folder/_work/econs-idmap.json', encoding='utf-8'))
new_by_id = {r['id']: r for r in new}

needles = ['tax burden', 'ordinal', 'revenue accruing', 'explains why', 'consumer surplus', 'by-product', 'national income accounting', 'embargo', 'shift the supply', 'greater than one', 'median of an odd', 'implement government', 'job opportunities']
for n in needles:
    olds = [r for r in old if n in r['question_text'].lower()]
    print(f'--- {n}: {len(olds)} in OLD')
    for r in olds:
        nid = idmap.get(r['id'], 'NO MAP')
        nr = new_by_id.get(nid)
        print('   old:', r['id'][:8], '| new:', nid[:8] if nid != 'NO MAP' else nid,
              '| new text match:', (nr['question_text'] == r['question_text']) if nr else None)
