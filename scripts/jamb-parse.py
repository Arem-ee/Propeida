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

# Year banners are emitted by page_text() with this sentinel so parse()
# can tell them from question text even when watermark letters scramble
# the banner ('Bioloog o y 1 l 9 g 95 i').
BANNER_SENTINEL = '\x01BANNER\x01'


def banner_year(s: str) -> str | None:
    """Recover 'YYYY' from a watermark-scrambled banner line.

    Banner text interleaves with watermark letters giving '20dec0om3'
    for 2003; the year's digits keep their order, so scan the digit
    sequence for the first window that reads as a plausible year.
    """
    digits = re.sub(r'\D', '', s)
    for i in range(len(digits) - 3):
        y = int(digits[i:i + 4])
        if 1980 <= y <= 2035:
            return str(y)
    return None


def strip_watermark_chars(page):
    """Drop the giant diagonal watermark glyphs.

    Booklets carry 'www.myschoolgist.com' drawn diagonally at 80-110pt in
    AdobeArabic-Italic. Their glyph boxes overlap neighbouring text lines,
    so pdfplumber interleaves the letters into words ('o46', 'eh47.',
    's5?0.', 'and1 0f.') and column crops pick them up by bbox overlap.
    Removing them at char level fixes question markers everywhere.
    """
    def keep(obj):
        if obj.get('object_type') != 'char':
            return True
        if (obj.get('size') or 0) > 50:
            return False
        return 'AdobeArabic' not in (obj.get('fontname') or '')

    return page.filter(keep)


def _emit_band(page, out: list[str], y0: float, y1: float, mid: float, w: float) -> None:
    left = page.crop((0, y0, mid, y1)).extract_text() or ''
    right = page.crop((mid, y0, w, y1)).extract_text() or ''
    if left.strip():
        out.append(left)
    if right.strip():
        out.append(right)


def page_text(page) -> str:
    """Restore reading order for two-column pages.

    Naive extraction interleaves the columns line by line, collapsing
    questions; word-row heuristics still fuse rows when the mid-page gap
    is small. Instead: detect full-width black banner rects (year
    headers), split the page into vertical bands at those banners, and
    read each band left column fully, then right column fully. The
    banner is emitted between bands (sentinel-prefixed per line) so its
    year header lands in the right reading position even when watermark
    letters scramble the banner text.
    """
    w, h = page.width, page.height
    mid = w / 2

    # Only true banner rects (their text still carries a year) may split
    # the page into bands. Wide shallow rects also decorate ordinary
    # question and option rows ('A. 22.4 dm3 B. 33.6 dm3'); treating
    # those as banners excised their text from the flow, so anything
    # without a year in its crop text is ignored entirely.
    bands: list[tuple[float, float, str]] = []
    for r in page.rects:
        rw = r.get('width') or 0
        rh = r.get('height') or 0
        if rw > 0.7 * w and rh < 0.2 * h:
            crop = page.crop((0, max(0.0, r['top'] - 2), w, min(h, r['bottom'] + 2)))
            txt = crop.extract_text() or ''
            if banner_year(txt):
                bands.append((r['top'], r['bottom'], txt))
    bands.sort()

    out: list[str] = []
    y = 0.0
    for top, bottom, banner in bands:
        if top > y + 1:
            # Stop 0.5pt above the banner: leaked banner-text tops sit
            # ~0.1pt above the rect edge and would re-fire the year as
            # a plain line downstream ('stry 1990'), while genuine text
            # lines sit further above and must stay in.
            _emit_band(page, out, y, top - 0.5, mid, w)
        for bl in banner.split('\n'):
            if bl.strip():
                out.append(BANNER_SENTINEL + bl.strip())
        y = bottom
    if y < h - 1:
        _emit_band(page, out, y, h, mid, w)
    return '\n'.join(out)


WM_LETTERS = set('myschoolgistcomwww')

# Every overlap-salvage rewrite (original, fixed) for review.
SALVAGE_LOG: list[tuple[str, str]] = []


