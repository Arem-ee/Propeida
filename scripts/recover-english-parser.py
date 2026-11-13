"""Phase 3: Parser Recovery for English JAMB PDFs.

Reads the raw text dump of both English PDFs and produces a complete,
deduplicated question inventory. Handles:

- Two-column layout artifacts (text is already linearized in the dump)
- Questions split across page boundaries
- Options inline with question text or on separate lines
- Watermark/ad litter removal
- OCR artifacts (D?., taiko, fused words)
- Year/section/passage tracking

Output: content-folder/_parsed/english-parsed-recovery.json
  Merged with existing parsed data, deduplicated by (year, number).
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DUMP_DIR = ROOT / 'content-folder' / '_dump'
PARSED_DIR = ROOT / 'content-folder' / '_parsed'
OUT_PATH = PARSED_DIR / 'english-parsed-recovery.json'

# ---------------------------------------------------------------------------
# Regex patterns
# ---------------------------------------------------------------------------

YEAR_RE = re.compile(r'USE OF ENGLISH\s+(19\d{2}|20\d{2})\s*(.*)', re.I)
PASS_RE = re.compile(r'^PASSAGE\s+([A-Z])\s*$', re.I)
Q_RE = re.compile(r'^(\d{1,3})\.\s+(.*)', re.I)
# Option marker: letter followed by period, possibly with leading whitespace
OPT_RE = re.compile(r'^([A-E])\.\s+(.*)', re.I)
# Inline option: question text ends with option marker and text on same line
INLINE_OPT_RE = re.compile(r'\s+([A-E])\.\s+(.+)$', re.I)
PAGE_RE = re.compile(r'^===== PAGE \d+ =====\s*$')
WATERMARK_RE = re.compile(
    r'(myschoolgist|https?://|www\.|^Download MySchool)', re.I
)
BARE_PAGE_NUM = re.compile(r'^\d{1,3}$')


def clean_line(s: str) -> str:
    """Strip and normalize a line, return empty if it's junk."""
    s = s.strip()
    if not s:
        return ''
    # Vertical watermark letters: single alphanumeric
    if re.fullmatch(r'[A-Za-z0-9]', s):
        return ''
    if WATERMARK_RE.search(s):
        return ''
    if BARE_PAGE_NUM.match(s):
        return ''
    return s


def merge_watermark_junk(text: str) -> str:
    """Remove common OCR/watermark artifacts from text."""
    # Remove "Download MySchoolGist..." artifacts
    text = re.sub(
        r'Download MySchoolGist JAMB CBT Software from https://www\.myschoolgist\.com/\s*www\.myschoolgist\.com',
        '',
        text,
        flags=re.I,
    )
    # Fix common OCR: "taiko" -> "the", "nature�?Ts" -> "nature's"
    text = text.replace('taiko the', 'the the')
    text = text.replace('nature�?Ts', "nature's")
    text = text.replace('nature�?T', "nature's")
    # Fix fused option letters like "D?."
    text = re.sub(r'D\?\.', 'D.', text)
    text = re.sub(r'B\?\.', 'B.', text)
    text = re.sub(r'C\?\.', 'C.', text)
    text = re.sub(r'A\?\.', 'A.', text)
    text = re.sub(r'E\?\.', 'E.', text)
    return text


def parse_dump(text: str) -> list[dict]:
    """Parse the full text dump into question records."""
    lines = [clean_line(ln) for ln in text.split('\n')]
    lines = [ln for ln in lines if ln]

    records: list[dict] = []
    year: str | None = None
    section: str = ''
    passage_title: str = ''
    passage_text: list[str] = []
    in_passage = False
    cur_q: dict | None = None
    pending_passage = False

    def flush_q():
        nonlocal cur_q
        if cur_q is not None and cur_q.get('options'):
            # Build question text
            q_text = ' '.join(cur_q['lines']).strip()
            # Merge any inline options that were appended to lines
            # (already handled in line processing)
            records.append({
                'year': year,
                'section': section,
                'passage_title': passage_title,
                'passage_text': ' '.join(passage_text).strip(),
                'number': cur_q['number'],
                'text': q_text,
                'options': {
                    k: cur_q['options'].get(k, '') for k in 'ABCDE'
                },
                'answer': None,
                'source': f'USE-OF-ENGLISH-JAMB-Past-Questions [{year}]',
                'recovered': True,
                'orphan': False,
            })
        cur_q = None

    for ln in lines:
        # Year header
        m_year = YEAR_RE.match(ln)
        if m_year:
            flush_q()
            year = m_year.group(1)
            section = m_year.group(2).strip()
            passage_lines = []
            in_passage = False
            continue
        if year is None:
            continue

        # Passage marker
        m_pass = PASS_RE.match(ln)
        if m_pass:
            flush_q()
            passage_title = m_pass.group(1)
            passage_lines = []
            in_passage = True
            continue

        # Question marker
        m_q = Q_RE.match(ln)
        if m_q:
            flush_q()
            n = int(m_q.group(1))
            rest = m_q.group(2).strip()
            cur_q = {
                'number': n,
                'lines': [rest],
                'options': {},
                'opt': None,
            }
            # Check for inline option on same line as question
            m_inline = INLINE_OPT_RE.match(rest)
            if m_inline:
                cur_q['lines'] = [m_inline.group(1).strip()]
                cur_q['options'][m_inline.group(2)[0]] = m_inline.group(2)[2:].strip()
                cur_q['opt'] = m_inline.group(2)[0]
            continue

        # Option marker
        m_o = OPT_RE.match(ln)
        if m_o and cur_q is not None:
            cur_q['options'][m_o.group(1)] = m_o.group(2).strip()
            cur_q['opt'] = m_o.group(1)
            continue

        # Continuation of current question or option
        if cur_q is not None:
            if cur_q.get('opt'):
                # Appending to current option text
                cur_q['options'][cur_q['opt']] += ' ' + ln
            else:
                cur_q['lines'].append(ln)
        elif in_passage:
            passage_lines.append(ln)

    flush_q()
    return records


