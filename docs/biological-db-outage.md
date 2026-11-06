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
four lessons, followed by five B.3 Transport lessons, five B.4 Respiration lessons, five B.5 Excretion lessons, five B.6 Support and Movement lessons, eight B.7 Reproduction lessons, three B.8 Growth lessons, eight B.9 Co-ordination and Control lessons, sixteen C Ecology lessons, seven D Heredity and Variations lessons and three E Evolution lessons.

Current database state: 92 Biology topics, 92 published Biology lessons, 659
Biology blocks and 173 published library lessons; 5 Biology lessons carry depth.
All 92 Biology lessons pass `check-lesson-depth.mjs`; the A.1-E pages were
verified at 360px and 1280px with correct checks and no horizontal overflow.

## 2026-11-06 audit reseed

The factual and coverage remediation recorded in
`docs/biology-audit-2026-11-05.md` changed 69 of the 89 lessons. A targeted,
retry-safe seeder compared every source lesson with its database blocks and
rewrote only the 69 that differed: 498 blocks. A second run reported 0 changed
lessons and 0 blocks rewritten, confirming that the database matches the rebuilt
curriculum. Totals after the reseed: 89 Biology topics / 89 published lessons /
638 Biology blocks / 5 depth lessons; 170 published library lessons. A clean
production build and browser sweep then passed all 89 pages at 360px and 1280px.

## 2026-11-07 E-section split and paragraph redistribution

The Darwin/organic split and the evidence split added three lessons
(`the-organic-theory-of-evolution`, `comparative-anatomy-and-embryology`,
`biogeography-vestigial-organs-and-dna`); the two reused slugs kept their URLs.
Seeding inserted 3 lessons, updated 89 and wrote 659 blocks. A targeted re-run
reported 0 changed lessons. Totals: 92 Biology topics / 92 published lessons /
659 Biology blocks / 5 depth lessons; 173 published library lessons.

## Prevention

- Run the seeder with `--dry-run` first and confirm the planned inserts and
  updates.
- Treat a seed run as destructive per lesson: it clears that lesson's blocks
  before inserting the replacements. Do not start one on a flaky connection.
- If a run fails during an insert, re-run once the connection is stable; the
  seeder is idempotent and heals the lesson's blocks.
- When diagnosing connectivity, read the host from `.env` and test its REST
  endpoint. Do not reuse a stale host from an older note.
- For edits to existing Biology lessons, prefer a targeted retry-safe seeder
  that compares source blocks with the database and rewrites only lessons whose
  blocks differ from the rebuilt curriculum.
- For a full 89-page browser sweep, use a clean production build
  (`npm run build`, then `npm run start -- --port 3001`). A long dev-server run
  eventually corrupted the Next dev overlay manifest and returned spurious 500s.
