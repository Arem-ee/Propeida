-- 1. New enums
create type product_type as enum ('jamb_pro', 'jamb_premium_ai', 'putme_pro');
create type entitlement_status as enum ('active', 'expired');
create type entitlement_source as enum ('payment', 'referral_trial', 'admin_grant');

-- 2. Entitlements table
create table entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product product_type not null,
  status entitlement_status not null default 'active',
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  source entitlement_source not null,
  unique (user_id, product)
);

-- 3. Usage counters table
create table usage_counters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_id uuid not null references exams(id) on delete cascade,
  free_questions_answered integer not null default 0,
  free_mocks_completed integer not null default 0,
  unique (user_id, exam_id)
);

-- 4. Migrate existing subscription data to entitlements
do $$
declare
  v_jamb_id uuid;
begin
  select id into v_jamb_id from exams where slug = 'jamb';

  -- Migrate 'pro' -> jamb_pro (permanent)
  insert into entitlements (user_id, product, status, granted_at, expires_at, source)
  select id, 'jamb_pro', 'active', now(), null, 'payment'
  from profiles
  where subscription_status = 'pro'
    and not exists (
      select 1 from entitlements e
      where e.user_id = profiles.id and e.product = 'jamb_pro'
    );

  -- Migrate 'pro_trial' -> jamb_pro (with expiry)
  insert into entitlements (user_id, product, status, granted_at, expires_at, source)
  select id, 'jamb_pro', 'active', now(), subscription_expires_at, 'referral_trial'
  from profiles
  where subscription_status = 'pro_trial'
    and not exists (
      select 1 from entitlements e
      where e.user_id = profiles.id and e.product = 'jamb_pro'
    );

  -- Migrate free_questions_answered / free_mocks_completed into usage_counters for JAMB
  if v_jamb_id is not null then
    insert into usage_counters (user_id, exam_id, free_questions_answered, free_mocks_completed)
    select id, v_jamb_id, free_questions_answered, free_mocks_completed
    from profiles
    where free_questions_answered > 0 or free_mocks_completed > 0
    on conflict (user_id, exam_id) do update set
      free_questions_answered = excluded.free_questions_answered,
      free_mocks_completed = excluded.free_mocks_completed;
  end if;
end;
$$;

-- 5. Grant permissions
alter table entitlements enable row level security;
alter table usage_counters enable row level security;

create policy "users can read own entitlements"
  on entitlements for select
  to authenticated
  using (user_id = auth.uid());

create policy "users can read own usage counters"
  on usage_counters for select
  to authenticated
  using (user_id = auth.uid());

create policy "service role can read all entitlements"
  on entitlements for select
  to service_role
  using (true);

create policy "service role can insert entitlements"
  on entitlements for insert
  to service_role
  with check (true);

create policy "service role can update entitlements"
  on entitlements for update
  to service_role
  using (true)
  with check (true);

create policy "service role can manage usage counters"
  on usage_counters for all
  to service_role
  using (true)
  with check (true);

-- 6. Update grant_referral_reward to use entitlements
create or replace function grant_referral_reward(p_referrer_id uuid)
returns void
language plpgsql
security definer
set search_path = 'public'
as $$
begin
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
$$;

-- 7. Drop old columns from profiles
alter table profiles drop column subscription_status;
alter table profiles drop column subscription_expires_at;
alter table profiles drop column free_questions_answered;
alter table profiles drop column free_mocks_completed;

-- 8. Drop old has_pro_access function
drop function if exists has_pro_access;

-- 9. Drop old subscription_status enum (check if unused first)
-- Keep the type definition to avoid breaking enum type references; it'll be cleaned up when no migration references it

-- 10. Create increment_usage_counter RPC for efficient atomic counter updates
create or replace function increment_usage_counter(
  p_user_id uuid,
  p_exam_id uuid,
  p_field text
)
returns void
language plpgsql
security definer
set search_path = 'public'
as $$
begin
  insert into usage_counters (user_id, exam_id, free_questions_answered, free_mocks_completed)
  values (p_user_id, p_exam_id, 0, 0)
  on conflict (user_id, exam_id) do nothing;

  if p_field = 'free_questions_answered' then
    update usage_counters
    set free_questions_answered = free_questions_answered + 1
    where user_id = p_user_id and exam_id = p_exam_id;
  elsif p_field = 'free_mocks_completed' then
    update usage_counters
    set free_mocks_completed = free_mocks_completed + 1
    where user_id = p_user_id and exam_id = p_exam_id;
  end if;
end;
$$;

-- Grant execution to authenticated users
grant execute on function increment_usage_counter to authenticated;
grant execute on function increment_usage_counter to service_role;
