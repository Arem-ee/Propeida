"""Third propagation pass: token-overlap similarity.

The two PDFs print the same past question with drift that breaks
prefix matching ("stares man in the face" vs "starves man in the face",
"hatche.d" vs "hatched", dropped words). A token Jaccard score over the
question plus a matching option count identifies these safely: a score
above 0.72 with a single dominant donor is the same question.

Only inherits when the donor is unambiguous, so a wrong answer cannot
propagate.
"""
from __future__ import annotations

import json
import re
import unicodedata
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STAGED_PATH = ROOT / 'content-folder' / 'english-jamb-staged-clean-v3.json'

STOPWORDS = {
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'of',
    'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'as', 'that', 'this',
    'it', 'its', 'his', 'her', 'their', 'he', 'she', 'they', 'we', 'you', 'i',
    'and', 'or', 'but', 'not', 'no', 'do', 'does', 'did', 'has', 'have', 'had',
    'means', 'mean', 'meaning', 'question', 'option', 'choose', 'following',
    'word', 'words', 'phrase', 'expression', 'used', 'passage', 'nearest',
}


def norm_tokens(text: str | None) -> set[str]:
    if not text:
        return set()
    text = unicodedata.normalize('NFKD', text)
    text = ''.join(c for c in text if not unicodedata.combining(c))
    text = text.lower()
    tokens = re.findall(r'[a-z0-9]+', text)
    return {t for t in tokens if t not in STOPWORDS and len(t) > 2}


def jaccard(a: set[str], b: set[str]) -> float:
    if not a or not b:
        return 0.0
    inter = len(a & b)
    if inter == 0:
        return 0.0
    return inter / len(a | b)


def main() -> int:
    payload = json.loads(STAGED_PATH.read_text(encoding='utf-8'))
    records: list[dict] = payload.get('records', [])

    answered: list[dict] = []
    unsolved: list[dict] = []
    for r in records:
        (answered if r.get('answer') else unsolved).append(r)

    # Bucket answered records by option count to keep comparison cheap.
    by_optcount: dict[int, list[dict]] = defaultdict(list)
    for r in answered:
        by_optcount[len(r.get('options', []))].append(r)

    propagated = 0
    skipped_ambiguous = 0
    skipped_low = 0

    for r in unsolved:
        opts = r.get('options', [])
        qt = norm_tokens(r.get('question'))
        if len(qt) < 3:
            continue

        best_score = 0.0
        best: list[dict] = []
        for donor in by_optcount.get(len(opts), []):
            score = jaccard(qt, norm_tokens(donor.get('question')))
            if score > best_score:
                best_score = score
                best = [donor]
            elif score == best_score and score > 0:
                best.append(donor)

        if best_score < 0.72:
            skipped_low += 1
            continue
        if len(best) > 1:
            keys = {b['answer'] for b in best}
            if len(keys) > 1:
                skipped_ambiguous += 1
                continue

        donor = best[0]
        r['answer'] = donor['answer']
        r['explanation'] = donor.get('explanation')
        r['difficulty'] = donor.get('difficulty')
        r['status'] = 'solved'
        r['inheritedFrom'] = donor['id']
        r['similarityScore'] = round(best_score, 3)
        propagated += 1

    print(f'Propagated (similarity): {propagated}')
    print(f'Skipped (below threshold): {skipped_low}')
    print(f'Skipped (ambiguous):      {skipped_ambiguous}')
    print(f'Records still unsolved: {sum(1 for r in records if not r.get("answer"))}')

    payload['meta'] = {
        **payload.get('meta', {}),
        'phase': 'Phase 4: answer authoring',
        'propagatedSimilarity': propagated,
        'solvedRecords': sum(1 for r in records if r.get('answer')),
        'unsolvedRecords': sum(1 for r in records if not r.get('answer')),
    }

    STAGED_PATH.write_text(json.dumps(payload, indent=1, ensure_ascii=False), encoding='utf-8')
    print(f'Wrote {STAGED_PATH}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())