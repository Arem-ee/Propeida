-- Expiry per product: monthly = 30 days, yearly = 365 days. Lifetime
-- rows (putme_pro/jamb_lifetime granted under earlier terms) are never
-- rewritten here -- paying again replaces them with the monthly term.
-- Existing lifetime grants are grandfathered.

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
    perform grant_referral_reward(v_referrer_id);
    update referrals
    set status = 'verified', reward_granted_at = now()
    where id = v_referral_id;
  end if;
end;
$$;
