-- Update handle_new_user to prefer username from metadata, fall back to random
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

  v_hash := ('x' || substr(md5(v_username), 1, 8))::bit(32)::bigint;

  insert into profiles (id, username, referral_code, avatar_index)
  values (new.id, v_username, v_referral_code, abs(v_hash) % 24);

  return new;
end;
$$;
