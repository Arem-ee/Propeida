-- Authoring backend: lessons and blocks as data ( CODE_FIRST batch ).
--
-- Editorial workflow per governance: draft -> review -> published ->
-- retired. Publishing bumps version; history is never rewritten — a
-- correction publishes a new version row state, never edits evidence.
-- Static TS notes remain the seed source; the player reads these tables.

create table lessons (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references subjects(id) on delete restrict,
  topic_id uuid null references topics(id) on delete set null,
  slug text not null,
  title text not null,
  objective text null,
  estimated_minutes integer null,
  version integer not null default 1,
  status text not null default 'draft'
    check (status in ('draft', 'review', 'published', 'retired')),
  source_ref text null,
  reviewer text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (subject_id, slug)
);

create index lessons_subject_idx on lessons (subject_id, slug);

-- Constrained block union (architecture §4). content shape per type:
-- text: { heading?, paragraphs[], bullets[] }
-- callout: { title?, body, tone: info|tip|warning }
-- worked_example: { problem, steps[{ operation, reason, result, predictPrompt }] }
-- guided_question: { question, hints[] }
-- vocabulary_card: { words[{ word, definition, contrast, sentence }] }
-- reflection: { prompt }
create table lesson_blocks (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  position integer not null,
  block_type text not null
    check (block_type in (
      'intro', 'text', 'image_explainer', 'audio_explainer', 'worked_example',
      'guided_question', 'independent_question', 'reflection', 'vocabulary_card',
      'passage', 'diagram', 'callout', 'recap'
    )),
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (lesson_id, position)
);

alter table lessons enable row level security;
alter table lesson_blocks enable row level security;

-- Published lessons are world-readable (learning has no gates); drafts
-- and review items stay privileged. Writes are service-role only.
create policy "anyone reads published lessons"
  on lessons for select
  to anon, authenticated
  using (status = 'published');

create policy "anyone reads published lesson blocks"
  on lesson_blocks for select
  to anon, authenticated
  using (
    exists (
      select 1 from lessons
      where lessons.id = lesson_blocks.lesson_id
        and lessons.status = 'published'
    )
  );
