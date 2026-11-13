import json, re, math
from pathlib import Path
from collections import Counter, defaultdict

PDF_TEXT = Path('C:/Users/USER/AppData/Local/Temp/opencode/pdf-text.txt').read_text(encoding='utf-8', errors='replace')
payload_path = Path('content-folder/english-jamb-staged-clean-v3.json')

STOP = set("""
a about above after again against all also am an and any are aren't as at back be because been before being below between both but by can cannot could couldn't did didn't do does doesn't doing don't down during each few for from further had hadn't has hasn't have haven't having he he'd he'll he's her here here's hers herself him himself his how how's i i'd i'll i'm i've if in into is isn't it it's its itself let's me more most mustn't my myself nor of off on once only or other ought our ours ourselves out over own same shan't she she'd she'll she's should shouldn't so some such than that that's the their theirs them themselves then there there's these they they'd they'll they're they've this those through to too under until up very was wasn't we we'd we'll we're we've were weren't what what's when when's where where's which while who who's whom why why's with won't would wouldn't you you'd you'll you're you've your yours yourselves your you're passage paragraph
""".split())

def norm(s):
    return re.sub(r'[^a-z0-9 ]', ' ', (s or '').lower())

def toklist(s):
    return [w for w in norm(s).split() if w not in STOP and len(w) > 2]

def tokset(s):
    return set(toklist(s))

def bigrams(s):
    t = toklist(s)
    return {f'{t[i]} {t[i+1]}' for i in range(len(t)-1)}

pass_re = re.compile(r'PASSAGE\s*(?:[A-Z]+|\d+|[IVXLC]+)', re.I)
first_q_re = re.compile(r'\n\d+\.\s', re.M)
year_re = re.compile(r'(?:USE OF ENGLISH|JAMB ENGLISH|Use of English|ENGLISH|COMPREHENSION AND|COMPREHENSION)[^\n]{0,40}(\d{4})', re.I)
markers = list(year_re.finditer(PDF_TEXT))
year_blocks = []
for i, m in enumerate(markers):
    start, end = m.start(), (markers[i+1].start() if i + 1 < len(markers) else len(PDF_TEXT))
    year_blocks.append((m.group(1), start, end))

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
        if len(chunk) < 180:
            continue
        head = chunk.strip().lower()[:80]
        if head.startswith('passage below has gaps') or head.startswith('use of english') or head.startswith('the passage below') or 'choose the most appropriate option' in head:
            continue
        if len(tokset(chunk)) < 25:
            continue
        passages.append({'year': year, 'text': chunk, 'toks': tokset(chunk), 'bigrams': bigrams(chunk)})

print('passages:', len(passages))
N = len(passages)
doc_freq = Counter()
for p in passages:
    for w in p['toks']:
        doc_freq[w] += 1
isdf = {w: math.log((N + 1) / (df + 1)) + 1.0 for w, df in doc_freq.items()}

payload = json.loads(payload_path.read_text(encoding='utf-8'))
records = payload['records']

assigned = 0
score_dist = []
for r in records:
    if r.get('passageVerified', '').startswith('manual'):
        continue
    q = (r.get('question') or '').lower()
    if 'passage' not in q and 'paragraph' not in q and 'text' not in q:
        continue
    q_toks = tokset(r.get('question', ''))
    if len(q_toks) < 4:
        continue
    q_bigrams = bigrams(r.get('question', ''))
    # TF-IDF similarity between question and passage
    q_weights = {w: isdf.get(w, 1.0) for w in q_toks}
    q_norm = math.sqrt(sum(w*w for w in q_weights.values()))
    scored = []
    for p in passages:
        dot = sum(q_weights[w] * isdf[w] for w in q_toks & p['toks'])
        # coverage ratio - fraction of question's rare tokens found in passage
        rare = [w for w in q_toks if isdf.get(w, 0) > 1.0]
        p_toks = p['toks']
        coverage = len(set(rare) & p_toks) / len(rare) if rare else 0
        inter_b = len(q_bigrams & p['bigrams'])
        score = (dot / q_norm) * 0.5 + coverage * 1.2 + min(inter_b * 0.25, 1.0)
        scored.append((score, p))
    scored.sort(key=lambda x: -x[0])
    best_score, best = scored[0]
    second = scored[1][0] if len(scored) > 1 else 0
    margin = best_score / second if second else 999
    ok = best_score >= 1.15 and margin >= 1.12
    if ok:
        r['passage'] = best['text'][:6000]
        r['passageVerified'] = f'matched PDF {best["year"]} (score {best_score:.2f}, margin {margin:.1f})'
        assigned += 1
        score_dist.append(round(best_score, 2))

print('attached:', assigned)
print('score sample:', sorted(score_dist)[:20], '...', sorted(score_dist)[-10:])
payload['meta'] = {**payload.get('meta', {}), 'passageReattachedV4': assigned}
payload_path.write_text(json.dumps(payload, indent=1, ensure_ascii=False), encoding='utf-8')
