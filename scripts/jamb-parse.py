"""Parse JAMB past-question PDFs into structured JSON.

Two-column layouts interleave in raw extraction, so columns are split by
word x-position before reading order is restored. Watermark litter
(vertical single letters, download lines, bare page numbers) is stripped.

Usage: python scripts/jamb-parse.py <pdf-path> [subject-hint]
Writes content-folder/_parsed/<stem>.json + prints a coverage report.

Output: [{year, number, text, options{a,b,c,d}, answer|null, source}]
answer is null when no key matched — those rows never reach the DB
(correct_answer is NOT NULL), they wait for a key.
"""
import json
import re
import sys
import pdfplumber
from pathlib import Path

SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('__none__')

if SRC.name != '__none__':
    with pdfplumber.open(SRC) as _pdf:
        NPAGES = len(_pdf.pages)
else:
    NPAGES = 0


def page_text(page) -> str:
    words = page.extract_words()
    if not words:
        return ''
    mid = page.width / 2
    rows: dict[int, list] = {}
    for w in words:
        rows.setdefault(round(w['top']), []).append(w)

    out: list[str] = []
    left_buf: list[str] = []
    right_buf: list[str] = []

    def flush():
        out.extend(left_buf)
        out.extend(right_buf)
        left_buf.clear()
        right_buf.clear()

    for top in sorted(rows):
        row = sorted(rows[top], key=lambda w: w['x0'])
        line = ' '.join(w['text'] for w in row)
        spans = row[0]['x0'] < mid and row[-1]['x1'] > mid
        if spans:
            # Same-y lines from both columns fuse into one spanning row.
            # Split at the widest inter-word gap near the page middle;
            # true full-width headers have even spacing and stay whole.
            gaps = []
            for a, b in zip(row, row[1:]):
                gaps.append((b['x0'] - a['x1'], (a['x1'] + b['x0']) / 2))
            width, at = max(gaps, key=lambda g: g[0]) if gaps else (0, 0)
            if width > 20 and abs(at - mid) < 80:
                left_part = ' '.join(w['text'] for w in row if (w['x0'] + w['x1']) / 2 < at)
                right_part = ' '.join(w['text'] for w in row if (w['x0'] + w['x1']) / 2 >= at)
                if left_part.strip():
                    left_buf.append(left_part)
                if right_part.strip():
                    right_buf.append(right_part)
                continue
            # Full-width row (headers, key titles): boundary, flush columns.
            flush()
            out.append(line)
        elif (row[0]['x0'] + row[-1]['x1']) / 2 < mid:
            left_buf.append(line)
        else:
            right_buf.append(line)
    flush()
    return '\n'.join(out)


WM_LETTERS = set('myschoolgistcomwww')

# A number/option marker alone on a line: column geometry detached it from
# its text ('10.' then 'from'; 'o11.' fused with a watermark letter).
DETACHED_RE = re.compile(r'^[a-z\.]*(\d{1,3}|[A-E])\.\s*$', re.IGNORECASE)


def clean(lines: list[str]) -> list[str]:
    out = []
    for ln in lines:
        s = ln.strip()
        if not s:
            continue
        # Vertical watermark letters: lone alphanumerics without a period.
        if re.fullmatch(r'[A-Za-z0-9]', s):
            continue
        if 'myschoolgist' in s.lower() or s.startswith('http'):
            continue
        if re.fullmatch(r'\d{1,3}', s):  # bare page numbers
            continue
        # Watermark letter fused to a line start ('ythe', 'oD.', 'hA.'):
        # strip one leading watermark letter when what follows is a word
        # or an option/number marker.
        m = re.match(r'^([a-z\.])(.*)$', s)
        if m and m.group(1).lower() in WM_LETTERS:
            rest = m.group(2)
            if re.match(r'^(\d+\.|[A-E]\.|[A-Z][a-z]{2,})', rest):
                s = rest.strip()
                if not s:
                    continue
        out.append(s)

    # Reattach detached markers: 'o11.' + 'Consumer surplus…' → one line.
    # Never swallow a following option/number line.
    merged: list[str] = []
    i = 0
    while i < len(out):
        m = DETACHED_RE.match(out[i])
        nxt = out[i + 1] if i + 1 < len(out) else ''
        if m and nxt and not Q_RE.match(nxt) and not OPT_RE.match(nxt):
            merged.append(out[i] + ' ' + nxt)
            i += 2
        else:
            merged.append(out[i])
            i += 1
    return merged


