/**
 * IBASS syllabus coverage matrix generator.
 *
 * For each subject we teach, parses the IBASS markdown into its sections
 * (numbered) and for each section the topic items and the "Candidates
 * should be able to" items, then lays them against our curriculum spine
 * topic list and its lesson set. Emits one markdown matrix per subject.
 *
 * Usage: node scripts/ibass-coverage.mjs <subject> [<subject> ...]
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const SYLLABUS = path.join(ROOT, 'content-folder', 'jamb-syllabus')
const CURRICULA = ROOT

const SUBJECTS = {
  english: { md: 'english.md', json: 'english-curriculum.json' },
  mathematics: { md: 'mathematics.md', json: 'mathematics-curriculum.json' },
  physics: { md: 'physics.md', json: 'physics-curriculum.json' },
  chemistry: { md: 'chemistry.md', json: 'chemistry-curriculum.json' },
  biology: { md: 'biology.md', json: 'biology-curriculum.json' },
  economics: { md: 'economics.md', json: 'economics-curriculum.json' },
  government: { md: 'government.md', json: 'government-curriculum.json' },
  commerce: { md: 'commerce.md', json: 'commerce-curriculum.json' },
}

// Extract "### N. <title>" sections and their topic/objective blocks
function parseSections(md) {
  const lines = md.split(/\r?\n/)
  const sections = []
  let current = null
  for (const line of lines) {
    const m = /^###\s+([A-Za-z0-9]+\.)?\s*(.+?)\s*$/.exec(line)
    if (m) {
      if (current) sections.push(current)
      current = { number: (m[1] ?? '').replace(/\.$/, ''), title: m[2].trim(), topicsBlock: '', objectivesBlock: '', mode: null }
      continue
    }
    if (current) {
      if (/^\*\*Topics and notes\*\*/i.test(line)) { current.mode = 'topics'; continue }
      if (/^\*\*Candidates should be able/i.test(line)) { current.mode = 'objectives'; continue }
      if (current.mode === 'topics') current.topicsBlock += line + '\n'
      else if (current.mode === 'objectives') current.objectivesBlock += line + '\n'
    }
  }
  if (current) sections.push(current)
  return sections
}

function extractItems(block) {
  const items = []
  const lines = block.split(/\r?\n/)
  for (const raw of lines) {
    const trimmed = raw.trim()
    if (!trimmed.startsWith('-')) continue
    const body = trimmed.replace(/^-\s*/, '').trim()
    if (!body) continue
    items.push({ text: body })
  }
  return items
}

const SYNONYMS = [
  ['equilibra', 'equilibrium', 'equilibrium'],
  ['astronomic', 'astronomical', 'astronomy', 'astronomical'],
  ['align', 'alignment'],
  ['purific', 'purify', 'purification', 'purifying'],
  ['alphabet', 'spelling'],
  ['state', 'matter'],
  ['electrochem', 'electrolysis'],
]

function norm(s) {
  let n = (s || '').toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  for (const syn of SYNONYMS) {
    const target = syn[syn.length - 1]
    for (const alias of syn.slice(0, -1)) {
      n = n.replace(new RegExp(`\\b${alias}[a-z]*\\b`, 'g'), target)
    }
  }
  return n
}

function tokenOverlap(a, b) {
  const sa = new Set(norm(a).split(' ').filter((w) => w.length > 3))
  const sb = new Set(norm(b).split(' ').filter((w) => w.length > 3))
  if (sa.size === 0) return 0
  let hit = 0
  for (const w of sa) if (sb.has(w)) hit += 1
  return hit / sa.size
}

function lessonsFromSpineDescription(desc, lessons) {
  const m = /split into ([^)]+)\)/i.exec(desc || '')
  if (!m) return []
  const raw = m[1]
    .replace(/(spine topic)/gi, '')
    .replace(/lessons?/gi, '')
    .replace(/"?and"?/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const parts = raw.split(/\s*(?:,|;| and )\s*/).filter((p) => p.trim().length > 2)
  const out = []
  for (const p of parts) {
    const target = norm(p)
    const hit = lessons.find((l) =>
      norm(l.slug) === target
      || norm(l.slug).replace(/-/g, ' ').startsWith(target)
      || target.startsWith(norm(l.slug).replace(/-/g, ' '))
      || norm(l.slug).replace(/-/g, '') === target.replace(/-/g, '').replace(/\s/g, '')
    )
    if (hit) out.push(hit)
  }
  return out
}

