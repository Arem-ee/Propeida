-- Worked-steps helpfulness feedback (2026-11-15).
--
-- One tap from the practice feedback card records whether the worked steps
-- helped the learner. The table is service-role only: no client role holds
-- any grant and no policy exists. Writes go through the definer RPC, which
-- requires the caller to own a practice session that served this exact
-- question, so feedback can only be filed by someone who saw the steps.
-- Mock sessions never show steps and are excluded.

create table question_step_feedback (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions(id) on delete cascade,
  session_id uuid not null references exam_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating text not null check (rating in ('helped', 'didnt_help')),
  created_at timestamptz not null default now(),
  unique (session_id, question_id, user_id)
);

create index question_step_feedback_question_idx
  on question_step_feedback (question_id);

alter table question_step_feedback enable row level security;
revoke all on table question_step_feedback from public, anon, authenticated;

create or replace function record_question_step_feedback(p_question_id uuid, p_rating text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session_id uuid;
begin
  if p_rating not in ('helped', 'didnt_help') then
    raise exception 'unknown rating' using errcode = '22023';
  end if;

  select es.id into v_session_id
  from exam_sessions es
  join session_answers sa on sa.session_id = es.id
  where es.user_id = auth.uid()
    and es.mode = 'practice'
    and sa.question_id = p_question_id
    and sa.selected_answer is not null
  order by es.started_at desc
  limit 1;

  if v_session_id is null then
    raise exception 'no practice answer on record for this question' using errcode = '22023';
  end if;

  insert into question_step_feedback (question_id, session_id, user_id, rating)
  values (p_question_id, v_session_id, auth.uid(), p_rating)
  on conflict (session_id, question_id, user_id) do update
    set rating = excluded.rating,
        created_at = now();
end;
$$;

revoke all on function record_question_step_feedback(uuid, text) from public, anon;
grant execute on function record_question_step_feedback(uuid, text) to authenticated, service_role;