YEAR_RE = re.compile(r'UTME\s+(19\d{2}|20\d{2}).*QUESTIONS', re.IGNORECASE)
# Older booklets: a bare '<Subject> YYYY' line ('Commerce 1994').
YEAR_BARE_RE = re.compile(r'^[A-Za-z][A-Za-z &\/\'\-]{2,40}\s+(19\d{2}|20\d{2})$')
Q_RE = re.compile(r'^(\d{1,3})(\.\s*|\s+)(.*)')
OPT_RE = re.compile(r'^([A-E])\.\s+(.*)')
# Some booklets print options without periods ('A the economy').
# A bare letter opens an option only when the letter is fresh for this
# block AND (a run of letter-lines follows, or it is the expected next
# letter). This keeps stems like 'A sovereign state is one' (letter
# already used above) out of the option set.
OPT_BARE_RE = re.compile(r'^([A-E])\s+(.*)')
KEY_RE = re.compile(r'^(\d{1,3})\.\s*([A-E])\b')
# 'Use the data below to answer questions 9 and 10.' / '...questions 9 to 12.'
DATA_REF_RE = re.compile(
    r'use the (data|informationm?|table|diagram|graph|histogram|chart|figure|extract|passage) below to answer questions?\s+(\d{1,3})\s*(?:and|to|-|\u2013)?\s*(\d{1,3})?',
    re.IGNORECASE,
)
FIGURE_KINDS = {'diagram', 'graph', 'histogram', 'chart', 'figure'}
# Literature set-text bindings: 'Questions 2 to 5 are based on De Graft's
# Sons and Daughters'. Without the binding, 'The play can be referred to
# as…' is unanswerable — prepend it like shared data.
SET_TEXT_RE = re.compile(
    r'questions?\s+(\d{1,3})\s*(?:to|-|–|and)\s*(\d{1,3})?\s*(?:are|is)\s+based on\s+(.+)',
    re.IGNORECASE,
)
# The number range often wraps to the next line ('…to answer' / 'questions
# 9 and 10.') — glue those back together before parsing.
ANSWER_WRAP_RE = re.compile(
    r'use the (data|informationm?|table|diagram|graph|histogram|chart|figure|extract|passage) below to answer\s*$',
    re.IGNORECASE,
)


