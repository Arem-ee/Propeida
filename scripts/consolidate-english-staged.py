"""Build the Phase 1 English source inventory.

Reads the two already-parsed English collections in
content-folder/_parsed and emits one canonical staged catalog at
content-folder/english-jamb-staged.json.

The output intentionally contains no answers, explanations, topic tags,
or production questions. It is a traceable unresolved inventory: every
source row is preserved, duplicates are linked rather than deleted, and
quality flags mark what a later pass must repair or adjudicate.
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
import unicodedata
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PARSED_DIR = ROOT / 'content-folder' / '_parsed'
OUT_PATH = ROOT / 'content-folder' / 'english-jamb-staged.json'

SOURCES = [
    {
        'parsed_path': PARSED_DIR / 'Use-of-English.json',
        'file_label': 'Use-of-English-JAMB-Past-Questions-And-Answers.pdf',
    },
    {
        'parsed_path': PARSED_DIR / 'USE-OF-ENGLISH-JAMB-Past-Questions.json',
        'file_label': 'USE-OF-ENGLISH-JAMB-Past-Questions.pdf',
    },
]

PASSAGE_MARKER = '[Passage]'
QUESTION_MARKER = '[Question]'


def clean_space(text: str) -> str:
    return re.sub(r'\s+', ' ', text or '').strip()


def semantic_norm(text: str) -> str:
    """Broad normaliser for duplicate detection, not for display."""
    text = unicodedata.normalize('NFKD', text or '')
    replacements = {
        '‘': "'",
        '’': "'",
        '“': '"',
        '”': '"',
        '–': '-',
        '—': '-',
        '…': '...',
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()


def split_passage_question(raw_text: str) -> tuple[str | None, str]:
    if PASSAGE_MARKER in raw_text and QUESTION_MARKER in raw_text:
        passage = raw_text.split(PASSAGE_MARKER, 1)[1].split(QUESTION_MARKER, 1)[0].strip()
        question = raw_text.split(QUESTION_MARKER, 1)[1].strip()
        return passage or None, question
    return None, raw_text or ''


def normalise_options(options: dict[str, str]) -> tuple[dict[str, str], list[dict[str, str]]]:
    raw_options = {
        key: clean_space(value)
        for key, value in options.items()
        if clean_space(value)
    }
    options_list = [
        {'key': key, 'text': value}
        for key, value in raw_options.items()
    ]
    return raw_options, options_list


def quality_flags(
    *,
    question: str,
    passage: str | None,
    raw_options: dict[str, str],
    supplied_section: str | None,
) -> list[str]:
    flags: list[str] = []
    values = [value for value in raw_options.values() if value]
    if len(values) < 4:
        flags.append('short_option_set')
    if len(values) > 4:
        flags.append('five_option_set')
    if any(not value for value in raw_options.values()):
        flags.append('empty_option')
    if not supplied_section:
        flags.append('missing_section_context')
    if not question:
        flags.append('empty_question')
    if passage is None and re.search(r'passage|text above|reading text', question, re.I):
        flags.append('passage_context_not_extracted')
    if re.search(r'\[A\.|\[B\.|\bfragmented|interleaved', question, re.I):
        flags.append('possible_cropping_or_column_damage')
    if len(question) < 5:
        flags.append('very_short_stem')
    return flags


def main() -> int:
    records: list[dict] = []
    seen: dict[str, str] = {}
    duplicate_count = 0
    source_records = 0
    era_counter: Counter[str] = Counter()
    parsed_file_counts: Counter[str] = Counter()

    for source_spec in SOURCES:
        path = source_spec['parsed_path']
        if not path.exists():
            print(f'missing parsed source: {path}', file=sys.stderr)
            return 1

        rows: list[dict] = json.loads(path.read_text(encoding='utf-8'))
        parsed_file_counts[source_spec['file_label']] = len(rows)

        for row in rows:
            source_records += 1
            raw_text = str(row.get('text') or '')
            passage, question = split_passage_question(raw_text)
            question = clean_space(question)
            passage = clean_space(passage) if passage else None
            raw_options, options = normalise_options(row.get('options') or {})
            year = row.get('year')
            section = row.get('section')
            number = row.get('number')
            era = str(year) if year is not None else 'unknown'
            era_counter[era] += 1

            source = {
                'file': source_spec['file_label'],
                'parsedFile': str(path.relative_to(ROOT)),
                'year': year,
                'section': section,
                'number': number,
                'sourceField': row.get('source'),
                'needsFigure': row.get('needs_figure', False),
                'recovered': row.get('recovered', False),
                'orphan': row.get('orphan', False),
            }

            canonical_text = '\n'.join([
                passage or '',
                question,
                '\n'.join(f'{item["key"]}:{item["text"]}' for item in options),
            ])
            canonical_key = hashlib.sha1(
                semantic_norm(canonical_text).encode('utf-8')
            ).hexdigest()

            flags = quality_flags(
                question=question,
                passage=passage,
                raw_options=raw_options,
                supplied_section=section,
            )

            record_id = f'eng-src-{len(records) + 1:06d}'
            duplicate_of = seen.get(canonical_key)
            if duplicate_of is None:
                seen[canonical_key] = record_id
            else:
                duplicate_count += 1

            records.append({
                'id': record_id,
                'source': source,
                'passage': passage,
                'question': question,
                'options': options,
                'optionsRaw': raw_options,
                'status': 'unresolved',
                'topic': None,
                'skill': None,
                'difficulty': None,
                'answer': None,
                'explanation': None,
                'canonicalKey': canonical_key,
                'duplicateOf': duplicate_of,
                'qualityFlags': flags,
            })

    payload = {
        'meta': {
            'title': 'English source inventory — unresolved',
            'phase': 'Phase 1: canonical source inventory',
            'generatedAt': datetime.now(timezone.utc).isoformat(),
            'note': (
                'This is a traceable source catalog, not a production bank. No '
                'answer, explanation, topic tag or difficulty is populated yet.'
            ),
            'sourceRecords': source_records,
            'canonicalRecords': len(seen),
            'duplicateRecords': duplicate_count,
            'parsedFileCounts': dict(parsed_file_counts),
            'eraCounts': dict(sorted(era_counter.items(), key=lambda item: item[0])),
            'productionReadyRecords': 0,
        },
        'records': records,
    }

    OUT_PATH.write_text(json.dumps(payload, indent=1, ensure_ascii=False), encoding='utf-8')
    print(f'wrote {OUT_PATH} ({len(records)} source records; {len(seen)} canonical records; {duplicate_count} duplicates)')
    print('era counts:', json.dumps(dict(sorted(era_counter.items(), key=lambda item: item[0]))))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
