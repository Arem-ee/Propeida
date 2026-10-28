-- Phase 1: close the admin-escalation and answer-key exfiltration paths.
--
-- 20260724000029 granted SELECT, INSERT and UPDATE on every public table to
-- `authenticated`. That table-level grant overrode the narrower column grants
-- on profiles, so any signed-in user could write profiles.is_admin. The same
-- grant let clients insert/update exam_sessions and insert session_answers,
-- which allowed session mode/timer tampering and let a client pre-fill answers
-- before loadSessionData read them back with the service role.
--
-- Session rows are now authored server-side (createSession/createExamSession
-- use the service-role client) and answers are written only by the
-- record_session_answer security-definer RPC. SELECT policies are unchanged.

-- 1. profiles: clients may only edit the columns the app actually writes.
-- Revoking UPDATE does not remove existing column grants, so re-grant after.
revoke insert, update, delete on table public.profiles from public, anon, authenticated;

-- A table-level revoke does not clear pre-existing column ACLs; remove any on
-- the authorization columns before re-granting the app-editable ones.
revoke update (id, is_admin, ai_features_enabled, referral_code, referred_by)
  on table public.profiles from public, anon, authenticated;

grant update (
  full_name,
  username,
  school_id,
  onboarding_completed,
  subject_combinations,
  intended_course,
  exam_target,
  heard_about,
  study_time,
  target_score,
  accessibility_needs,
  subjects_pending
) on table public.profiles to authenticated;

-- Defense in depth: if a table-level UPDATE grant ever returns, authorization
-- columns stay server-managed. auth.uid() is null for service-role writes and
-- migrations, which are the only callers allowed to touch these columns.
create or replace function public.guard_profile_privileges()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if new.id is distinct from old.id
    or new.is_admin is distinct from old.is_admin
    or new.ai_features_enabled is distinct from old.ai_features_enabled
    or new.referral_code is distinct from old.referral_code
    or new.referred_by is distinct from old.referred_by then
    raise exception 'profile privilege columns are server-managed'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_profile_privileges on public.profiles;
create trigger guard_profile_privileges
  before update on public.profiles
  for each row execute function public.guard_profile_privileges();

revoke all on function public.guard_profile_privileges() from public, anon, authenticated;

-- 2. Sessions and answers are server-authored. Clients keep SELECT only.
revoke insert, update, delete on table public.exam_sessions from public, anon, authenticated;
revoke insert, update, delete on table public.session_answers from public, anon, authenticated;

-- The write policies are unreachable without grants; drop them so a future
-- grant cannot silently re-open client writes.
drop policy if exists "users can insert own sessions" on public.exam_sessions;
drop policy if exists "users can update own sessions" on public.exam_sessions;
drop policy if exists "users can insert own session answers" on public.session_answers;

-- Verify with supabase/verification/verify_reconciliation.sql (Phase 1
-- assertions) and scripts/verify-phase1-security.mjs.