def overlap_salvage(s: str):
    """Left-column tail interleaved with the right column's marker at the
    same y ('es rel3a1x..' = 'relax.' + '31.'; 's5?0.' = 's' + '50.';
    'nd 8.13.' = 'nd 8.' + '13.'): rebuild '<n>. <stem>' from the junk.
    Returns (number, fixed) or None; the caller gates on section state."""
    if Q_RE.match(s):
        return None
    # Option lines and continuations ('A. 5N in the direction of East',
    # 'B. 55.9 Ohms') are never interleaved-marker damage.
    if re.match(r'^[A-Ea-e][\.\s"\']', s):
        return None
    m_stem = re.search(r'(?<![A-Za-z])(?:[A-Z][a-z]{2,}|[A-Z] [a-z]{2,})', s)
    if not (m_stem and 0 < m_stem.start() <= 20):
        return None
    junk = s[:m_stem.start()]
    if not re.search(r'\d', junk) or re.search(r'[A-Z][a-z]', junk):
        return None
    # Marker damage always leaves punctuation at the junk tail ('e33.',
    # '5?0.', 'rel3a1x..'); a bare trailing digit is a quantity ('30.0',
    # 'the 7', '2V, 6') that merely sits before a capitalised word.
    if not re.search(r'[.?]\s*$', junk):
        return None
    # Real junk is fused fragments ('growt4h0?.', 'rior.35.', 'other10.');
    # a standalone English word ('in 6 seconds. ') is a stem tail.
    if re.search(r'[a-z]{3,}(\.\s|\s)', junk):
        return None
    dotted = re.findall(r'(\d{1,3})\.', junk)
    if dotted and 1 <= int(dotted[-1]) <= 55:
        cand = int(dotted[-1])
    else:
        # Interleaved markers only ('5?0' / '4h0' / 'and1 0f'); a clean
        # 2+ digit run is a real quantity ('24g', '35ml'), not a marker.
        if re.search(r'\d\d', junk):
            return None
        digs = ''.join(re.findall(r'\d', junk))
        if not digs or not 1 <= int(digs) <= 55:
            return None
        cand = int(digs)
    return cand, f'{cand}. ' + s[m_stem.start():]

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
        # Overlap split a single digit off the marker ('3 0. Items' → '30.').
        s = re.sub(r'^(\d{1,2})\s+(\d)(?=\.\s)', r'\1\2', s)
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
        # Watermark letters split a marker's two digits apart ('th1e5.'
        # = '15.'): rebuild '<n>. <Text>' when the digits glue to a short
        # fragment and a capitalised sentence follows. Both digits and
        # the interleaved letters are required — a single digit fused to
        # a unit ('dm3.') is stem text, not marker damage.
        m_rep = re.match(
            r'^([a-z]{1,4}(?:\s+[a-z]{1,4})*)(\d)([a-z]{1,2})(\d)\.\s+([A-Z].*)$',
            s,
        )
        if m_rep:
            num = int(m_rep.group(2) + m_rep.group(4))
            if 1 <= num <= 60:
                s = f'{num}. {m_rep.group(5)}'
        out.append(s)

    # Reattach detached markers: 'o11.' + 'Consumer surplus…' → one line.
    # Never swallow a following option/number line.
    merged: list[str] = []
    i = 0
    while i < len(out):
        m = DETACHED_RE.match(out[i])
        nxt = out[i + 1] if i + 1 < len(out) else ''
        if (m and nxt and not Q_RE.match(nxt) and not OPT_RE.match(nxt)
                and not nxt.startswith(BANNER_SENTINEL)):
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
# Lower-case option runs ('a. planning…', Commerce 2000/2001 papers).
OPT_LOW_RE = re.compile(r'^([a-e])\.\s+(.*)')
# Phantom number welded onto a live option by column overlap
# ('4. B. make available goods and services').
FUSED_MARKER_RE = re.compile(r'^(\d{1,3})\.\s+([A-E])\.\s+(.*)')
# Two mis-printed option slots fused on one line ('F. Profit-making G. Sales').
FUSED_FG_RE = re.compile(r'^([E-G])\.\s+(.*?)\s+([E-G])\.\s+(.*)')
KEY_RE = re.compile(r'^(\d{1,3})\.\s*([A-E])\b')
# 'Use the data below to answer questions 9 and 10.' / '...questions 9 to 12.'
DATA_REF_RE = re.compile(
    r'use the (data|informationm?|table|diagram|graph|histogram|chart|figure|extract|passage|balance\s+sheet) below to answer questions?\s+(\d{1,3})\s*(?:and|to|-|\u2013)?\s*(\d{1,3})?',
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
    r'use the (data|informationm?|table|diagram|graph|histogram|chart|figure|extract|passage|balance\s+sheet) below to answer\s*$',
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
        if (sec is not None and sec['year'] == year
                and not order and not sec['qblocks']):
            # Banner text leaked into the band above its own rect and
            # re-fired the same year as a plain line; the real banner
            # sentinel line follows immediately. Keep the one section.
            return
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
        # Merge banner runs (year label split across lines by watermark
        # letters) into a single sentinel line.
        if any(ln.startswith(BANNER_SENTINEL) for ln in lines):
            merged_banners: list[str] = []
            for ln in lines:
                if (merged_banners and ln.startswith(BANNER_SENTINEL)
                        and merged_banners[-1].startswith(BANNER_SENTINEL)):
                    merged_banners[-1] += ' ' + ln[len(BANNER_SENTINEL):]
                else:
                    merged_banners.append(ln)
            lines = merged_banners
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
            if ln.startswith(BANNER_SENTINEL):
                body = ln[len(BANNER_SENTINEL):].strip()
                m_year = YEAR_RE.search(body)
                if m_year:
                    new_section(m_year.group(1))
                else:
                    m_bare = YEAR_BARE_RE.match(body)
                    if m_bare and len(body) < 45:
                        new_section(m_bare.group(1))
                    else:
                        y = banner_year(body)
                        if y:
                            new_section(y)
                continue
            m_year = YEAR_RE.search(ln)
            if not m_year:
                m_bare = YEAR_BARE_RE.match(ln)
                if m_bare and len(ln) < 45:
                    # A bare '<Subject> YYYY' line opens a section only when
                    # its pre-year text reads as a subject title or as a
                    # short banner fragment. Question/option prose that
                    # merely ends in a year must not start one — e.g. the
                    # Government option 'B London conference of 1953' and
                    # the stem 'the Republican Constitution in October
                    # 1963' each split the real 1989 paper into phantom
                    # years. Short fragments ('ics 1985', 'Physi 1998') are
                    # scrambled banner remains and are still consumed.
                    if not (OPT_RE.match(ln) or OPT_BARE_RE.match(ln)):
                        _pre = ln[:m_bare.start(1)].rstrip()
                        _lead = ln.split(None, 1)[0]
                        if len(_pre) <= 12 or (len(_lead) >= 2 and _lead[0].isupper()):
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
            # Column-overlap salvage, gated by section state: recover only
            # a number with no block yet, or one the active data-collect
            # awaits (its marker was mangled too).
            sal = overlap_salvage(ln)
            if sal:
                cand, fixed = sal
                if data_collect is None:
                    if not blocks.get(cand):
                        SALVAGE_LOG.append((ln, fixed))
                        ln = fixed
                elif cand in data_collect or cand == data_collect[0] - 1:
                    SALVAGE_LOG.append((ln, fixed))
                    ln = fixed
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
                elif (m_q0 and '.' in (m_q0.group(2) or '')
                        and int(m_q0.group(1)) == data_collect[0] - 1
                        and len((m_q0.group(3) or '').strip()) > 12
                        and len(data_lines) <= 6):
                    # The ref's first number is the question AFTER this one
                    # ('Use the figure…questions 24 to 26' printed above Q23
                    # in the facing column). A full question line interrupts
                    # the collect: drop the (near-empty) blob and parse the
                    # line normally.
                    data_collect = None
                    data_lines = []
                    # fall through to normal handling of this line
                elif len(data_lines) >= 200:
                    # Runaway collection (a dangling ref the skip-check
                    # missed): abandon it and parse this line normally.
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
                # A dangling ref whose range is already answered (the book
                # prints the wrong numbers, e.g. 'questions 27 and 28'
                # against the Q33 figure) would swallow every following
                # line up to the next banner: skip it.
                if any(
                    blocks.get(n) and any(v.get('options') for v in blocks[n])
                    for n in range(lo, hi + 1)
                ):
                    continue
                data_collect = list(range(lo, hi + 1))
                data_kind = (m_data.group(1) or '').lower()
                if data_kind in FIGURE_KINDS:
                    for n in data_collect:
                        pending_figure.add(n)
                data_lines = []
                continue
            # Column overlap welded a phantom number onto a live option
            # ('4. B. make available goods and services'): re-attach the
            # option when the number names another block and the letter is
            # exactly the current block's next option.
            m_fuse = FUSED_MARKER_RE.match(ln)
            if m_fuse:
                b = current()
                fn = int(m_fuse.group(1))
                fl = m_fuse.group(2)
                okey = 'ABCDE'
                cur_opt = b.get('opt') if b is not None else None
                if (
                    b is not None
                    and fn != cur[0]
                    and blocks.get(fn)
                    and cur_opt is not None
                    and cur_opt in okey
                    and okey.index(cur_opt) < 4
                    and fl == okey[okey.index(cur_opt) + 1]
                    and fl not in (b.get('options') or {})
                ):
                    ln = fl + '. ' + m_fuse.group(3)
            m_q = Q_RE.match(ln)
            # Registry model: periods always (re)open their number — empty
            # spurious opens merge harmlessly when the real lines arrive.
            # Bare numbers need substantial text (kills '2 2' fragments).
            if m_q:
                n = int(m_q.group(1))
                has_period = '.' in (m_q.group(2) or '')
                rest = (m_q.group(3) or '').strip()
                if has_period:
                    # Figure labels masquerade as numbered markers: '0.1N
                    # 0.4N' (decimal read as n=0), '2. 2Ohms', '9. 10cm',
                    # '31. 60o'. Opening a block for them steals the
                    # neighbouring question's stem and options (Physics
                    # 1984: '0.1N 0.4N' swallowed Q2's metre-rule stem;
                    # '2. 2Ohms' orphaned Q9). Drop the line; the real
                    # stem and options then flow to the true block.
                    toks = rest.split()
                    figlab0 = (
                        n == 0 and bool(toks) and all(
                            any(c.isdigit() for c in t)
                            or (len(t) == 1 and t.isupper())
                            for t in toks
                        )
                    )
                    # A figure echo of an already-seen number ('46.
                    # 4Ohms' after Q46's real marker) is never a fresh
                    # question; a fresh number fused with figure text
                    # ('9. 10cm') is the real marker and must open.
                    figlab_n = (
                        bool(blocks.get(n))
                        and bool(re.match(r'^\d', rest))
                        and ' ' not in rest and len(rest) < 15
                    )
                    if not (figlab0 or figlab_n):
                        open_number(n, rest)
                    continue
                if len(rest) > 12:
                    open_number(n, rest)
                    continue
            m_o = OPT_RE.match(ln)
            b = current()
            if m_o and b is not None:
                key = m_o.group(1)
                # Mis-printed 4-option sets label slots E/F/G instead of
                # B/C/D (Commerce 2003 Q15): slide back when the letter
                # sits exactly three ahead of the expected slot.
                if key in ('E', 'F', 'G'):
                    cur_opt = b.get('opt')
                    ext = 'ABCDEFG'
                    if (
                        cur_opt in ('A', 'B', 'C')
                        and ext[ext.index(cur_opt) + 4] == key
                        and ext[ext.index(cur_opt) + 1] not in (b.get('options') or {})
                    ):
                        key = ext[ext.index(cur_opt) + 1]
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
            m_low = OPT_LOW_RE.match(ln)
            if m_low and b is not None:
                letter = m_low.group(1).upper()
                used = b.get('options', {})
                cur_opt = b.get('opt')
                okey = 'ABCDE'
                expected = (
                    letter == 'A' if cur_opt is None
                    else (
                        cur_opt in okey
                        and okey.index(cur_opt) < 4
                        and letter == okey[okey.index(cur_opt) + 1]
                    )
                )
                if letter not in used and expected:
                    b['options'][letter] = m_low.group(2)
                    b['opt'] = letter
                    continue
            m_fg = FUSED_FG_RE.match(ln)
            if m_fg and b is not None:
                cur_opt = b.get('opt')
                ext = 'ABCDEFG'
                if cur_opt in ('A', 'B'):
                    t1 = ext[ext.index(cur_opt) + 1]
                    t2 = ext[ext.index(cur_opt) + 2]
                    used = b.get('options') or {}
                    if (
                        m_fg.group(1) == ext[ext.index(t1) + 3]
                        and t1 not in used
                        and m_fg.group(3) == ext[ext.index(t2) + 3]
                        and t2 not in used
                    ):
                        b['options'][t1] = m_fg.group(2)
                        b['options'][t2] = m_fg.group(4)
                        b['opt'] = t2
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
        texts = [page_text(strip_watermark_chars(p)) for p in pdf.pages]

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
    if SALVAGE_LOG:
        print(f'salvage rewrites ({len(SALVAGE_LOG)}):')
        for orig, fixed in SALVAGE_LOG:
            print(f'  {orig[:90]!r} -> {fixed[:90]!r}')
    # show one sample row per section
    shown = set()
    for r in rows:
        if r['year'] not in shown and r['answer']:
            shown.add(r['year'])
            print(f"--- {r['year']} Q{r['number']}: {r['text'][:110]}")
            print(f"    A) {r['options']['A'][:60]} | ans={r['answer']}")


if __name__ == '__main__':
    main()