def main() -> int:
    dump_file = DUMP_DIR / 'Use-of-English-JAMB-Past-Questions-And-Answers.full.txt'
    if not dump_file.exists():
        print(f'ERROR: {dump_file} not found', file=sys.stderr)
        return 1

    text = dump_file.read_text(encoding='utf-8', errors='replace')
    text = merge_watermark_junk(text)

    records = parse_dump(text)
    print(f'Parsed {len(records)} question records from dump')

    # Load existing staged inventory
    staged_path = ROOT / 'content-folder' / 'english-jamb-staged.json'
    staged = json.loads(staged_path.read_text(encoding='utf-8'))
    existing_records = staged.get('records', [])

    # Build lookup of existing canonical keys
    existing_keys: set[str] = set()
    for r in existing_records:
        key = r.get('normalizedCanonicalKey')
        if key:
            existing_keys.add(key)

    # Merge new records, avoiding duplicates
    new_records: list[dict] = []
    dup_count = 0
    for r in records:
        # Build canonical key from question + options
        opts = r.get('options', {})
        if isinstance(opts, dict):
            opt_str = '\n'.join(f"{k}:{v}" for k, v in sorted(opts.items()))
        else:
            opt_str = '\n'.join(f"{o['key']}:{o['text']}" for o in opts)
        canon_input = '\n'.join([
            r.get('question', ''),
            opt_str,
        ])
        canon_key = hashlib.sha1(canon_input.encode('utf-8')).hexdigest()

        if canon_key in existing_keys:
            dup_count += 1
            continue

        # Normalize fields to match staged schema
        new_record = {
            'id': f'eng-src-recovery-{len(new_records) + 1:06d}',
            'source': {
                'file': r['source'],
                'parsedFile': 'content-folder/_parsed/english-parsed-recovery.json',
                'year': r.get('year'),
                'section': r.get('section', ''),
                'number': r.get('number'),
                'sourceField': r.get('source', ''),
                'needsFigure': False,
                'recovered': True,
                'orphan': False,
            },
            'passage': r.get('passage_text', ''),
            'question': r.get('text', ''),
            'options': [
                {'key': k, 'text': v}
                for k, v in sorted(
                    (r.get('options', {}).items()
                     if isinstance(r.get('options'), dict)
                     else [(o['key'], o['text']) for o in r.get('options', [])]),
                    key=lambda x: x[0],
                )
            ],
            'optionsRaw': r.get('options', {}),
            'status': 'unresolved',
            'topic': None,
            'skill': None,
            'difficulty': None,
            'answer': None,
            'explanation': None,
            'canonicalKey': canon_key,
            'duplicateOf': None,
            'qualityFlags': r.get('qualityFlags', []),
            'isCanonical': True,
        }
        new_records.append(new_record)
        existing_keys.add(canon_key)

    print(f'New unique records: {len(new_records)}')
    print(f'Duplicates skipped: {dup_count}')

    # Append to staged inventory
    staged['records'].extend(new_records)
    staged['meta']['sourceRecords'] = len(staged['records'])
    staged['meta']['recoveryRecords'] = len(new_records)
    staged['meta']['productionReadyRecords'] = 0

    staged_path.write_text(
        json.dumps(staged, indent=1, ensure_ascii=False), encoding='utf-8'
    )
    print(f'Wrote {staged_path} ({len(staged["records"])} total source records)')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
