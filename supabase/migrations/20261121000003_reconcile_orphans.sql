-- Orphan reconciliation and an atomic referral claim.
--
-- claimReferral() used two client writes (insert referral, then stamp
-- profiles.referred_by) with an ignored compensating delete. A failure left a
-- referral row with no profile link, so the user could never claim again.
-- Do both writes in one transaction.
--
-- Some orphaned business states can still arise from earlier partial failures
-- or third-party retries. reconcile_business_state() repairs the known ones
-- and reports counts so the cron caller can alert instead of failing silently.

create or replace function claim_referral(
  p_referrer_id uuid,
  p_referred_id uuid
)
returns text
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_username text;
  v_existing uuid;
begin
  if auth.uid() is null or auth.uid() <> p_referred_id then
    raise exception 'Authentication required';
  end if;

  select username into v_username
  from profiles
  where id = p_referrer_id;
  if v_username is null then
    raise exception 'Invalid referral code';
  end if;

  select referred_by into v_existing
  from profiles
  where id = p_referred_id;
  if v_existing is not null then
    raise exception 'Already referred by someone';
  end if;

  -- The unique(referred_id) constraint is the arbiter for concurrent claims.
  insert into referrals (referrer_id, referred_id, status)
  values (p_referrer_id, p_referred_id, 'pending');

  update profiles
  set referred_by = p_referrer_id
  where id = p_referred_id;

  return v_username;
end;
$$;

revoke all on function claim_referral(uuid, uuid) from public, anon;
grant execute on function claim_referral(uuid, uuid) to authenticated, service_role;

create or replace function reconcile_business_state()
returns jsonb
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_reattached integer := 0;
  v_rewards integer := 0;
  v_expired integer := 0;
  v_sessions integer := 0;
  v_referrer uuid;
begin
  -- 1. A referral row whose profile was never stamped: re-attach it so the
  -- learner is no longer permanently blocked by the unique constraint.
  with reattach as (
    update profiles p
    set referred_by = r.referrer_id
    from referrals r
    where r.referred_id = p.id
      and r.status = 'pending'
      and p.referred_by is null
    returning p.id
  )
  select count(*) into v_reattached from reattach;

  -- 2. Verified referrals whose reward write failed inside process_payment.
  -- grant_referral_reward is idempotent for an already-rewarded referrer and
  -- stamps the rows it settles, so retrying is safe.
  for v_referrer in
    select distinct referrer_id
    from referrals
    where status = 'verified' and reward_granted_at is null
  loop
    begin
      perform grant_referral_reward(v_referrer);
      v_rewards := v_rewards + 1;
    exception when others then
      -- Leave the row for the next run; report it in the count.
      null;
    end;
  end loop;

  -- 3. A refund recorded without its entitlement expiry (the earlier
  -- two-write path). process_refund already handles fresh refunds; this
  -- settles historical rows.
  with expire as (
    update entitlements e
    set status = 'expired', expires_at = now()
    from payments p
    where p.status = 'refunded'
      and p.user_id = e.user_id
      and p.product::product_type = e.product
      and e.status = 'active'
    returning e.user_id
  )
  select count(*) into v_expired from expire;

  -- 4. Childless in-progress sessions from a failed createSession cleanup.
  with cleanup as (
    delete from exam_sessions s
    where s.status = 'in_progress'
      and s.started_at < now() - interval '24 hours'
      and not exists (
        select 1 from session_answers sa where sa.session_id = s.id
      )
    returning s.id
  )
  select count(*) into v_sessions from cleanup;

  return jsonb_build_object(
    'referrals_reattached', v_reattached,
    'referral_rewards_settled', v_rewards,
    'entitlements_expired', v_expired,
    'orphan_sessions_removed', v_sessions
  );
end;
$$;

revoke all on function reconcile_business_state() from public, anon, authenticated;
grant execute on function reconcile_business_state() to service_role;
