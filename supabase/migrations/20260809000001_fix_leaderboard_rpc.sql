-- Root cause: getLeaderboardData read leaderboard_entries via PostgREST with an
-- embedded `profiles!inner` join. The profiles RLS policy "users can read own
-- profile" (id = auth.uid()) filters out every other user's profile row, so the
-- inner join silently dropped all foreign entries: users only ever saw their
-- own row (or nothing). Scores were written correctly by the leaderboard
-- trigger all along; this is purely a read-side RLS problem.
--
-- Fix: expose leaderboard rows through a SECURITY DEFINER RPC that returns only
-- the public display columns, matching the existing hardened-function pattern
-- (complete_mock_session, get_dashboard_data). No changes to profiles RLS, so
-- no new data is ever exposed.

create or replace function public.get_leaderboard(p_period leaderboard_period, p_exam_id uuid)
returns table (
  user_id uuid,
  username text,
  avatar_index integer,
  school_name text,
  school_slug text,
  score numeric
)
language plpgsql
stable
security definer
set search_path = 'public'
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  return query
    select le.user_id,
           p.username,
           p.avatar_index,
           s.name,
           s.slug,
           le.score
    from public.leaderboard_entries le
    join public.profiles p on p.id = le.user_id
    left join public.schools s on s.id = p.school_id
    where le.period = p_period
      and le.exam_id = p_exam_id
    order by le.score desc
    limit 100;
end;
$$;

revoke execute on function public.get_leaderboard(leaderboard_period, uuid) from public, anon;
grant execute on function public.get_leaderboard(leaderboard_period, uuid) to authenticated;