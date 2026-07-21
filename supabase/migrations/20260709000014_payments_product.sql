-- 1. Add product column to payments table
alter table payments add column product text;-- not null default 'putme_pro';

-- 2. Backfill existing rows
update payments set product = 'putme_pro' where product is null;

-- 3. Make it not null going forward
alter table payments alter column product set not null;
alter table payments alter column product set default 'putme_pro';
