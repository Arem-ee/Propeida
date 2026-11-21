-- Payment integrity: replayed webhooks and partial refunds.
--
-- 1. process_payment() recomputed expires_at from now() on every call and
--    upserted it unconditionally. A replayed `charge.success` webhook
--    re-armed a full term, so one payment replayed monthly gave permanent
--    Pro. Preserve an existing active paid entitlement instead.
--
-- 2. Refunds updated `payments` then `entitlements` in two separate client
--    statements. If the second failed, the retry saw status='refunded' and
--    returned early, leaving free permanent access. Move both writes into a
--    single transactional RPC whose retry path repairs a partial failure.

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

  -- Never re-arm the term on a replay. An active paid entitlement keeps its
  -- original dates; only a missing, expired, inactive or non-payment record
  -- is activated/extended.
  insert into entitlements (user_id, product, status, granted_at, expires_at, source)
  values (p_user_id, p_product::product_type, 'active', now(), v_expires_at, 'payment')
  on conflict (user_id, product) do update set
    status = 'active',
    granted_at = now(),
    expires_at = excluded.expires_at,
    source = 'payment'
  where entitlements.status is distinct from 'active'
     or entitlements.expires_at is null
     or entitlements.expires_at < now()
     or entitlements.source is distinct from 'payment';

  select id, referrer_id into v_referral_id, v_referrer_id
  from referrals
  where referred_id = p_user_id
    and status = 'pending'
  limit 1;

  if found then
    update referrals
    set status = 'verified'
    where id = v_referral_id;

    begin
      perform grant_referral_reward(v_referrer_id);

      update referrals
      set reward_granted_at = now()
      where id = v_referral_id;
    exception when others then
      raise warning 'grant_referral_reward failed for referral %', v_referral_id;
    end;
  end if;
end;
$$;

create or replace function process_refund(p_reference text)
returns text
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_user_id uuid;
  v_product text;
  v_status text;
begin
  -- Serialize concurrent refund deliveries for the same payment.
  select user_id, product, status into v_user_id, v_product, v_status
  from payments
  where paystack_reference = p_reference
  for update;

  if not found then
    return 'not_found';
  end if;

  -- Retry path: if an earlier delivery marked the payment refunded but died
  -- before expiring the entitlement, repair it here instead of returning.
  if v_status = 'refunded' then
    update entitlements
       set status = 'expired',
           expires_at = now()
     where user_id = v_user_id
       and product = v_product
       and status = 'active';
    return 'already_refunded';
  end if;

  update payments
     set status = 'refunded'
   where paystack_reference = p_reference;

  update entitlements
     set status = 'expired',
         expires_at = now()
   where user_id = v_user_id
     and product = v_product
     and status = 'active';

  return 'refunded';
end;
$$;

revoke all on function process_refund(text) from public, anon, authenticated;
grant execute on function process_refund(text) to service_role;
