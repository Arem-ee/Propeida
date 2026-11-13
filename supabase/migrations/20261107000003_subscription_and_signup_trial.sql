-- Pro is a monthly subscription, not a lifetime grant.
--
-- 1. process_payment now grants 30 days and renews by upserting a fresh
--    30 days on every successful payment (pay again = renew). Existing
--    grandfathered rows with expires_at = null keep working.
--
-- 2. New signups get a 24-hour full-Pro trial (both exam paths), granted
--    in the signup trigger. The entitlement layer already treats an
--    active referral_trial row as Pro, so every paywall gate honors it.

create or replace function process_payment(
  p_user_id uuid,
  p_reference text,
  p_amount integer,
  p_product text,
  p_customer_email text default null
)
returns void
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_referral_id uuid;
  v_referrer_id uuid;
begin
  insert into payments (user_id, paystack_reference, amount, status, product, verified_at)
  values (p_user_id, p_reference, p_amount, 'success', p_product, now())
  on conflict (paystack_reference) do update set
    status = 'success',
    verified_at = now()
  where payments.status is distinct from 'success';

  insert into entitlements (user_id, product, status, granted_at, expires_at, source)
  values (p_user_id, p_product::product_type, 'active', now(), now() + interval '30 days', 'payment')
  on conflict (user_id, product) do update set
    status = 'active',
    granted_at = now(),
    expires_at = now() + interval '30 days',
    source = 'payment';

  select id, referrer_id into v_referral_id, v_referrer_id
  from referrals
  where referred_id = p_user_id
    and status = 'pending'
  limit 1;

  if found then
    perform grant_referral_reward(v_referrer_id);
    update referrals
    set status = 'verified', reward_granted_at = now()
    where id = v_referral_id;
  end if;
end;
$$;

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

  -- 24-hour full-Pro trial for new signups, both exam paths.
  insert into entitlements (user_id, product, status, granted_at, expires_at, source)
  values
    (new.id, 'putme_pro'::product_type, 'active', now(), now() + interval '24 hours', 'referral_trial'),
    (new.id, 'jamb_pro'::product_type, 'active', now(), now() + interval '24 hours', 'referral_trial')
  on conflict (user_id, product) do nothing;

  return new;
end;
$$;
