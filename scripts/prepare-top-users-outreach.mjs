#!/usr/bin/env node
/**
 * Prepare personalized outreach messages for the most active Propeida users
 * (feedback + testimonial ask). NEVER sends anything — it only reads data and
 * writes messages to logs/top-users-outreach-<stamp>.md for review.
 *
 * "Most active" = users on the leaderboard (any period) and/or users with 2+
 * completed mock exams, ranked by engagement (mock completions, then best
 * all-time leaderboard score).
 *
 * Usage (from repo root):
 *   node --env-file=.env scripts/prepare-top-users-outreach.mjs
 *   node --env-file=.env scripts/prepare-top-users-outreach.mjs --top 20
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const LOG_DIR = fileURLToPath(new URL('../logs/', import.meta.url))
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const argv = process.argv.slice(2)
const TOP = parseInt(argv[argv.indexOf('--top') + 1] ?? '20', 10) || 20
const PAGE_SIZE = 1000

const headers = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, Accept: 'application/json' }

async function fetchAll(path) {
  const rows = []
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}&limit=${PAGE_SIZE}&offset=${offset}`, { headers })
    if (!res.ok) throw new Error(`GET ${path} failed (HTTP ${res.status})`)
    const batch = await res.json()
    rows.push(...batch)
    if (batch.length < PAGE_SIZE) break
  }
  return rows
}

const leaderboardRows = await fetchAll('leaderboard_entries?select=user_id,score,period,exam_id&order=updated_at.desc')
const mockRows = await fetchAll('exam_sessions?select=user_id&status=eq.completed&mode=eq.mock&order=completed_at.desc')
const profileRows = await fetchAll('profiles?select=id,username&order=created_at.desc')
const examRows = await fetchAll('exams?select=id,school_id')
const schoolRows = await fetchAll('schools?select=id,name')

const schoolName = new Map(schoolRows.map((s) => [s.id, s.name]))
const schoolByExam = new Map(examRows.map((e) => [e.id, schoolName.get(e.school_id) ?? null]))
const username = new Map(profileRows.map((p) => [p.id, p.username]))

const mocksByUser = new Map()
for (const r of mockRows) mocksByUser.set(r.user_id, (mocksByUser.get(r.user_id) ?? 0) + 1)

const bestScore = new Map()
const userSchools = new Map()
for (const r of leaderboardRows) {
  const prev = bestScore.get(r.user_id) ?? 0
  if (Number(r.score) > prev) bestScore.set(r.user_id, Number(r.score))
  const name = schoolByExam.get(r.exam_id)
  if (name && !userSchools.has(r.user_id)) userSchools.set(r.user_id, name)
}

const candidates = new Map()
for (const r of leaderboardRows) candidates.set(r.user_id, { mocks: 0, score: 0, school: null })
for (const [id, count] of mocksByUser) {
  if (count >= 2) {
    const c = candidates.get(id) ?? { mocks: 0, score: 0, school: null }
    c.mocks = count
    candidates.set(id, c)
  }
}
for (const [id, c] of candidates) {
  c.score = bestScore.get(id) ?? 0
  c.school = userSchools.get(id) ?? null
  c.mocks = Math.max(c.mocks ?? 0, mocksByUser.get(id) ?? 0)
}

const ranked = [...candidates.entries()]
  .map(([id, c]) => ({ id, ...c }))
  .sort((a, b) => b.mocks - a.mocks || b.score - a.score)

function personalize(u) {
  const bits = []
  if (u.school) bits.push(`you're on the ${u.school} leaderboard`)
  if (u.score > 0) bits.push(`your best score there is ${u.score}%`)
  if (u.mocks > 0) bits.push(`you've completed ${u.mocks} full mock exam${u.mocks === 1 ? '' : 's'}`)
  if (!bits.length) return 'you keep showing up to practice'
  return bits.join(', ')
}

function messageFor(u) {
  const name = username.get(u.id) ?? 'there'
  return `Hi ${name},

We noticed you're one of the most active people on Propeida — ${personalize(u)}.

With UNILORIN Post-UTME just a few days away, we're curious how practice has been going for you. What's been most useful so far? Anything that felt confusing or missing? Reply to this email — we read everything ourselves.

And if you're happy with the app, would you be open to sending a one-line testimonial we could share with other candidates? Just a couple of sentences about your experience is enough.

Either way, keep going — the last few days matter most.

— The Propeida Team
propeida.help@gmail.com`
}

const chosen = ranked.slice(0, TOP)
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const md = [
  '# Top active users — outreach draft (REVIEW BEFORE SENDING)',
  '',
  `Generated: ${new Date().toISOString()}`,
  `Candidates considered: ${ranked.length}  |  Drafted: ${chosen.length}`,
  '',
  '## Ranking summary',
  '',
  '| # | user_id | leaderboard | best score | mocks completed |',
  '|---|---------|-------------|------------|-----------------|',
  ...chosen.map((u, i) => `| ${i + 1} | ${u.id} | ${u.school ?? '—'} | ${u.score || '—'} | ${u.mocks || '—'} |`),
  '',
  '## Draft messages (personalized)',
  '',
  ...chosen.flatMap((u, i) => [`### ${i + 1}. ${username.get(u.id) ?? '(no username)'}`, '', '```', messageFor(u), '```', '']),
  '',
  '> Nobody receives these automatically. Send only after your review.',
].join('\n')

await mkdir(LOG_DIR, { recursive: true })
const filePath = join(LOG_DIR, `top-users-outreach-${stamp}.md`)
await writeFile(filePath, `${md}\n`)

console.log(`Candidates considered: ${ranked.length}`)
console.log(`Drafted messages: ${chosen.length}`)
console.log(`Draft file: ${filePath}`)
console.log('\nTop 5 recipients (by engagement):')
for (const u of ranked.slice(0, 5)) {
  console.log(`  • ${username.get(u.id) ?? u.id} | school: ${u.school ?? '—'} | best score: ${u.score || '—'} | mocks: ${u.mocks || '—'}`)
}
console.log('\nSample message (first draft):\n')
console.log('─────')
console.log(messageFor(chosen[0]))
console.log('─────')
console.log('\nNothing was sent. Review the draft file before any outreach.')