function bestSpineMatch(ibassTitle, spineTopics) {
  // English's spine has multiple topics under one IBASS section, so this
  // returns ALL topics with non-trivial overlap.
  const candidates = []
  for (const t of spineTopics) {
    const a = tokenOverlap(ibassTitle, t.section ? t.section : '')
    const b = tokenOverlap(ibassTitle, t.name)
    const s = Math.max(a, b)
    if (s >= 0.34) candidates.push({ topic: t, score: s })
  }
  candidates.sort((a, b) => b.score - a.score)
  return candidates
}

for (const subject of process.argv.slice(2)) {
  const { md, json } = SUBJECTS[subject]
  if (!md) { console.log(`unknown subject ${subject}`); continue }
  const doc = fs.readFileSync(path.join(SYLLABUS, md), 'utf8')
  const curriculum = JSON.parse(fs.readFileSync(path.join(CURRICULA, 'content-folder', json), 'utf8'))
  const spineTopics = curriculum.topics ?? []
  const lessons = curriculum.lessons ?? []
  const lessonsBySlugPrefix = new Map()
  for (const s of spineTopics) {
    const key = norm(s.slug)
    lessonsBySlugPrefix.set(s.slug, lessons.filter((l) => {
      const k = norm(l.slug)
      return k === key || k.startsWith(key + '-') || key.startsWith(k + '-')
    }))
  }

  const sections = parseSections(doc)
  const out = []
  out.push(`# IBASS coverage matrix — ${subject}`)
  out.push(``)
  out.push(`Source IBASS sections: ${sections.length}`)
  out.push(`Curriculum spine topics: ${spineTopics.length}`)
  out.push(`Curriculum lessons: ${lessons.length}`)
  out.push(``)
  out.push(`| § | IBASS section | Spine topic (lessons) | Topic match |`)
  out.push(`|---|---|---|---|`)

  let matched = 0
  for (const s of sections) {
    const candidates = bestSpineMatch(s.title, spineTopics)
    const mapped = []
    for (const c of candidates) {
      for (const l of (lessonsBySlugPrefix.get(c.topic.slug) ?? [])) mapped.push(l)
    }
    const ls = [...new Map(mapped.map((l) => [l.slug, l])).values()]
    const topicList = ls.length ? ls.map((l) => l.slug).join(', ') : '—'
    const spineList = candidates.length ? candidates.map((c) => c.topic.slug).join(', ') : '—'
    const attached = ls.length > 0
    if (attached) matched += 1
    out.push(
      `| ${s.number} | ${s.title} | ${spineList} (${topicList}) | ${attached ? '✓' : 'MISS'} |`,
    )
  }
  out.push(``)
  out.push(`## Section → spine-topic checklist`)
  out.push(``)
  for (const s of sections) {
    const candidates = bestSpineMatch(s.title, spineTopics)
    const mapped = []
    for (const c of candidates) {
      for (const l of (lessonsBySlugPrefix.get(c.topic.slug) ?? [])) mapped.push(l)
    }
    const ls = [...new Map(mapped.map((l) => [l.slug, l])).values()]
    out.push(`### ${s.number}. ${s.title}`)
    if (ls.length === 0) {
      out.push(`_no spine topic overlap_`)
    } else {
      out.push(`- mapped spine topic: \`${candidates.map((c) => c.topic.slug).join(', ')}\` — lessons: ${ls.map((l) => l.slug).join(', ')}`)
    }
    out.push(``)
    out.push(`Topics (from IBASS):`)
    for (const t of extractItems(s.topicsBlock)) out.push(`  - ${t.text}`)
    out.push(``)
    out.push(`Candidates should be able to (from IBASS):`)
    for (const t of extractItems(s.objectivesBlock)) out.push(`  - ${t.text}`)
    out.push(``)
  }
  out.push(`## Totals`)
  out.push(`Sections with at least one lesson mapped: ${matched} of ${sections.length}`)
  console.log(out.join('\n'))
}
