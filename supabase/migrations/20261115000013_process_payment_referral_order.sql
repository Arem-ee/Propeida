-- Referral reward ordering bug in process_payment
--
-- Live behaviour (verified by code review): on the FIRST payment from a
-- referred user, process_payment called grant_referral_reward() before
-- promoting the referral out of 'pending'. grant_referral_reward only
-- grants against a verified, unrewarded referral row, found none, and
-- raised. The exception rolled back the whole function: the payments row,
-- the entitlements row, everything. The webhook returned 500 and Paystack
-- retries forever, so a referred first-time buyer paid and received zero
-- access, and the referrer was never credited. When an unrelated verified,
-- unrewarded referral existed for the referrer, the reward attached to the
-- wrong referral.
--
-- Fix: promote the referral to verified first, grant the reward against it,
-- stamp reward_granted_at, and never let referral bookkeeping roll back a
-- payment. A referral failure now raises a warning and the buyer keeps
-- their entitlement; support can settle the referral later from the
-- verified row.
--
-- Apply after 20261115000011_weekly_products_expiry.sql.

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
  v_expires_at timestamptz;
begin
  v_expires_at := case p_product
    when 'putme_pro_weekly' then now() + interval '7 days'
    when 'jamb_pro_weekly' then now() + interval '7 days'
    when 'putme_pro' then now() + interval '30 days'
    when 'jamb_pro' then now() + interval '30 days'
    when 'putme_pro_yearly' then now() + interval '365 days'
    when 'jamb_pro_yearly' then now() + interval '365 days'
    when 'jamb_lifetime' then null
    when 'jamb_premium_ai' then now() + interval '30 days'
    else now() + interval '30 days'
  end;

  insert into payments (user_id, paystack_reference, amount, status, product, verified_at)
  values (p_user_id, p_reference, p_amount, 'success', p_product, now())
  on conflict (paystack_reference) do update set
    status = 'success',
    verified_at = now()
  where payments.status is distinct from 'success';

  insert into entitlements (user_id, product, status, granted_at, expires_at, source)
  values (p_user_id, p_product::product_type, 'active', now(), v_expires_at, 'payment')
  on conflict (user_id, product) do update set
    status = 'active',
    granted_at = now(),
    expires_at = excluded.expires_at,
    source = 'payment';

  select id, referrer_id into v_referral_id, v_referrer_id
  from referrals
  where referred_id = p_user_id
    and status = 'pending'
  limit 1;

  if found then
    -- Promote first: the reward function only grants against a verified,
    -- unrewarded referral row. Claim this referral atomically by writing
    -- the promotion before the grant.
    update referrals
    set status = 'verified'
    where id = v_referral_id;

    begin
      perform grant_referral_reward(v_referrer_id);

      update referrals
      set reward_granted_at = now()
      where id = v_referral_id;
    exception when others then
      -- The payment must stand even if referral bookkeeping fails.
      raise warning 'grant_referral_reward failed for referral %', v_referral_id;
    end;
  end if;
end;
$$;
