CREATE OR REPLACE FUNCTION public.grant_referral_reward(p_referrer_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_referral_id uuid;
begin
  -- Atomically claim one unrewarded verified referral.
  -- This prevents double-rewarding the same referral event and
  -- validates that a real matching referral exists before granting.
  update referrals
  set reward_granted_at = now()
  where id = (
    select id from referrals
    where referrer_id = p_referrer_id
      and status = 'verified'
      and reward_granted_at is null
    limit 1
    for update
  )
  returning id into v_referral_id;

  if not found then
    raise exception 'No unrewarded verified referral found for referrer %', p_referrer_id;
  end if;

  -- Skip if already has permanent jamb_pro
  if exists (
    select 1 from entitlements
    where user_id = p_referrer_id
      and product = 'jamb_pro'
      and status = 'active'
      and expires_at is null
  ) then
    return;
  end if;

  -- Skip if existing trial is longer than 7 days from now
  if exists (
    select 1 from entitlements
    where user_id = p_referrer_id
      and product = 'jamb_pro'
      and status = 'active'
      and expires_at is not null
      and expires_at > now() + interval '7 days'
  ) then
    return;
  end if;

  -- Upsert: set or extend trial
  insert into entitlements (user_id, product, status, granted_at, expires_at, source)
  values (p_referrer_id, 'jamb_pro', 'active', now(), now() + interval '7 days', 'referral_trial')
  on conflict (user_id, product) do update set
    status = 'active',
    granted_at = now(),
    expires_at = now() + interval '7 days',
    source = 'referral_trial';
end;
$function$;
