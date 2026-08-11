-- Corrective top-up: some live free pools predate the 2x weighting and
-- were short (97-99/100 -> 197-199 after +1x). Bring every pool to
-- exactly 2x the weighted mock size per subject (68/68/64 = 200).
-- Excess allocations (subjects already > target) are left untouched;
-- only deficits are filled, so pools never shrink.

do $$
declare
  v_subject_slug text;
  v_target integer;
  v_rows integer;
begin
  for v_subject_slug, v_target in
    select j.key, (j.value::int) * 2
    from app_config a
    cross join lateral jsonb_each(a.value -> 'unilorin-post-utme') j
    where a.key = 'subject_weighting'
  loop
    execute format($f$
      insert into user_exam_free_pools (user_id, exam_id, question_id)
      select u.user_id, u.exam_id, q.id
      from (
        select distinct uefp.user_id, uefp.exam_id
        from user_exam_free_pools uefp
        join exams e on e.id = uefp.exam_id
        where e.slug = %L
      ) u
      join lateral (
        select q2.id
        from questions q2
        join subjects s on s.id = q2.subject_id
        where q2.exam_id = u.exam_id
          and s.slug = %L
          and not exists (
            select 1 from user_exam_free_pools p
            where p.user_id = u.user_id and p.question_id = q2.id
          )
        order by random()
        limit greatest(0, %s - (
          select count(*)
          from user_exam_free_pools p
          join questions pq on pq.id = p.question_id
          join subjects ps on ps.id = pq.subject_id
          where p.user_id = u.user_id and ps.slug = %L
        ))
      ) q on true
      on conflict do nothing
    $f$, 'unilorin-post-utme', v_subject_slug, v_target, v_subject_slug);
    get diagnostics v_rows = row_count;
    raise notice 'subject %: filled % rows', v_subject_slug, v_rows;
  end loop;
end;
$$;