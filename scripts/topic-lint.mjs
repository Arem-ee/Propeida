#!/usr/bin/env node
// Topic-mapping linter for Propeida question bank.
//
// Validates every sidecar mapping file under content-folder/_work/bank-ingestion/topic-bank/<subject>-<year>.json
// against the JAMB syllabus structured at content-folder/jamb-syllabus/structured/<subject>.json.
//
// Checks per item:
//   - id carries year + number (int > 0)
//   - topic must be: <subject>:<slug> with slug in the subject's structured topic list,
//     OR the special slug held:figure / <subject>:out-of-syllabus (flagged)
//   - topic_extra optional, max 2, each <subject>:valid-slug in the subject's topic list
//     (out-of-syllabus and held:figure not allowed in extras)
//   - topic_note must be one of: exact | approximate | inferred-from-style | review
//
// Distribution report per subject: counts per section, top-10 slugs, out-of-syllabus and held:figure
// counts, and a flag list for any item whose topic is not in the subject's taxonomy.
//
// Usage:
//   node scripts/topic-lint.mjs [--subject <key> | --all] [--strict] [--soft]
//
//   default: lint every folder-present subject; exit 1 if any invalid slugs found
//   --strict: exit 1 on any unmapped topic note too (everything must be "exact")
//   --soft: exit 0 regardless; prints report without failing

import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'

const ROOT = resolve('.')
const SYL = join(ROOT, 'content-folder/jamb-syllabus/structured')
const TOPIC_DIR = join(ROOT, 'content-folder/_work/bank-ingestion/topic-bank')

const FIX_HELD = 'held:figure'

const args = {}
for (const a of process.argv.slice(2)) {
  if (a === '--all') { args.subject = null; continue }
  if (a === '--strict') { args.strict = true; continue }
  if (a === '--soft') { args.soft = true; continue }
  if (a.startsWith('--subject=')) { args.subject = a.split('=')[1]; continue }
  console.error(`unexpected argument: ${a}`); process.exit(2)
}

function loadSyllabus(subject) {
  const file = join(SYL, `${subject}.json`)
  if (!existsSync(file)) {
    // a flat file like subjects without structured JSON -> use markdown fallback? no: report unsupported
    return null
  }
  const data = JSON.parse(readFileSync(file, 'utf8'))
  const slugs = new Set()
  for (const sec of data.sections ?? []) {
    slugs.add(sec.key)
    for (const t of sec.topics ?? []) slugs.add(t.slug)
  }
  return { data, slugs }
}

function validateItem(item, subject, topicSet) {
  const issues = []
  const n = item?.number
  if (typeof n !== 'number' || !Number.isInteger(n) || n <= 0) issues.push('number not integer')
  const topic = item?.topic
  if (typeof topic !== 'string' || !topic.length) {
    issues.push('topic missing')
  } else if (topic === FIX_HELD) {
    // accepted pseudo-token, flagged at report level (not as invalid)
  } else if (topic.endsWith(':out-of-syllabus') || topic === 'out-of-syllabus') {
    // accepted pseudo-token, flagged at report level
  } else {
    const suffix = topic.includes(':') ? topic.split(':').slice(1).join(':') : topic
    if (!topicSet.has(suffix)) issues.push(`topic slug "${suffix}" not in ${subject} syllabus`)
  }
  const extras = item?.topic_extra ?? []
  if (!Array.isArray(extras)) {
    issues.push('topic_extra not array')
  } else if (extras.length > 2) {
    issues.push('topic_extra > 2')
  } else {
    for (const e of extras) {
      const suffix = (typeof e === 'string' && e.includes(':')) ? e.split(':').slice(1).join(':') : ''
      if (!suffix || !topicSet.has(suffix)) issues.push(`extra slug "${e}" invalid (extras must be valid taxonomy slugs, no pseudo-tokens)`)
    }
  }
  const notes = ['exact', 'approximate', 'inferred-from-style', 'review']
  if (!notes.includes(item?.topic_note)) issues.push(`topic_note "${item?.topic_note}" not one of ${notes.join('/')}`)
  return issues
}

