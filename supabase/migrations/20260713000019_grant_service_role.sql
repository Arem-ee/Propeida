-- The service_role is used server-side by createAdminClient() for admin
-- routes and webhooks.  It must be able to read reference tables (exams,
-- subjects, etc.) and write to data tables (questions, entitlements, etc.).
-- Without these grants PostgREST returns 42501 even though the role
-- technically bypasses RLS at the row level.

grant usage on schema public to service_role;

grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all functions in schema public to service_role;

alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant all on functions to service_role;
