"""Classify parsed JAMB question rows for review.

This is an audit only: it does not rewrite or publish rows. It produces
- question-bank-audit.json  (counts + row-level classifications)
- question-bank-audit.csv   (row-level status per question)
- question-bank-audit.md    (human-readable summary)

Run from repo root:
  python content-folder/_work/question_bank_audit.py
"""
from __future__ import annotations

import json
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
PARSED = ROOT / 'content-folder' / '_parsed'
OUT = ROOT / 'content-folder' / '_work'
OUT_JSON = OUT / 'question-bank-audit.json'
OUT_CSV = OUT / 'question-bank-audit.csv'
OUT_MD = OUT / 'question-bank-audit.md'

LETTERS = ['A', 'B', 'C', 'D', 'E']

# The 2026-11-15 economics drain: the parser flattened tables and dropped figures
# to plain text (e.g. "Q(ton) 400 500 600 ... TC(N) 16000 ...", "750 200 950 - 950").
# Any stem mentioning a table/figure is a lost-structure item; any line carrying 4+
# bare numeric tokens is a flattened table row. Both are needs-figure (human re-author).
FIGURE_REF_RE = re.compile(
    r'\b(table|diagram|graph|figure|chart|histogram|pictogram|sketch|column|columns|row|rows|curve|shaded|shading)\b',
    re.I,
)
NUMERIC_TOKEN_RE = re.compile(r'^\d[\d,\.]*$')


def is_digit_wall(stem: str) -> bool:
    """True when any line of the stem carries 4+ bare numeric tokens (flattened table)."""
    for line in stem.splitlines():
        tokens = line.split()
        numeric = sum(1 for t in tokens if NUMERIC_TOKEN_RE.match(t))
        if numeric >= 4:
            return True
    return False


def norm(s: Any) -> str:
    return re.sub(r'[^a-z0-9 ]', '', str(s).lower()).strip()


def load_rows() -> list[dict]:
    rows: list[dict] = []
    for path in sorted(PARSED.glob('*.json')):
        if path.name.startswith('_'):
            continue
        try:
            data = json.load(open(path, encoding='utf-8'))
        except Exception:
            print(f'WARNING: unable to parse {path.name}', file=sys.stderr)
            continue
        if not isinstance(data, list):
            continue
        for r in data:
            if isinstance(r, dict):
                r = {**r, '_file': path.name}
                rows.append(r)
    return rows


def has_bad_chars(s: Any) -> bool:
    return any(ch in str(s) for ch in ['\ufffd', '�', '\x81', '\x8d', '\x91', '\x92', '\x93', '\x94'])


def classify(r: dict) -> tuple[str, list[str]]:
    issues: list[str] = []
    answer = str(r.get('answer') or '').strip().upper()
    options = r.get('options') or {}
    if not isinstance(options, dict):
        options = {}
    stem = str(r.get('text') or '')

    missing = [k for k in ['A', 'B', 'C', 'D'] if not str(options.get(k, '')).strip()]
    if missing:
        issues.append('missing-option-' + ''.join(missing))
    if len(stem) < 30:
        issues.append('short-stem')
    if r.get('orphan'):
        issues.append('orphan')
    if r.get('needs_figure'):
        issues.append('needs-figure')
    if FIGURE_REF_RE.search(stem):
        issues.append('figure-reference')
    if is_digit_wall(stem):
        issues.append('digit-wall')
    if r.get('source_defect'):
        issues.append('source-defect')
    if has_bad_chars(stem):
        issues.append('bad-chars-stem')
    for k in LETTERS:
        v = str(options.get(k, ''))
        if v and has_bad_chars(v):
            issues.append(f'bad-chars-{k}')
    for k in LETTERS:
        v = str(options.get(k, ''))
        if v and re.search(r'\b[A-E]\s*\.\s*\S', v, re.I) and not re.match(r'^\s*[A-E]\s*\.\s', v):
            issues.append(f'fused-option-{k}')
    if re.search(r'\[ORPHAN', stem, re.I):
        issues.append('orphan-text')
    if not answer or answer not in LETTERS:
        issues.append('no-answer')

    if issues:
        if candidate_repair(issues):
            return 'needs-repair', issues
        if any(i.startswith('no-answer') for i in issues):
            return 'needs-answer', issues
        if any(i == 'needs-figure' for i in issues):
            return 'needs-figure', issues
        if any(i.startswith('figure-reference') or i.startswith('digit-wall') for i in issues):
            return 'needs-figure', issues
        if any(i == 'orphan' for i in issues):
            return 'orphan', issues
        if any('missing-option' in i for i in issues):
            return 'missing-option', issues
        if any('bad-chars' in i for i in issues):
            return 'bad-chars', issues
        if any('fused-option' in i for i in issues):
            return 'fused-option', issues
        if any('orphan-text' in i for i in issues):
            return 'orphan-text', issues
        return 'needs-review', issues

    return 'ready', []


