alter table profiles add column avatar_index integer not null default 0;

-- Update handle_new_user to set a deterministic avatar_index
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_username text;
  v_referral_code text;
  v_hash bigint;
begin
  v_username := 'user_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);
  v_referral_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  while exists (select 1 from profiles where username = v_username) loop
    v_username := 'user_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);
  end loop;

  while exists (select 1 from profiles where referral_code = v_referral_code) loop
    v_referral_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  end loop;

  -- Deterministic avatar from username
  v_hash := ('x' || substr(md5(v_username), 1, 8))::bit(32)::bigint;

  insert into profiles (id, username, referral_code, avatar_index)
  values (new.id, v_username, v_referral_code, abs(v_hash) % 24);

  return new;
end;
$$;