// month: only lint subjects that have both a syllabus structured JSON and a topic-bank file
if (!existsSync(TOPIC_DIR)) {
  console.log('No topic-bank directory — nothing to lint.')
  process.exit(0)
}
const files = readdirSync(TOPIC_DIR).filter(f => /\.json$/.test(f) && /^[a-z0-9-]+-\d{4}(?:-?-?\d{4})?\.json$/.test(f))
if (files.length === 0) {
  console.log('topic-bank empty — nothing to lint.')
  process.exit(0)
}

// group by subject (files are <subject>-<year>.json)
const bySubject = new Map()
for (const f of files) {
  const subject = f.replace(/-\d{4}\.json$/, '').replace(/\.json$/, '')
  if (!bySubject.has(subject)) bySubject.set(subject, [])
  bySubject.get(subject).push(f)
}

const targets = args.subject ? [args.subject] : [...bySubject.keys()]
let totalErrors = 0
const reports = []
for (const subject of targets) {
  const syl = loadSyllabus(subject)
  if (!syl) {
    console.log(`subject ${subject}: no structured syllabus found — skipped`)
    continue
  }
  const slugs = new Set(syl.slugs)
  const files = bySubject.get(subject) ?? []
  const perSection = new Map()
  const perSlug = new Map()
  const out = []
  let total = 0, invalid = 0, held = 0, outOfSyll = 0
  for (const f of files) {
    let json
    try { json = JSON.parse(readFileSync(join(TOPIC_DIR, f), 'utf8')) }
    catch { out.push({ file: f, issue: 'JSON parse error' }); invalid++; continue }
    for (const item of json.items ?? []) {
      total++
      const issues = validateItem(item, subject, slugs)
      if (issues.length) { invalid++; out.push({ year: json.year, number: item?.number, issues }) }
      const topicSlug = (item?.topic ?? '')
      if (topicSlug === FIX_HELD) {
        held++
      } else if (topicSlug === 'out-of-syllabus' || topicSlug.endsWith(':out-of-syllabus')) {
        outOfSyll++
      } else if (slugs.has(topicSlug) || topicSlug.includes(':')) {
        const suffix = topicSlug.includes(':') ? topicSlug.split(':').slice(1).join(':') : topicSlug
        if (!slugs.has(suffix)) {
          // flagged above; keep distribution report clean
        } else {
          // find which section owns this slug
          let sectionKey = null
          for (const sec of syl.data.sections ?? []) {
            if (sec.topics?.some(t => t.slug === suffix)) { sectionKey = sec.key; break }
            if (sec.key === suffix) { sectionKey = sec.key; break }
          }
          perSection.set(sectionKey ?? 'unknown', (perSection.get(sectionKey ?? 'unknown') ?? 0) + 1)
          perSlug.set(suffix, (perSlug.get(suffix) ?? 0) + 1)
        }
      }
    }
  }
  const distribution = [...perSlug.entries()].sort((a, b) => b[1] - a[1])
  const report = {
    subject,
    files: files.length,
    items: total,
    invalid,
    held,
    outOfSyllabus: outOfSyll,
    sections: Object.fromEntries(perSection),
    topSlugs: distribution.slice(0, 10),
    flags: out.slice(0, 50),
  }
  reports.push(report)
  totalErrors += invalid
  console.log(`\n[${subject}] items=${total} invalid=${invalid} held=${held} out-of-syllabus=${outOfSyll} files=${files.length}`)
  console.log(`  sections: ${[...perSection.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join(', ')}`)
  console.log(`  top slugs: ${distribution.slice(0, 5).map(([k, v]) => `${k}=${v}`).join(', ')}`)
  if (out.length) console.log(`  flags (first ${Math.min(out.length, 5)}): ${JSON.stringify(out.slice(0, 5))}`)
}

const outFile = join(TOPIC_DIR, 'topic-lint-report.json')
writeFileSync(outFile, JSON.stringify({ generated: new Date().toISOString(), totalErrors, reports }, null, 2))
console.log(`\nreport -> ${outFile}`)
process.exit(args.soft ? 0 : totalErrors > 0 || (args.strict && reports.some(r => r.flags.length > 0)) ? 1 : 0)