def candidate_repair(issues: list[str]) -> bool:
    if any(i.startswith('missing-option') for i in issues):
        return True
    if any(i.startswith('fused-option') for i in issues):
        return True
    if any(i.startswith('bad-chars') for i in issues):
        return True
    if 'orphan-text' in issues or 'orphan' in issues:
        return True
    return False


def canonical_key(r: dict) -> str:
    stem = norm(r.get('text'))[:250]
    opts = []
    for k in LETTERS:
        opts.append(norm((r.get('options') or {}).get(k, ''))[:80])
    return stem + '||' + '||'.join(opts)


def main() -> None:
    rows = load_rows()
    counts_by_file: dict[str, Counter] = defaultdict(Counter)
    row_out = []

    # First pass: classify.
    file_indices: Counter = Counter()
    for r in rows:
        file_name = r['_file']
        r = {**r, '_file_index': file_indices[file_name]}
        file_indices[file_name] += 1
        status, issues = classify(r)
        row_out.append((r, status, issues))
        counts_by_file[file_name][status] += 1

    # Second pass: flag exact duplicates among ready/near-ready rows.
    seen: dict[str, dict] = {}
    for i, (r, status, issues) in enumerate(row_out):
        key = canonical_key(r)
        if not key:
            continue
        prev = seen.get(key)
        if prev is not None:
            row_out[prev] = (row_out[prev][0], 'duplicate', row_out[prev][2] + ['exact-duplicate'])
            counts_by_file[row_out[prev][0]['_file']][row_out[prev][1]] -= 1
            counts_by_file[row_out[prev][0]['_file']]['duplicate'] += 1
            row_out[i] = (r, 'duplicate', issues + ['exact-duplicate'])
            counts_by_file[r['_file']][status] -= 1
            counts_by_file[r['_file']]['duplicate'] += 1
        else:
            seen[key] = i

    final_counts: Counter = Counter()
    for _, status, _ in row_out:
        final_counts[status] += 1

    counts_serial: dict[str, dict] = {}
    for file_name, c in sorted(counts_by_file.items()):
        counts_serial[file_name] = dict(sorted(c.items()))

    items: list[dict] = []
    for idx, (r, status, issues) in enumerate(row_out):
        items.append({
            'index': r.get('_file_index'),
            'global_index': idx,
            'file': r['_file'],
            'year': r.get('year'),
            'number': r.get('number'),
            'status': status,
            'issues': issues,
            'answer': r.get('answer') or None,
            'needs_figure': bool(r.get('needs_figure')) or any(i.startswith('figure-reference') or i.startswith('digit-wall') for i in issues),
            'orphan': bool(r.get('orphan')),
        })

    summary = {
        'generated_at': datetime.now().isoformat(timespec='seconds'),
        'parsed_rows': len(rows),
        'status_counts': dict(sorted(final_counts.items())),
        'counts_by_file': counts_serial,
        'rows': items,
    }
    OUT_JSON.write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding='utf-8')

    with OUT_CSV.open('w', encoding='utf-8', newline='') as f:
        f.write('file,year,number,status,issues,answer,needs_figure,orphan\n')
        for it in items:
            issues = ';'.join(it['issues'])
            f.write(f'{it["file"]},{it["year"]},{it["number"]},{it["status"]},"{issues}",{it["answer"]},{it["needs_figure"]},{it["orphan"]}\n')

    lines = [
        '# Question bank audit',
        '',
        f'Generated: {summary["generated_at"]}',
        f'Parsed rows: {summary["parsed_rows"]}',
        '',
        '## Status counts',
        '',
    ]
    for k, v in sorted(final_counts.items()):
        lines.append(f'- {k}: {v}')
    lines += ['', '## Counts by source file', '']
    for file_name, c in sorted(counts_serial.items()):
        total = sum(c.values())
        parts = ', '.join(f'{k}={v}' for k, v in sorted(c.items()))
        lines.append(f'- {file_name} ({total}): {parts}')

    OUT_MD.write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print(OUT_MD)
    print(OUT_JSON)


if __name__ == '__main__':
    main()
