-- 1. Add school_id to exams (nullable, FK to schools)
alter table exams add column school_id uuid references schools(id) on delete set null;
create index idx_exams_school_id on exams (school_id);

-- 2. Update existing Post-UTME row in-place: link to Unilorin, rename slug, update name
do $$
declare
  v_unilorin_id uuid;
  v_exam_id uuid;
  v_old_slug text;
begin
  select id into v_unilorin_id from schools where slug = 'university-of-ilorin';
  select id, slug into v_exam_id, v_old_slug from exams where slug = 'post-utme';

  if v_exam_id is not null then
    update exams
    set school_id = v_unilorin_id,
        slug = 'unilorin-post-utme',
        name = 'UNILORIN Post-UTME'
    where id = v_exam_id;

    -- Update app_config keys from post-utme to unilorin-post-utme
    update app_config
    set value = value::jsonb - 'post-utme' || jsonb_build_object('unilorin-post-utme', value->'post-utme')
    where key = 'mock_defaults' and value ? 'post-utme';

    update app_config
    set value = value::jsonb - 'post-utme' || jsonb_build_object('unilorin-post-utme', value->'post-utme')
    where key = 'subject_weighting' and value ? 'post-utme';
  end if;
end;
$$;

-- 3. Create user_exam_access table
create table user_exam_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_id uuid not null references exams(id) on delete cascade,
  added_at timestamptz not null default now(),
  unique (user_id, exam_id)
);

alter table user_exam_access enable row level security;

-- Users can read their own access rows
create policy "users can read own exam access"
  on user_exam_access for select
  to authenticated
  using (user_id = auth.uid());

-- Users can insert/delete their own access rows (but only for school-specific exams)
create policy "users can insert own exam access"
  on user_exam_access for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "users can delete own exam access"
  on user_exam_access for delete
  to authenticated
  using (user_id = auth.uid());

-- 4. Replace RLS on questions: users can read questions for national exams (school_id IS NULL)
--    OR for school-specific exams they have user_exam_access for
drop policy if exists "questions are publicly readable" on questions;

create policy "questions are accessible by exam access"
  on questions for select
  to authenticated
  using (
    exists (
      select 1 from exams e
      where e.id = questions.exam_id
        and (e.school_id is null
          or exists (
            select 1 from user_exam_access uea
            where uea.exam_id = questions.exam_id
              and uea.user_id = auth.uid()
          ))
    )
  );

-- Drop old view that references leaderboard_entries.school_id before the column is removed
drop view if exists public_leaderboard_top10;

-- 5. Restructure leaderboard_entries: replace school_id with exam_id
-- Add exam_id as nullable first
alter table leaderboard_entries add column exam_id uuid references exams(id) on delete cascade;

-- Backfill existing rows with JAMB's exam_id (the universal baseline prior to per-exam leaderboards)
do $$
declare
  v_jamb_id uuid;
begin
  select id into v_jamb_id from exams where slug = 'jamb';
  update leaderboard_entries set exam_id = v_jamb_id where exam_id is null;
end;
$$;

-- Now make it NOT NULL
alter table leaderboard_entries alter column exam_id set not null;

-- Drop old unique constraint
alter table leaderboard_entries drop constraint leaderboard_entries_user_id_period_key;

-- Drop old index on (school_id, period, score desc)
drop index if exists idx_leaderboard_entries_school_period;

-- Add new unique constraint
alter table leaderboard_entries add constraint leaderboard_entries_user_exam_period_key unique (user_id, exam_id, period);

-- New index for leaderboard queries
create index idx_leaderboard_entries_exam_period_score on leaderboard_entries (exam_id, period, score desc);

-- Drop school_id column
alter table leaderboard_entries drop column school_id;

-- 6. Update the update_leaderboard function to compute per-exam scores
create or replace function update_leaderboard()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_user_id uuid;
  v_exam_id uuid;
  v_total_correct numeric;
  v_total_questions numeric;
  v_bayesian_score numeric;
begin
  select es.user_id, es.exam_id into v_user_id, v_exam_id
  from exam_sessions es
  where es.id = new.session_id;

  if v_user_id is null or v_exam_id is null then
    return new;
  end if;

  -- All-time score for this exam
  select
    coalesce(sum(r.score), 0),
    coalesce(sum(round(r.score / nullif(r.accuracy, 0))), 0)
  into v_total_correct, v_total_questions
  from results r
  join exam_sessions es on es.id = r.session_id
  where es.user_id = v_user_id
    and es.exam_id = v_exam_id
    and es.status = 'completed';

  v_bayesian_score := round((v_total_correct + 5) / (v_total_questions + 10) * 100, 2);

  insert into leaderboard_entries (user_id, exam_id, score, period, updated_at)
  values (v_user_id, v_exam_id, v_bayesian_score, 'all_time', now())
  on conflict (user_id, exam_id, period) do update set
    score = excluded.score,
    updated_at = excluded.updated_at;

  -- Weekly score for this exam
  select
    coalesce(sum(r.score), 0),
    coalesce(sum(round(r.score / nullif(r.accuracy, 0))), 0)
  into v_total_correct, v_total_questions
  from results r
  join exam_sessions es on es.id = r.session_id
  where es.user_id = v_user_id
    and es.exam_id = v_exam_id
    and es.status = 'completed'
    and es.completed_at >= date_trunc('week', now());

  v_bayesian_score := round((v_total_correct + 5) / (v_total_questions + 10) * 100, 2);

  insert into leaderboard_entries (user_id, exam_id, score, period, updated_at)
  values (v_user_id, v_exam_id, v_bayesian_score, 'weekly', now())
  on conflict (user_id, exam_id, period) do update set
    score = excluded.score,
    updated_at = excluded.updated_at;

  return new;
end;
$$;

-- 7. Update get_user_leaderboard_rank to include exam_id
create or replace function get_user_leaderboard_rank(p_user_id uuid, p_period leaderboard_period, p_exam_id uuid default null)
returns integer
language plpgsql
stable
as $$
begin
  if p_exam_id is null then
    return (
      select count(*)::integer + 1
      from leaderboard_entries
      where period = p_period
        and score > (select coalesce(score, 0) from leaderboard_entries where user_id = p_user_id and period = p_period)
    );
  else
    return (
      select count(*)::integer + 1
      from leaderboard_entries
      where period = p_period and exam_id = p_exam_id
        and score > (select coalesce(score, 0) from leaderboard_entries where user_id = p_user_id and exam_id = p_exam_id and period = p_period)
    );
  end if;
end;
$$;

-- 8. Recreate public_leaderboard_top10 using exam_id instead of school_id
create view public_leaderboard_top10 as
select
  p.username,
  e.name as exam_name,
  le.score
from leaderboard_entries le
join profiles p on p.id = le.user_id
join exams e on e.id = le.exam_id
where le.period = 'all_time'
  and e.slug = 'jamb'
order by le.score desc
limit 10;

grant select on public_leaderboard_top10 to anon;
grant select on public_leaderboard_top10 to authenticated;

-- 9. Update the trigger (recreate on results table)
drop trigger if exists trg_update_leaderboard on results;
create trigger trg_update_leaderboard
  after insert on results
  for each row
  execute function update_leaderboard();

-- 10. Grant permissions for user_exam_access
grant usage on schema public to authenticated, anon;
grant all on user_exam_access to authenticated;
grant all on user_exam_access to service_role;
