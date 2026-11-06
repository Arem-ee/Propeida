# Database incident: resolved (2026-11-04)

## Status

Resolved. The earlier diagnosis that named
`ympschsusvzsaellvivg.supabase.co` was wrong: that host is stale and does not
belong to this project. The configured host,
`yaglpxybwmmpzbzgixkr.supabase.co`, resolves and its REST endpoint responds with
401, which means the database is live.

## What happened

Two B.1 seed runs failed partway through the lesson loop with
`TypeError: fetch failed`, one at `adaptive-colouration` and one at
`levels-of-organisation`. The seeder deletes a lesson's blocks before inserting
replacements, so each failed run left that lesson with zero blocks.

The failures were transient network errors, not a deleted Supabase project.
Checking the host that is actually in `.env`, rather than the stale host from
the earlier note, showed the database was reachable throughout.

## Repair

Re-running `node --env-file=.env scripts/seed-curriculum.mjs biology` after the
connection settled restored the damaged lessons and completed the B.1 split.
Both `levels-of-organisation` and `adaptive-colouration` now have 7 blocks, and
the four B.1 lessons are live. The later B.2 Nutrition seed then inserted its
four lessons, followed by five B.3 Transport lessons, five B.4 Respiration lessons, five B.5 Excretion lessons, five B.6 Support and Movement lessons, eight B.7 Reproduction lessons, three B.8 Growth lessons, eight B.9 Co-ordination and Control lessons and sixteen C Ecology lessons.

Current database state: 84 Biology topics, 79 published Biology lessons and 160
published library lessons. All 79 Biology lessons pass
`check-lesson-depth.mjs`; the B.1-C pages were verified at 360px and 1280px
with correct checks and no horizontal overflow.

## Prevention

- Run the seeder with `--dry-run` first and confirm the planned inserts and
  updates.
- Treat a seed run as destructive per lesson: it clears that lesson's blocks
  before inserting the replacements. Do not start one on a flaky connection.
- If a run fails during an insert, re-run once the connection is stable; the
  seeder is idempotent and heals the lesson's blocks.
- When diagnosing connectivity, read the host from `.env` and test its REST
  endpoint. Do not reuse a stale host from an older note.
