import json, re
from pathlib import Path
from collections import Counter

PDF_TEXT = Path('C:/Users/USER/AppData/Local/Temp/opencode/pdf-text.txt').read_text(encoding='utf-8', errors='replace')
payload_path = Path('content-folder/english-jamb-staged-clean-v3.json')

STOP = set("""
a about above after again against all also am an and any are aren't as at back be because been before being below between both but by can cannot could couldn't did didn't do does doesn't doing don't down during each few for from further had hadn't has hasn't have haven't having he he'd he'll he's her here here's hers herself him himself his how how's i i'd i'll i'm i've if in into is isn't it it's its itself let's me more most mustn't my myself nor of off on once only or other ought our ours ourselves out over own same shan't she she'd she'll she's should shouldn't so some such than that that's the their theirs them themselves then there there's these they they'd they'll they're they've this those through to too under until up very was wasn't we we'd we'll we're we've were weren't what what's when when's where where's which while who who's whom why why's with won't would wouldn't you you'd you'll you're you've your yours yourselves your you're passage paragraph
""".split())

def norm(s):
    return re.sub(r'[^a-z0-9 ]', ' ', (s or '').lower())

def tokset(s):
    return {w for w in norm(s).split() if w not in STOP and len(w) > 2}

def bigrams(s):
    t = [w for w in norm(s).split() if w not in STOP and len(w) > 2]
    return {f'{t[i]} {t[i+1]}' for i in range(len(t)-1)}

# Wider year header pattern: catches USE OF ENGLISH <year>, JAMB ENGLISH <year>, COMPREHENSION <year>, JAMB ENGLISH 1986 etc.
year_re = re.compile(r'(?:USE OF ENGLISH|JAMB ENGLISH|Use of English|JAMB ENGLISH|COMPREHENSION|COMPREHENSION AND|ENGLISH \()[^\n]{0,40}(\d{4})', re.I)
markers = list(year_re.finditer(PDF_TEXT))
# Drop markers mid-document that are bogus (e.g., math problems containing 1978 inside) - keep year monotone cuts
year_blocks = []
for i, m in enumerate(markers):
    start, end = m.start(), (markers[i+1].start() if i + 1 < len(markers) else len(PDF_TEXT))
    year_blocks.append((m.group(1), start, end))

pass_re = re.compile(r'PASSAGE\s*(?:[A-Z]+|\d+|[IVXLC]+)', re.I)
first_q_re = re.compile(r'\n\d+\.\s', re.M)

passages = []
for year, y0, y1 in year_blocks:
    block = PDF_TEXT[y0:y1]
    pmark = list(pass_re.finditer(block))
    for pi, m in enumerate(pmark):
        start = m.start()
        end = pmark[pi+1].start() if pi+1 < len(pmark) else len(block)
        chunk = block[start:end].strip().split('Download MySchoolGist')[0].strip()
        q = first_q_re.search(chunk)
        if q:
            chunk = chunk[:q.start()].strip()
        if len(chunk) < 150:
            continue
        passages.append({'year': year, 'text': chunk, 'toks': tokset(chunk), 'bigrams': bigrams(chunk)})

print('passages:', len(passages))
print(Counter(p['year'] for p in passages))

payload = json.loads(payload_path.read_text(encoding='utf-8'))
records = payload['records']

assigned = 0
cleanups = 0
for r in records:
    if r.get('answer'):
        continue
    q = (r.get('question') or '').lower()
    if 'passage' not in q and 'paragraph' not in q and 'text' not in q:
        continue
    q_toks, q_bg = tokset(r.get('question', '')), bigrams(r.get('question', ''))
    if len(q_toks) < 4:
        continue
    yr = str((r.get('source') or {}).get('year') or '')
    scored = []
    for p in passages:
        inter_u = len(q_toks & p['toks'])
        inter_b = len(q_bg & p['bigrams'])
        uni = inter_u / max(1, min(len(q_toks), len(p['toks'])))
        bi = inter_b / max(1, min(len(q_bg), len(p['bigrams'])))
        same = 1.0 if p['year'] == yr else 0.25
        score = uni * 0.55 + bi * 1.6 + same if p['year'] == yr else (uni * 0.45 + bi * 1.6)
        scored.append((score, p))
    scored.sort(key=lambda x: -x[0])
    best_score, best = scored[0]
    second = scored[1][0] if len(scored) > 1 else 0
    margin = best_score / second if second else 999
    bigrams_inter = len(bigrams(r.get('question', '')) & best['bigrams'])
    ok = (best_score >= 0.26 and margin >= 1.08) or bigrams_inter >= 2
    if ok:
        r['passage'] = best['text'][:6000]
        r['passageVerified'] = f'matched PDF {best["year"]} (score {best_score:.2f}, margin {margin:.1f})'
        assigned += 1

print('attached:', assigned)
payload['meta'] = {**payload.get('meta', {}), 'passageReattachedV3': assigned}
payload_path.write_text(json.dumps(payload, indent=1, ensure_ascii=False), encoding='utf-8')
