-- Referral reward duration changed from 7 days to 3 days.
--
-- One successful referral (friend's first verified payment) now grants the
-- referrer 3 days of JAMB Pro instead of a full week. ₦1,000/week pricing
-- means a free week per referral was giving away the entire weekly product;
-- three days keeps the incentive without cannibalising the paid tier.
--
-- Existing trials are left as-is: the skip condition only re-grants when the
-- current trial is shorter than the new duration, so a 7-day trial already in
-- flight is not shortened.

create or replace function public.grant_referral_reward(p_referrer_id uuid)
returns void
language plpgsql
security definer
set search_path = 'public'
as $function$
declare
  v_referral_id uuid;
begin
  -- Atomically claim one unrewarded verified referral.
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

  -- Skip if existing trial is longer than 3 days from now
  if exists (
    select 1 from entitlements
    where user_id = p_referrer_id
      and product = 'jamb_pro'
      and status = 'active'
      and expires_at is not null
      and expires_at > now() + interval '3 days'
  ) then
    return;
  end if;

  -- Upsert: set or extend trial
  insert into entitlements (user_id, product, status, granted_at, expires_at, source)
  values (p_referrer_id, 'jamb_pro', 'active', now(), now() + interval '3 days', 'referral_trial')
  on conflict (user_id, product) do update set
    status = 'active',
    granted_at = now(),
    expires_at = now() + interval '3 days',
    source = 'referral_trial';
end;
$function$;
