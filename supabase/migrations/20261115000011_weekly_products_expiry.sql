-- Weekly plans expire after 7 days. Monthly stays 30, yearly stays 365.
-- Run after 20261115000010_weekly_product_types has committed the enum values.

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
    perform grant_referral_reward(v_referrer_id);
    update referrals
    set status = 'verified', reward_granted_at = now()
    where id = v_referral_id;
  end if;
end;
$$;

-- School banks open for weekly PUTME holders too. Recreate the current policy
-- (20261115000003) with the weekly product added; everything else is unchanged.
drop policy if exists "questions are accessible by exam access" on public.questions;

create policy "questions are accessible by exam access"
  on public.questions for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid()) and p.is_admin
    )
    or public.has_campaign_access()
    or (
      status = 'published'
      and (
        exists (
          select 1
          from public.exams e
          where e.id = questions.exam_id
            and e.school_id is null
        )
        or exists (
          select 1
          from public.user_exam_free_pools p
          where p.question_id = questions.id
            and p.user_id = (select auth.uid())
        )
        or exists (
          select 1
          from public.user_free_questions p
          where p.question_id = questions.id
            and p.user_id = (select auth.uid())
        )
        or (
          exists (
            select 1
            from public.exams e
            join public.user_exam_access uea
              on uea.exam_id = e.id
             and uea.user_id = (select auth.uid())
            where e.id = questions.exam_id
              and e.school_id is not null
          )
          and exists (
            select 1
            from public.entitlements ent
            where ent.user_id = (select auth.uid())
              and ent.status = 'active'
              and (ent.expires_at is null or ent.expires_at > now())
              and ent.product in ('putme_pro', 'putme_pro_weekly', 'putme_pro_yearly')
          )
        )
      )
    )
  );
