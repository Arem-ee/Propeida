-- Remove the diagnostic probe table. It existed only to read the live
-- privilege state back over the REST API while the answer-column lock was
-- being put in place.

drop table if exists public._probe;
