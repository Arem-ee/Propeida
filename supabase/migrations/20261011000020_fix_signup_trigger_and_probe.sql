-- Fix the signup trigger and probe the answer-key revoke.
--
-- 1. handle_new_user still inserts profiles.avatar_index, but that column
--    was dropped in 20261011000015_hygiene_drops.sql ("avatar picker
--    removed; identity is the initial"). Every new auth user therefore
--    failed to create a profile and signup returned a 500. The trigger is
--    rewritten here to insert only the columns that still exist.
--
-- 2. The probe writes the live column-privilege state to a temporary
--    table so it can be read back over the REST API, proving that
--    20261011000019_answer_column_revoke.sql took effect. The table is
--    dropped by the following migration.

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_username text;
  v_referral_code text;
begin
  v_username := new.raw_user_meta_data ->> 'username';

  if v_username is null or v_username = '' then
    v_username := 'user_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);
  end if;

  while exists (select 1 from profiles where lower(username) = lower(v_username)) loop
    v_username := v_username || '_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 4);
  end loop;

  v_referral_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  while exists (select 1 from profiles where referral_code = v_referral_code) loop
    v_referral_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  end loop;

  insert into profiles (id, username, referral_code)
  values (new.id, v_username, v_referral_code);

  return new;
end;
$$;

create table if not exists public._probe (id int primary key default 1, payload text);

insert into public._probe (id, payload)
select 1,
  json_build_object(
    'answer_column_privs', (
      select coalesce(string_agg(grantee || ':' || privilege_type, ', '), 'none')
      from information_schema.column_privileges
      where table_schema = 'public'
        and table_name = 'questions'
        and column_name in ('correct_answer', 'explanation')
    ),
    'question_text_privs', (
      select coalesce(string_agg(grantee || ':' || privilege_type, ', '), 'none')
      from information_schema.column_privileges
      where table_schema = 'public'
        and table_name = 'questions'
        and column_name = 'question_text'
    ),
    'avatar_index_exists', (
      select count(*) from information_schema.columns
      where table_schema = 'public' and table_name = 'profiles' and column_name = 'avatar_index'
    ),
    'trigger_mentions_avatar', (
      select count(*) from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = 'handle_new_user'
        and position('avatar_index' in p.prosrc) > 0
    ),
    'response_text_privileges', (
      select coalesce(string_agg(grantee || ':' || privilege_type, ', '), 'none')
      from information_schema.column_privileges
      where table_schema = 'public'
        and table_name = 'learning_attempts'
        and column_name = 'response_text'
    )
  )::text
on conflict (id) do update set payload = excluded.payload;
