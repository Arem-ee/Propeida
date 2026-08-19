-- ============================================================
-- Explore feed: interaction tracking + profile interests.
-- The Explore discovery feed reuses the existing careers /
-- courses / schools tables; this migration only adds the
-- personalization layer underneath it.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Interests selected by the student (lightweight, skippable).
--    Written only via the trusted /api/explore/interests route
--    (service role), matching the existing pattern where
--    profile updates are column-restricted.
-- ------------------------------------------------------------
alter table profiles
  add column if not exists explore_interests text[] not null default '{}';

-- ------------------------------------------------------------
-- 2. Interaction log: view / click / save / follow / dismiss /
--    share. These are the deterministic personalization
--    signals. 'save' and 'follow' are toggled (one active row
--    per user/entity/action); view/click accumulate for
--    recency-weighted scoring.
-- ------------------------------------------------------------
create table if not exists explore_interactions (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  entity_type text not null check (entity_type in ('career', 'course', 'university')),
  entity_id   uuid not null,
  action      text not null check (action in ('view', 'click', 'save', 'follow', 'dismiss', 'share')),
  created_at  timestamptz not null default now()
);

alter table explore_interactions enable row level security;

drop policy if exists "users can read their own explore interactions" on explore_interactions;
create policy "users can read their own explore interactions"
  on explore_interactions for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "users can insert their own explore interactions" on explore_interactions;
create policy "users can insert their own explore interactions"
  on explore_interactions for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "users can delete their own explore interactions" on explore_interactions;
create policy "users can delete their own explore interactions"
  on explore_interactions for delete to authenticated
  using (user_id = auth.uid());

grant select, insert, delete on explore_interactions to authenticated;

create index if not exists idx_explore_interactions_user
  on explore_interactions (user_id, created_at desc);
create index if not exists idx_explore_interactions_user_entity
  on explore_interactions (user_id, entity_type, entity_id);
create index if not exists idx_explore_interactions_action
  on explore_interactions (action, created_at desc);

-- save/follow are toggles: at most one active row per pair.
create unique index if not exists uq_explore_interactions_save_follow
  on explore_interactions (user_id, entity_type, entity_id, action)
  where action in ('save', 'follow');