def parse(pages_text: list[str]):
    sections: list[dict] = []  # {year, qblocks, keys}
    sec = None

    in_keys = False
    pending_data: dict[int, str] = {}  # q number -> shared data text
    pending_figure: set[int] = set()  # q numbers whose data is a figure
    pending_settext: dict[int, str] = {}  # q number -> set-text binding
    data_collect: list[int] | None = None
    data_kind = ''
    data_lines: list[str] = []
    # Registry model: blocks keyed by question number, so out-of-order
    # segments (facing-column bleed, split columns) complete the same
    # block instead of collapsing into neighbours. A number reopens its
    # block while option-less; once it holds options, a repeat starts a
    # variant (paper Type variants reuse numbers).
    blocks: dict[int, list[dict]] = {}
    order: list[tuple[int, int]] = []
    cur: tuple[int, int] | None = None

    def new_section(year):
        nonlocal sec, in_keys, data_collect, data_lines
        nonlocal blocks, order, cur
        finalize()
        sec = {'year': year, 'qblocks': [], 'keys': {}}
        pending_data.clear()
        pending_figure.clear()
        pending_settext.clear()
        data_collect = None
        data_lines = []
        blocks = {}
        order = []
        cur = None
        in_keys = False
        sections.append(sec)

    def open_number(n, stem):
        """Open (or re-enter) the block for question number n."""
        nonlocal cur
        variants = blocks.get(n)
        if variants is None:
            variants = []
            blocks[n] = variants
        if variants and not variants[-1].get('options'):
            if stem:
                variants[-1]['lines'].append(stem)
            cur = (n, len(variants) - 1)
        elif variants and len((stem or '').strip()) <= 15:
            # Bare/short repeat of a completed number (facing-column
            # bleed like '13.'): not a variant, fold into current text.
            b = current()
            if b is not None and stem:
                b['lines'].append(stem)
        else:
            variants.append({'number': n, 'lines': [stem] if stem else [], 'options': {}, 'opt': None})
            order.append((n, len(variants) - 1))
            cur = (n, len(variants) - 1)

    def current():
        if cur is None:
            return None
        n, vi = cur
        return blocks[n][vi]

    def finalize():
        if sec is None:
            return
        for (n, vi) in order:
            b = blocks[n][vi]
            if not b.get('lines') and not b.get('options'):
                continue  # empty reopen, nothing captured
            if b.get('options'):
                text = ' '.join(b['lines']).strip()
                shared = pending_data.pop(n, None)
                if shared:
                    text = '[Use the data below]\n' + shared + '\n[Question]\n' + text
                settext = pending_settext.pop(n, None)
                if settext:
                    text = f'[Based on: {settext}]\n' + text
                b['text'] = text
                b['needs_figure'] = n in pending_figure
                pending_figure.discard(n)
                sec['qblocks'].append(b)
            else:
                orphan_lines = list(b['lines'])
                for k, v in (b.get('options') or {}).items():
                    orphan_lines.append(f'[{k}. {v}]')
                sec['qblocks'].append({
                    'number': n,
                    'lines': orphan_lines,
                    'options': {},
                    'opt': None,
                    'text': '[ORPHAN — RECOVER BY HAND] ' + ' '.join(orphan_lines).strip(),
                    'orphan': True,
                })

    for text in pages_text:
        raw = clean(text.split('\n'))
        # Glue wrapped data references back together.
        lines: list[str] = []
        skip_next = False
        for idx, ln in enumerate(raw):
            if skip_next:
                skip_next = False
                continue
            if ANSWER_WRAP_RE.search(ln) and idx + 1 < len(raw):
                lines.append(ln + ' ' + raw[idx + 1])
                skip_next = True
            else:
                lines.append(ln)
        # Inline options ('A. … B. … C. … D. …' on one line): split into
        # parts first. Single stray markers ('D. 24%' inside a stem) stay.
        # Inline question numbers ('…and 13.' — facing-column bleed): split
        # off too; the main loop's guards admit real ones and re-attach
        # spurious fragments as continuations.
        expanded: list[str] = []
        for ln in lines:
            marks = re.findall(r'(?:^|\s)([A-E])\.\s', ln)
            if len(set(marks)) >= 2:
                parts = re.split(r'(?<=\s)(?=[A-E]\.\s)', ln)
                expanded.extend(p for p in parts if p.strip())
            else:
                qparts = re.split(r'(?<=\s)(?=\d{1,3}\.\s)', ln)
                if len(qparts) > 1:
                    expanded.extend(p for p in qparts if p.strip())
                else:
                    expanded.append(ln)
        i = 0
        # Pre-pass: set-text bindings ('Questions 2 to 5 are based on…').
        # Register ranges first (with wrapped author names glued), strip the
        # clause, then parse the remainder normally.
        preprocessed: list[str] = []
        idx = 0
        while idx < len(expanded):
            ln = expanded[idx]
            m_pre = SET_TEXT_RE.search(ln)
            if m_pre and 'ANSWER KEY' not in ln.upper():
                a = int(m_pre.group(1))
                b = int(m_pre.group(2) or m_pre.group(1))
                lo, hi = min(a, b), max(a, b)
                binding = m_pre.group(3).strip()
                j = idx + 1
                insertions: list[tuple[int, str]] = []
                incomplete = bool(re.search(r'\b[A-Z]\.$', binding) or re.fullmatch(r'[A-Z][a-z]+', binding))
                listed = bool(re.search(r'(selected|following|prescribed)\s+(poems?|texts?|passages?|works?|plays?|novels?)\s*:?\s*$', binding, re.IGNORECASE))
                while (incomplete or listed) and j < len(expanded):
                    nxt = expanded[j]
                    if Q_RE.match(nxt) or OPT_RE.match(nxt) or YEAR_RE.search(nxt) or 'ANSWER KEY' in nxt.upper():
                        break
                    if listed:
                        # A list of set texts runs line by line; join with ';'.
                        binding = (binding.rstrip(':') + '; ' + nxt).strip()
                        j += 1
                        continue
                    # Watermark letter fused to the continuation ('wOrwell's').
                    m_fuse = re.match(r'^([a-z\.])(?=[A-Z])', nxt)
                    if m_fuse and m_fuse.group(1).lower() in WM_LETTERS:
                        nxt = nxt[1:]
                    m_end = re.search(r'\.(?:\s|$)', nxt)
                    if m_end:
                        # Title ends mid-line; the tail is live content.
                        binding = (binding + ' ' + nxt[:m_end.end()]).strip()
                        tail = nxt[m_end.end():].strip()
                        if tail:
                            insertions.append((j, tail))
                        j += 1
                        break
                    binding = (binding + ' ' + nxt).strip()
                    j += 1
                    # A binding naming author + work is complete; stop
                    # before swallowing the question stem.
                    incomplete = False
                for pos, tail in insertions:
                    expanded.insert(pos, tail)
                # Watermark letter fused inside the binding ('wOrwell's').
                binding = re.sub(
                    r'\b([a-z\.])(?=[A-Z])',
                    lambda m: '' if m.group(1).lower() in WM_LETTERS else m.group(1),
                    binding,
                )
                for n in range(lo, hi + 1):
                    pending_settext[n] = binding
                rest = (ln[:m_pre.start()] + ' ' + ln[m_pre.end():]).strip()
                if rest and len(rest) >= 4:
                    preprocessed.append(rest)
                idx += 1
                continue
            preprocessed.append(ln)
            idx += 1
        # Lookahead: a bare letter-line ('A text') is an option only if
        # more letter-lines follow (option runs) — computed up front.
        OPT_LETTER_RE = re.compile(r'^[A-E][\.\s]')
        run_ahead = [False] * len(preprocessed)
        for _i, _ln in enumerate(preprocessed):
            for _j in (_i + 1, _i + 2):
                if _j < len(preprocessed) and OPT_LETTER_RE.match(preprocessed[_j]):
                    run_ahead[_i] = True
                    break
        for _li, ln in enumerate(preprocessed):
            m_year = YEAR_RE.search(ln)
            if not m_year:
                m_bare = YEAR_BARE_RE.match(ln)
                if m_bare and len(ln) < 45:
                    new_section(m_bare.group(1))
                    continue
            else:
                new_section(m_year.group(1))
                continue
            if 'ANSWER KEY' in ln.upper():
                in_keys = True
                continue
            if sec is None:
                continue
            if in_keys:
                m = KEY_RE.match(ln)
                if m:
                    sec['keys'][int(m.group(1))] = m.group(2)
                continue
            if data_collect is not None:
                # Data lines run until the first dependent question number.
                m_q0 = Q_RE.match(ln)
                if m_q0 and int(m_q0.group(1)) in data_collect:
                    data_text = ' '.join(data_lines).strip()
                    for n in data_collect:
                        pending_data[n] = data_text
                    data_collect = None
                    data_lines = []
                    # fall through to normal handling of this line
                else:
                    data_lines.append(ln)
                    continue
            m_data = DATA_REF_RE.search(ln)
            if m_data and not in_keys:
                # A data reference doubles as a question number ('9. Use the
                # data below…') while the real Q9 follows the data table.
                # Swallow the line, collect the table, let the real number
                # open its block.
                a, b = int(m_data.group(2)), int(m_data.group(3) or m_data.group(2))
                lo, hi = min(a, b), max(a, b)
                data_collect = list(range(lo, hi + 1))
                data_kind = (m_data.group(1) or '').lower()
                if data_kind in FIGURE_KINDS:
                    for n in data_collect:
                        pending_figure.add(n)
                data_lines = []
                continue
            m_q = Q_RE.match(ln)
            # Registry model: periods always (re)open their number — empty
            # spurious opens merge harmlessly when the real lines arrive.
            # Bare numbers need substantial text (kills '2 2' fragments).
            if m_q:
                n = int(m_q.group(1))
                has_period = '.' in (m_q.group(2) or '')
                rest = (m_q.group(3) or '').strip()
                if has_period:
                    open_number(n, rest)
                    continue
                if len(rest) > 12:
                    open_number(n, rest)
                    continue
            m_o = OPT_RE.match(ln)
            b = current()
            if m_o and b is not None:
                key = m_o.group(1)
                b['options'][key] = m_o.group(2)
                b['opt'] = key
                continue
            m_bare = OPT_BARE_RE.match(ln)
            if m_bare and b is not None:
                letter, rest = m_bare.group(1), m_bare.group(2)
                used = b.get('options', {})
                cur_opt = b.get('opt')
                okey_order = 'ABCDE'
                fresh = letter not in used
                expected = (
                    cur_opt is not None
                    and cur_opt in okey_order
                    and okey_order.index(cur_opt) < 4
                    and letter == okey_order[okey_order.index(cur_opt) + 1]
                )
                if fresh and (run_ahead[_li] or expected):
                    b['options'][letter] = rest
                    b['opt'] = letter
                    continue
            if b is not None:
                if b.get('opt') and b.get('opt') not in ('done',):
                    # continuation of the last option line
                    b['options'][b['opt']] += ' ' + ln
                else:
                    b['lines'].append(ln)
    finalize()
    return sections


