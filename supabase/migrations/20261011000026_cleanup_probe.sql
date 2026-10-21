-- Remove the diagnostic probe: the throwaway column and the table that
-- recorded what a newly added column inherits.

alter table questions drop column if exists _acl_probe;

drop table if exists public._probe2;
