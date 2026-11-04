# Database outage: Supabase host unresolved (2026-11-04)

## What happened

After the Biology depth tier was seeded, seeding run 1 (the B.1 pass) failed
midway through the lesson loop with
`insert blocks adaptive-colouration: TypeError: fetch failed`, and run 2
failed at `levels-of-organisation` with the same error. From then on, the
configured Supabase host stopped resolving on any public DNS resolver.

## Evidence

- `Resolve-DnsName -Name ympschsusvzsaellvivg.supabase.co -Type A` via the local
  resolver: fails ("DNS name does not exist").
- `Resolve-DnsName -Name ympschsusvzsaellvivg.supabase.co -Server 8.8.8.8|1.1.1.1|9.9.9.9`:
  all fail.
- Control domains resolve normally (`www.google.com`, `github.com`,
  `castris.vercel.app`), so this is not a general loss of connectivity; the
  host is gone from global DNS, which is what happens when the Supabase project
  is deleted or fully provisioned away.

## Known damage in the database (worst case)

The seeder deletes a lesson's blocks before re-inserting them, so a lesson that
failed at insert time has **no blocks** until the seed is re-run successfully:

| Lesson | State after the failed runs |
|---|---|
| `adaptive-colouration` | delete succeeded, insert failed → 0 blocks |
| `levels-of-organisation` | delete succeeded, insert failed → 0 blocks |
| `characteristics-of-living-things` | re-applied successfully in run 2 |
| `cell-structure-and-function` | re-applied successfully in run 2 |
| the other 12 published Biology lessons | untouched by run 2 (failed before reaching them); present from run 1 |

## Other partial changes

- 40 topic rows now exist in the subjects table for biology (37 + 3 new:
  `leaf-anatomy`, `plant-supporting-tissues`, `mammalian-internal-organs`).
  The three new topics were inserted with `published = true` even though their
  lessons were never inserted.
- The B.1 spine row (`internal-structure-of-a-flowering-plant`) was updated to
  become the topic row for *Root and Stem Anatomy* (name, section, sort order,
  published), keeping its old slug, by the normal split rules.
- The four B.1 lessons are absent from the lessons table.
- Library totals are therefore inconsistent: lessons whose blocks may be
  missing still exist as rows and are linked to their topics.

## Recovery procedure

1. Confirm the Supabase project exists and is reachable, or follow its restore
   path (e.g. unpause or restore a paid backup). Configure the URL in `.env`
   and verify the host resolves.
2. Re-run `node --env-file=.env scripts/seed-curriculum.mjs biology`. It is
   idempotent: it re-uploads the blocks for every lesson in
   `content-folder/biology-curriculum.json`, re-publishes the topics that have
   lessons, and inserts the four B.1 lessons. After it completes, verify:
   - `levels-of-organisation` and `adaptive-colouration` have 7 blocks each;
   - `node scripts/check-lesson-depth.mjs content-folder/biology-curriculum.json`
     still passes;
   - library counts return to 101 lessons (97 + 4 new);
   - the four B.1 lessons are present at
     `/learn/biology/{root-and-stem-anatomy,leaf-anatomy,plant-supporting-tissues,mammalian-internal-organs}`.

## What not to do first

Do not run any seeder, migration or SQL edit until the host resolves. Every
failed partial run makes the damage worse; a successful run heals everything.