def main():
    with pdfplumber.open(SRC) as pdf:
        texts = [page_text(p) for p in pdf.pages]

    sections = parse(texts)
    rows = []
    stats = {'sections': 0, 'questions': 0, 'with_keys': 0, 'short_options': 0, 'dup_numbers': 0}
    for sec in sections:
        stats['sections'] += 1
        seen = set()
        for qb in sec['qblocks']:
            if qb['number'] < 1 or qb['number'] > 60:
                stats['junk_numbers'] = stats.get('junk_numbers', 0) + 1
                continue
            stats['questions'] += 1
            if qb['number'] in seen:
                stats['dup_numbers'] += 1
            seen.add(qb['number'])
            opts = qb['options']
            if len(opts) < 4:
                stats['short_options'] += 1
            ans = sec['keys'].get(qb['number'])
            if ans:
                stats['with_keys'] += 1
            rows.append({
                'year': sec['year'],
                'number': qb['number'],
                'text': qb.get('text', ' '.join(qb['lines']).strip()),
                'options': {k: opts.get(k, '') for k in 'ABCDE'},
                'answer': ans,
                'needs_figure': bool(qb.get('needs_figure')),
                'recovered': bool(qb.get('recovered')),
                'orphan': bool(qb.get('orphan')),
                'source': f'{SRC.stem} [{sec["year"]}]',
            })

    out_dir = Path('content-folder/_parsed')
    out_dir.mkdir(exist_ok=True)
    out = out_dir / (SRC.stem + '.json')
    out.write_text(json.dumps(rows, indent=1, ensure_ascii=False), encoding='utf-8')
    print(f'wrote {out} ({len(rows)} rows)')
    print('report:', json.dumps(stats))
    # show one sample row per section
    shown = set()
    for r in rows:
        if r['year'] not in shown and r['answer']:
            shown.add(r['year'])
            print(f"--- {r['year']} Q{r['number']}: {r['text'][:110]}")
            print(f"    A) {r['options']['A'][:60]} | ans={r['answer']}")


if __name__ == '__main__':
    main()
