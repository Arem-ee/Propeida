-- Weekly products for the weekly/monthly/yearly lineup. Separate migration
-- so the enum values are committed before process_payment references them.
alter type product_type add value if not exists 'putme_pro_weekly';
alter type product_type add value if not exists 'jamb_pro_weekly';
