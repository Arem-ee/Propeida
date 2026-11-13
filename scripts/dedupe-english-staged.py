"""Phase 2b: Deduplicate and normalize the English source inventory.

The staged inventory has 7,685 records after parser recovery, but many are:
- Duplicates (same question parsed from different pages/PDFs)
- Fragments (questions with < 4 options)
- Near-duplicates (same question, slightly different wording)

This script:
1. Filters out records with < 4 options (incomplete fragments)
2. Normalizes question text and options for comparison
3. Groups by (normalized_question, sorted_normalized_options)
4. Keeps the best record from each group (most complete, most options)
5. Outputs a clean canonical inventory
"""
from __future__ import annotations

import hashlib
import json
import re
import unicodedata
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STAGED_PATH = ROOT / 'content-folder' / 'english-jamb-staged.json'
OUT_PATH = ROOT / 'content-folder' / 'english-jamb-staged-clean.json'


def norm_text(s: str | None) -> str:
    """Normalize text for comparison: lowercase, strip accents, remove punctuation, collapse whitespace."""
    if not s:
        return ''
    s = unicodedata.normalize('NFKD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c))
    s = s.lower()
    s = re.sub(r"['\"`]", '', s)
    s = re.sub(r'[^\w\s]', ' ', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s


def norm_option(text: str | None) -> str:
    """Normalize an option text for comparison."""
    return norm_text(text)


def record_key(r: dict) -> str:
    """Create a canonical key from normalized question + sorted normalized options."""
    q = norm_text(r.get('question', ''))
    opts = r.get('options', [])
    if isinstance(opts, dict):
        opt_texts = sorted(v for v in opts.values() if v)
    else:
        opt_texts = sorted(o.get('text', '') for o in opts if o.get('text'))
    opt_sig = ' || '.join(norm_option(t) for t in opt_texts)
    return hashlib.sha1((q + '\n' + opt_sig).encode('utf-8')).hexdigest()


def record_score(r: dict) -> int:
    """Score a record: higher is better (more complete)."""
    score = 0
    q = r.get('question', '') or ''
    score += len(q) * 2
    opts = r.get('options', [])
    if isinstance(opts, dict):
        opt_count = sum(1 for v in opts.values() if v)
    else:
        opt_count = sum(1 for o in opts if o.get('text'))
    score += opt_count * 10
    if r.get('passage'):
        score += 5
    if r.get('answer'):
        score += 10
    if r.get('explanation'):
        score += 10
    if r.get('topic'):
        score += 5
    if r.get('difficulty'):
        score += 5
    return score


def main() -> int:
    payload = json.loads(STAGED_PATH.read_text(encoding='utf-8'))
    records: list[dict] = payload.get('records', [])
    print(f'Input records: {len(records)}')

    # Group by canonical key
    groups: dict[str, list[dict]] = defaultdict(list)
    for r in records:
        key = record_key(r)
        groups[key].append(r)

    print(f'Unique question+option groups: {len(groups)}')

    # Select best record from each group
    kept: list[dict] = []
    dropped_fragments = 0
    dropped_dupes = 0

    for key, group in groups.items():
        # Sort by score descending, pick best
        group.sort(key=record_score, reverse=True)
        best = group[0]

        # Drop fragments (< 4 options)
        opts = best.get('options', [])
        if isinstance(opts, dict):
            opt_count = sum(1 for v in opts.values() if v)
        else:
            opt_count = sum(1 for o in opts if o.get('text'))
        if opt_count < 4:
            dropped_fragments += 1
            continue

        kept.append(best)
        dropped_dupes += len(group) - 1

    print(f'Kept records: {len(kept)}')
    print(f'Dropped duplicates: {dropped_dupes}')
    print(f'Dropped fragments (<4 options): {dropped_fragments}')

    # Re-index IDs
    for i, r in enumerate(kept):
        r['id'] = f'eng-src-{i + 1:06d}'

    # Count quality
    quality_flags: dict[str, int] = {}
    for r in kept:
        for f in r.get('qualityFlags', []):
            quality_flags[f] = quality_flags.get(f, 0) + 1

    # Count by year
    year_counts: dict[str, int] = {}
    for r in kept:
        y = r.get('source', {}).get('year')
        if y:
            year_counts[y] = year_counts.get(y, 0) + 1

    # Count by source file
    file_counts: dict[str, int] = {}
    for r in kept:
        f = r.get('source', {}).get('file', 'unknown')
        file_counts[f] = file_counts.get(f, 0) + 1

    # Count recovered vs original
    recovered = sum(1 for r in kept if r.get('source', {}).get('recovered'))

    output = {
        'records': kept,
        'meta': {
            **payload.get('meta', {}),
            'phase': 'Phase 2b: dedupe + normalization (clean)',
            'deduplicatedAt': datetime.now(timezone.utc).isoformat(),
            'sourceRecords': len(records),
            'canonicalRecords': len(kept),
            'duplicateRecords': dropped_dupes,
            'fragmentRecords': dropped_fragments,
            'recoveredRecords': recovered,
            'productionReadyRecords': 0,
            'qualityFlags': quality_flags,
            'yearCounts': dict(sorted(year_counts.items())),
            'fileCounts': file_counts,
        },
    }

    OUT_PATH.write_text(json.dumps(output, indent=1, ensure_ascii=False), encoding='utf-8')
    print(f'Wrote {OUT_PATH} ({len(kept)} canonical records)')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
