-- Base table privileges for anon and authenticated roles.
-- RLS policies control row-level access; these GRANTs allow the roles to
-- reach the tables at all. Without them, every query returns 42501
-- "permission denied for table" regardless of RLS policy content.

grant usage on schema public to anon, authenticated;

grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
grant all on all functions in schema public to anon, authenticated;

alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on sequences to anon, authenticated;
alter default privileges in schema public grant all on functions to anon, authenticated;
