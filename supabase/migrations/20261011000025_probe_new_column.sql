-- Probe: what happens to a NEWLY added column on questions?
--
-- The answer-column lock (20261011000022) withdrew the table-level
-- SELECT and granted it back column by column. This checks what a
-- column added afterwards inherits, so the maintenance cost is known
-- rather than assumed.
--
-- A throwaway column is added, its ACL state is recorded, and the
-- column is dropped again in the next migration, so the table is left
-- exactly as it was.

create table if not exists public._probe2 (id int primary key default 1, payload text);

alter table questions add column if not exists _acl_probe text;

insert into public._probe2 (id, payload)
select 1,
  json_build_object(
    'probe_column_attacl_is_null', (
      select attacl is null from pg_attribute
      where attrelid = 'public.questions'::regclass and attname = '_acl_probe'
    ),
    'probe_column_acl', (
      select coalesce(array_to_string(attacl, ' '), 'null') from pg_attribute
      where attrelid = 'public.questions'::regclass and attname = '_acl_probe'
    ),
    'table_acl_has_authenticated_select', (
      select coalesce(array_to_string(relacl, ' '), 'null') from pg_class
      where oid = 'public.questions'::regclass
    )
  )::text
on conflict (id) do update set payload = excluded.payload;
