-- Close anonymous IDOR on security-definer RPCs.
--
-- `if p_user_id <> auth.uid()` evaluates to NULL when there is no authenticated
-- user, and PL/pgSQL treats NULL as false, so the exception never fires.
-- Combined with stale anon EXECUTE grants, an anonymous caller could read any
-- user's dashboard data through get_dashboard_data().
--
-- Rebuild the affected functions from their live definitions with an explicit
-- NULL check, then remove the leftover anon/public grants.

do $$
declare
  r record;
  v_def text;
  v_fixed text;
begin
  for r in
    select oid, oid::regprocedure::text as sig
    from pg_proc
    where oid::regprocedure::text in (
      'try_start_free_mock(uuid,uuid,integer)',
      'ensure_free_question_pool(uuid)',
      'get_dashboard_data(uuid)',
      'ensure_exam_free_pool(uuid,uuid,uuid[])'
    )
  loop
    v_def := pg_get_functiondef(r.oid);
    -- Already guarded from an earlier run: skip instead of failing, so this
    -- migration can be replayed safely by `supabase db push`.
    if v_def like '%auth.uid() is null or p_user_id <> auth.uid()%' then
      continue;
    end if;
    v_fixed := replace(
      v_def,
      'if p_user_id <> auth.uid() then',
      'if auth.uid() is null or p_user_id <> auth.uid() then'
    );
    if v_fixed = v_def then
      raise exception 'Expected auth guard not found in %', r.sig;
    end if;
    execute v_fixed;
  end loop;
end $$;

-- update_streak had no guard at all; add one immediately after BEGIN.
do $$
declare
  v_def text;
  v_fixed text;
begin
  select pg_get_functiondef(oid) into v_def
  from pg_proc
  where oid::regprocedure::text = 'update_streak(uuid)';

  if v_def like '%auth.uid() is null or p_user_id <> auth.uid()%' then
    return;
  end if;

  v_fixed := replace(
    v_def,
    E'begin\n',
    E'begin\n  if auth.uid() is null or p_user_id <> auth.uid() then\n    raise exception \'User ID mismatch\';\n  end if;\n'
  );
  if v_fixed = v_def then
    raise exception 'Expected begin block not found in update_streak';
  end if;
  execute v_fixed;
end $$;

-- Remove legacy broad grants. Authenticated users and the server-side
-- service role keep explicit access.
revoke all on function get_dashboard_data(uuid) from public, anon;
revoke all on function ensure_exam_free_pool(uuid, uuid, uuid[]) from public, anon;
revoke all on function update_streak(uuid) from public, anon;
revoke all on function try_start_free_mock(uuid, uuid, integer) from public, anon;
revoke all on function ensure_free_question_pool(uuid) from public, anon;

grant execute on function get_dashboard_data(uuid) to authenticated, service_role;
grant execute on function ensure_exam_free_pool(uuid, uuid, uuid[]) to authenticated, service_role;
grant execute on function update_streak(uuid) to authenticated, service_role;
grant execute on function try_start_free_mock(uuid, uuid, integer) to authenticated, service_role;
grant execute on function ensure_free_question_pool(uuid) to authenticated, service_role;
