// Back-compat wrapper. The shared seeder now lives in seed-curriculum.mjs.
//
// Usage: node --env-file=.env scripts/seed-government-curriculum.mjs

import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const run = spawnSync(
  process.execPath,
  [join(here, 'seed-curriculum.mjs'), 'government', ...process.argv.slice(2)],
  { stdio: 'inherit' },
)
process.exit(run.status ?? 1)
