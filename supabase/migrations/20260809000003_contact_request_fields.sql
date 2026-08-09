-- Structured "request a university" fields so admin can act on requests
-- without parsing the message text.

alter table contact_submissions add column if not exists requested_university text;
alter table contact_submissions add column if not exists requested_course text;
