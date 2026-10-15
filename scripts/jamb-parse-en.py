"""Parser C: English merged bank from cached pypdf text (694 pages).

Format: 'USE OF ENGLISH YYYY <SECTION>' headers, 'PASSAGE X' blocks,
'N.' questions, A-E (older years) or A-D options. No keys in source
(headers only) — rows stay keyless and held for future keys.

Usage: python scripts/jamb-parse-en.py
Reads content-folder/_dump/Use-of-English-JAMB-Past-Questions-And-Answers.full.txt
Writes content-folder/_parsed/Use-of-English.json + report.
"""
import json
import re
from pathlib import Path

SRC = Path('content-folder/_dump/Use-of-English-JAMB-Past-Questions-And-Answers.full.txt')
YEAR_RE = re.compile(r'USE OF ENGLISH\s+(19\d{2}|20\d{2})\s*(.*)')
PASS_RE = re.compile(r'^PASSAGE\s+([A-Z])\s*$')
Q_RE = re.compile(r'^(\d{1,3})\.\s+(.*)')
OPT_RE = re.compile(r'^([A-E])\.\s*(.*)')
JUNK_RES = [
    re.compile(r'myschoolgist', re.IGNORECASE),
    re.compile(r'^https?://'),
    re.compile(r'^www\.'),
    re.compile(r'^Download MySchool'),
    re.compile(r'^===== PAGE \d+ =====$'),
    re.compile(r'^\d{1,3}$'),
]


def clean(s: str) -> str:
    s = s.strip()
    if not s or re.fullmatch(r'[A-Za-z0-9]', s):
        return ''
    for rx in JUNK_RES:
        if rx.search(s):
            return ''
    return s


def main():
    lines = [clean(ln) for ln in SRC.read_text(encoding='utf-8').split('\n')]
    lines = [ln for ln in lines if ln]

    rows = []
    year = None
    section = ''
    passage_title = ''
    passage_lines: list[str] = []
    in_passage = False
    cur_q = None
    stats = {'years': set(), 'questions': 0, 'short_options': 0, 'e_options': 0}

    def flush_q():
        nonlocal cur_q
        if cur_q is not None and cur_q.get('options'):
            stats['questions'] += 1
            opts = cur_q['options']
            if len([k for k in 'ABCDE' if opts.get(k)]) < 4:
                stats['short_options'] += 1
            if opts.get('E'):
                stats['e_options'] += 1
            text = ' '.join(cur_q['lines']).strip()
            if passage_lines and cur_q.get('uses_passage'):
                text = '[Passage]\n' + ' '.join(passage_lines) + '\n[Question]\n' + text
            rows.append({
                'year': year,
                'section': section,
                'number': cur_q['number'],
                'text': text,
                'options': {k: opts.get(k, '') for k in 'ABCDE'},
                'answer': None,
                'source': f'Use-of-English-JAMB [{year}]',
            })
        cur_q = None

    for ln in lines:
        m_year = YEAR_RE.match(ln)
        if m_year:
            flush_q()
            year = m_year.group(1)
            section = m_year.group(2).strip()
            stats['years'].add(year)
            passage_lines = []
            in_passage = False
            continue
        if year is None:
            continue
        m_pass = PASS_RE.match(ln)
        if m_pass:
            flush_q()
            passage_title = m_pass.group(1)
            passage_lines = []
            in_passage = True
            continue
        m_q = Q_RE.match(ln)
        if m_q:
            n = int(m_q.group(1))
            prev = cur_q['number'] if cur_q else 0
            has_a = cur_q and 'A' in cur_q.get('options', {})
            if cur_q is None or (has_a and n > prev):
                flush_q()
                cur_q = {
                    'number': n,
                    'lines': [m_q.group(2)],
                    'options': {},
                    'opt': None,
                    'uses_passage': in_passage,
                }
                continue
        m_o = OPT_RE.match(ln)
        if m_o and cur_q is not None:
            cur_q['options'][m_o.group(1)] = m_o.group(2)
            cur_q['opt'] = m_o.group(1)
            continue
        if cur_q is not None:
            if cur_q.get('opt'):
                cur_q['options'][cur_q['opt']] += ' ' + ln
            else:
                cur_q['lines'].append(ln)
        elif in_passage:
            passage_lines.append(ln)
    flush_q()

    out = Path('content-folder/_parsed') / 'Use-of-English.json'
    out.write_text(json.dumps(rows, indent=1, ensure_ascii=False), encoding='utf-8')
    stats['years'] = sorted(stats['years'])
    print(f'wrote {out} ({len(rows)} rows)')
    print('report:', json.dumps(stats))
    for r in rows[:2]:
        print(f"--- {r['year']} Q{r['number']}: {r['text'][:100]}")
        print(f"    A) {r['options']['A'][:50]} | E: {bool(r['options']['E'])}")


if __name__ == '__main__':
    main()
