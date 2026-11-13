-- Quick recall: one-fact cards inside the ONE review queue. No second
-- engine: marks land as learning_attempts (attempt_type 'recall') and fold
-- into the same mastery model as lessons and sessions.

create table public.recall_cards (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  topic_id uuid references public.topics(id) on delete set null,
  exam_id uuid references public.exams(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete set null,
  front text not null,
  back text not null,
  hint text,
  source text not null default 'authored',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index recall_cards_lesson_front_uidx
  on public.recall_cards (lesson_id, front)
  where lesson_id is not null;

create index recall_cards_subject_published_idx
  on public.recall_cards (subject_id, published);

alter table public.recall_cards enable row level security;

create policy "authenticated reads published recall cards"
  on public.recall_cards for select
  to authenticated
  using (published);

revoke insert, update, delete on public.recall_cards from anon, authenticated;
grant select on public.recall_cards to authenticated;
grant insert, update, delete on public.recall_cards to service_role;

alter table public.learning_attempts
  add column if not exists recall_card_id uuid references public.recall_cards(id) on delete set null;

create index if not exists learning_attempts_recall_idx
  on public.learning_attempts (user_id, recall_card_id);

-- Seed: vocabulary cards already authored inside lessons become recall
-- cards. Idempotent via the (lesson_id, front) unique index.
insert into public.recall_cards (subject_id, topic_id, exam_id, lesson_id, front, back, hint, source)
select
  l.subject_id,
  l.topic_id,
  l.exam_id,
  l.id,
  nullif(w ->> 'word', ''),
  nullif(w ->> 'definition', ''),
  nullif(concat_ws(' — ', nullif(w ->> 'contrast', ''), nullif(w ->> 'sentence', '')), ''),
  'vocab'
from public.lesson_blocks lb
join public.lessons l on l.id = lb.lesson_id
cross join lateral jsonb_array_elements(coalesce(lb.content -> 'words', '[]'::jsonb)) as w
where lb.block_type = 'vocabulary_card'
  and nullif(w ->> 'word', '') is not null
  and nullif(w ->> 'definition', '') is not null
on conflict do nothing;
