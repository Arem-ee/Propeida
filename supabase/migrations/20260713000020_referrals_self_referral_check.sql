alter table referrals add constraint referrals_no_self_referral check (referrer_id <> referred_id);
