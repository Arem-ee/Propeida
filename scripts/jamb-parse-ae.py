"""Parser B: merged JAMB banks with continuous numbering (no year sections).

Format (Government file): pypdf extracts cleanly; questions 'N: stem',
options A-E ('X.' with or without following space, sometimes inline),
key blocks of 'N.X' tokens after each ~50-question run.

Usage: python scripts/jamb-parse-ae.py <pdf-path>
Writes content-folder/_parsed/<stem>.json + coverage report.
Rows carry options_a_through_e; answers may be E — ingest holds these
until the session engine supports 5-option legacy questions.
"""
import json
import re
import sys
from pathlib import Path
from pypdf import PdfReader

SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('__none__')

Q_RE = re.compile(r'^(\d+):\s*(.*)')
OPT_RE = re.compile(r'^([A-E])\.\s*(.*)')
KEYTOK_RE = re.compile(r'(\d+)\.\s*([A-E])(?=\s|$)')
JUNK_RES = [
    re.compile(r'myschoolgist', re.IGNORECASE),
    re.compile(r'^https?://'),
    re.compile(r'^www\.'),
    re.compile(r'^\d{1,3}$'),
]


def clean_line(s: str) -> str:
    s = s.strip()
    if not s:
        return ''
    for rx in JUNK_RES:
        if rx.search(s):
            return ''
    if re.fullmatch(r'[A-Za-z0-9]', s):
        return ''
    return s


def split_options(ln: str) -> list[str]:
    """Split fused option runs ('A. xB. y C. z') into segments."""
    marks = re.findall(r'(?:^|\s)([A-E])\.\s*', ln)
    if len(set(marks)) >= 2:
        parts = re.split(r'(?<=\s)(?=[A-E]\.\s*)', ln)
        return [p for p in parts if p.strip()]
    return [ln]


def parse(lines: list[str]):
    blocks: list[dict] = []

    def new_block():
        b = {'qs': [], 'keys': {}}
        blocks.append(b)
        return b

    cur = new_block()
    cur_q = None
    last_num = 0

    def flush_q():
        nonlocal cur_q
        if cur_q is not None and cur_q.get('options'):
            cur['qs'].append(cur_q)
        cur_q = None

    for ln in lines:
        if not ln:
            continue
        toks = KEYTOK_RE.findall(ln)
        # Key-dense line: 2+ key tokens and no question/option shape.
        if len(toks) >= 2 and not Q_RE.match(ln) and not OPT_RE.match(ln):
            for n, a in toks:
                cur['keys'][int(n)] = a
            continue
        m_q = Q_RE.match(ln)
        if m_q:
            n = int(m_q.group(1))
            # New 50-run starts when numbering resets after keys arrived.
            if n <= last_num and cur['keys']:
                flush_q()
                cur = new_block()
                last_num = 0
            flush_q()
            last_num = n
            rest = m_q.group(2)
            cur_q = {'number': n, 'lines': [], 'options': {}, 'opt': None}
            # The stem may carry inline options on the same line.
            segs = split_options(rest)
            first = True
            for sg in segs:
                m_o = OPT_RE.match(sg)
                if m_o:
                    cur_q['options'][m_o.group(1)] = m_o.group(2)
                    cur_q['opt'] = m_o.group(1)
                elif first:
                    if sg.strip():
                        cur_q['lines'].append(sg.strip())
                else:
                    if cur_q['opt']:
                        cur_q['options'][cur_q['opt']] += ' ' + sg.strip()
            first = False
            continue
        if cur_q is not None:
            for sg in split_options(ln):
                m_o = OPT_RE.match(sg)
                if m_o and (cur_q['opt'] is None or m_o.group(1) != cur_q['opt'] or True):
                    # A repeated marker letter starts a new option only if we
                    # already hold text for it; else it's a fused continuation.
                    if m_o.group(1) in cur_q['options'] and cur_q['options'][m_o.group(1)]:
                        # new occurrence of same letter: continuation text
                        cur_q['options'][m_o.group(1)] += ' ' + m_o.group(2)
                    else:
                        cur_q['options'][m_o.group(1)] = m_o.group(2)
                        cur_q['opt'] = m_o.group(1)
                elif cur_q.get('opt'):
                    cur_q['options'][cur_q['opt']] += ' ' + sg.strip()
                else:
                    cur_q['lines'].append(sg.strip())
    flush_q()
    return blocks


def main():
    reader = PdfReader(SRC)
    raw: list[str] = []
    for p in reader.pages:
        raw.extend((p.extract_text() or '').split('\n'))
    lines = [clean_line(ln) for ln in raw]
    lines = [ln for ln in lines if ln]

    blocks = parse(lines)
    rows = []
    stats = {'blocks': len(blocks), 'questions': 0, 'with_keys': 0, 'short_options': 0, 'e_answers': 0}
    for bi, b in enumerate(blocks):
        for q in b['qs']:
            stats['questions'] += 1
            opts = q['options']
            if len([k for k in 'ABCDE' if opts.get(k)]) < 4:
                stats['short_options'] += 1
            ans = b['keys'].get(q['number'])
            if ans:
                stats['with_keys'] += 1
                if ans == 'E':
                    stats['e_answers'] += 1
            rows.append({
                'block': bi,
                'number': q['number'],
                'text': ' '.join(q['lines']).strip(),
                'options': {k: opts.get(k, '') for k in 'ABCDE'},
                'answer': ans,
                'source': f'{SRC.stem} [run {bi + 1}]',
            })

    out = Path('content-folder/_parsed') / (SRC.stem + '.json')
    out.write_text(json.dumps(rows, indent=1, ensure_ascii=False), encoding='utf-8')
    print(f'wrote {out} ({len(rows)} rows)')
    print('report:', json.dumps(stats))
    for r in rows[:3]:
        if r['answer']:
            print(f"--- Q{r['number']}: {r['text'][:100]}")
            print(f"    A) {r['options']['A'][:50]} | ans={r['answer']}")
            break


if __name__ == '__main__':
    main()
