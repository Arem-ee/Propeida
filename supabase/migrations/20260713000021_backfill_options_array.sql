-- Backfill questions.options from object shape {a:str,b:str,c:str,d:str} to array shape [{key:str,text:str},...]
-- This is a one-time data migration; all write paths now store the canonical array format.

update questions
set options = (
  select jsonb_agg(
    jsonb_build_object('key', k.v, 'text', options -> k.v)
    order by array_position(array['a','b','c','d'], k.v)
  )
  from (values ('a'), ('b'), ('c'), ('d')) as k(v)
  where options ? k.v
)
where jsonb_typeof(options) = 'object'
  and options ? 'a';
