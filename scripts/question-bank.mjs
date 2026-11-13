// Reusable JAMB-like question-bank ingestion pipeline.
//
// Never publishes. It stages a selected cohort into draft/in_review rows so
// the admin review queue remains the only path into the live bank.
//
// Usage:
//   node scripts/question-bank.mjs plan --file Government-JAMB-Past-Questions-And-Answers.json --subject government --exam jamb --limit 25
//   node scripts/question-bank.mjs apply --file Government-JAMB-Past-Questions-And-Answers.json --subject government --exam jamb --source-batch government-first-25 --confirm
//   node scripts/question-bank.mjs rollback --source-batch government-first-25 --confirm
//   node scripts/question-bank.mjs status --source-batch government-first-25
//   node scripts/question-bank.mjs summary [--file GOVERNMENT-JAMB-Past-Questions.json]
//
// Generated manifests stay under content-folder/_work/bank-ingestion/ by default.

import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { createHash } from 'node:crypto'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const root = resolve('.')
const parsedRoot = resolve(root, 'content-folder/_parsed')
const auditPath = resolve(root, 'content-folder/_work/question-bank-audit.json')
const manifestRoot = resolve(root, 'content-folder/_work/bank-ingestion')

const [command, ...argv] = process.argv.slice(2)
const args = parseArgs(argv)
if (!command) usage(1)

function parseArgs(xs) {
  const out = {}
  for (let i = 0; i < xs.length; i++) {
    const x = xs[i]
    if (!x.startsWith('--')) throw new Error(`unexpected argument: ${x}`)
    const eq = x.indexOf('=')
    if (eq !== -1) {
      out[x.slice(2, eq)] = x.slice(eq + 1)
      continue
    }
    const key = x.slice(2)
    if (key === 'confirm') {
      out.confirm = true
      continue
    }
    const value = xs[++i]
    if (!value || value.startsWith('--')) throw new Error(`missing value for --${key}`)
    out[key] = value
  }
  return out
}

function usage(code = 0) {
  console.log(`Usage:
  plan      --file <parsed.json> [--subject <slug>] [--limit <n>] [--year <list>]
  apply     --file <parsed.json> --subject <slug> --source-batch <batch> [--limit <n>] [--year <list>] --confirm
  rollback  --source-batch <batch> --confirm
  status    --source-batch <batch>
  summary   [--file <parsed.json>] [--limit <n>]

All batches are marked with source = "jamb-bank:<batch>" and are inserted as in_review.
`)
  process.exit(code)
}

const parsedName = (name) => {
  if (!name) return null
  return name.replace(/\\/g, '/').split('/').pop()
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

const manifestSlug = (file) => parsedName(file).replace(/\.json$/, '')
const batchId = (value) => (value || `${new Date().toISOString().slice(0, 10)}-${manifestSlug(args.file)}`).replace(/[^a-zA-Z0-9._-]/g, '-')

const db = () => {
  if (!URL || !KEY) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  return createClient(URL, KEY)
}

const norm = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()

const hashRow = (r) => createHash('sha256')
  .update(norm(r.text))
  .update('\x00')
  .update(['A', 'B', 'C', 'D', 'E'].map((k) => norm(r.options?.[k])).join('\x00'))
  .digest('hex')

const splitYears = (value) => {
  if (!value) return null
  return new Set(String(value).split(',').map(s => s.trim()).filter(Boolean))
}

const optionsArray = (r) => {
  const out = ['A', 'B', 'C', 'D', 'E']
    .filter((k) => String(r.options?.[k] ?? '').trim())
    .map((k) => ({ key: k.toLowerCase(), text: String(r.options[k]).trim() }))
  return out
}

const answerLetter = (r) => String(r.answer ?? '').trim().toLowerCase()

const basicGate = (r) => {
  const options = optionsArray(r)
  const problems = []
  const answer = answerLetter(r)
  if (!/^[a-e]$/.test(answer)) problems.push('answer not A-E')
  if (options.filter(o => o.key !== 'e').length !== 4) problems.push('not exactly four A-D options')
  if (String(r.text ?? '').trim().length < 25) problems.push('stem too short')
  if (r.orphan) problems.push('orphan')
  if (r.needs_figure) problems.push('figure required')
  if (r.recovered) problems.push('recovered/orphan text')
  return problems
}

function loadAudit(file) {
  const audit = readJson(auditPath)
  return audit.rows
    .filter((item) => item.file === parsedName(file))
    .map((item) => ({ ...item }))
}

function loadRows(file, auditRows) {
  const parsed = readJson(resolve(parsedRoot, parsedName(file)))
  const result = []
  for (const item of auditRows) {
    const row = parsed[item.index]
    if (!row) throw new Error(`audit index ${item.index} outside ${file}`)
    result.push({ ...row, _audit: item })
  }
  return result
}

function selectGroups(file, { years, limit, includeReview = false } = {}) {
  const auditRows = loadAudit(file)
  const rows = loadRows(file, auditRows)
  const yearSet = splitYears(years)
  const gateIssues = []
  const built = []
  for (const row of rows) {
    if (yearSet && !yearSet.has(String(row.year))) continue
    const problems = basicGate(row)
    if (problems.length) {
      gateIssues.push({ year: row.year, number: row.number, problems, index: row._audit.index })
      continue
    }
    if (row._audit.status === 'needs-figure') {
      gateIssues.push({ year: row.year, number: row.number, problems: ['audit flagged figure'], index: row._audit.index })
      continue
    }
    if (row._audit.status !== 'ready' && row._audit.status !== 'duplicate' && !includeReview) {
      gateIssues.push({ year: row.year, number: row.number, problems: [`audit status ${row._audit.status}`], index: row._audit.index })
      continue
    }
    built.push({
      index: row._audit.index,
      source: parsedName(file),
      year: row.year,
      number: row.number,
      auditStatus: row._audit.status,
      auditIssues: row._audit.issues,
      key: hashRow(row),
      questionText: String(row.text ?? '').trim(),
      options: optionsArray(row),
      answer: answerLetter(row),
      sourceMarker: row.source,
    })
  }

  const seen = new Set()
  const duplicateKeys = new Set()
  for (const row of built) {
    if (seen.has(row.key)) duplicateKeys.add(row.key)
    seen.add(row.key)
  }
  const chosen = []
  for (const row of built) {
    if (duplicateKeys.has(row.key)) continue
    if (row.auditStatus === 'duplicate') continue
    chosen.push(row)
    if (limit && chosen.length >= Number(limit)) break
  }

  return { rows: chosen, skipped: gateIssues, duplicateKeys: [...duplicateKeys], total: rows.length }
}

async function plan() {
  const file = args.file
  if (!file) throw new Error('plan requires --file')
  const { rows, skipped, duplicateKeys, total } = selectGroups(file, { years: args.year, limit: args.limit })
  mkdirSync(manifestRoot, { recursive: true })
  const slug = manifestSlug(file)
  const out = args.output || resolve(manifestRoot, `${slug}.plan.json`)
  const manifest = {
    kind: 'question-bank-plan',
    createdAt: new Date().toISOString(),
    file: parsedName(file),
    batch: batchId(),
    years: splitYears(args.year) ? [...splitYears(args.year)] : null,
    requestedLimit: args.limit ? Number(args.limit) : null,
    auditRows: total,
    selected: rows.length,
    skipped: skipped.length,
    duplicateKeys: duplicateKeys.length,
    rows,
    skippedRows: skipped,
  }
  writeFileSync(out, JSON.stringify(manifest, null, 2))
  console.log(`planned ${manifest.selected} rows from ${manifest.file} (audit rows ${manifest.auditRows}, skipped ${manifest.skipped}, duplicates ${manifest.duplicateKeys})`)
  console.log(`manifest: ${out}`)
}

async function status() {
  const batch = args.sourceBatch || args.batch
  if (!batch) throw new Error('status requires --source-batch <batch>')
  const client = db()
  const { data, error } = await client
    .from('questions')
    .select('id, status, verified_state, review_note')
    .ilike('source', `jamb-bank:${batch}%`)
    .limit(5000)
  if (error) throw new Error(`status query failed: ${error.message}`)
  const rows = data ?? []
  const byVerified = new Map()
  const byStatus = new Map()
  for (const row of rows) {
    byVerified.set(row.verified_state, (byVerified.get(row.verified_state) ?? 0) + 1)
    byStatus.set(row.status, (byStatus.get(row.status) ?? 0) + 1)
  }
  console.log(`batch ${batch}: ${rows.length} rows`)
  console.log(`status: ${JSON.stringify(Object.fromEntries([...byStatus].sort()))}`)
  console.log(`verified_state: ${JSON.stringify(Object.fromEntries([...byVerified].sort()))}`)
}

async function apply() {
  if (!args.confirm) throw new Error('apply requires --confirm')
  const file = args.file
  if (!file) throw new Error('apply requires --file')
  if (!args.subject) throw new Error('apply requires --subject')
  const client = db()
  const batch = batchId()
  const sourceTag = `jamb-bank:${batch}`
  const examSlug = args.exam || 'jamb'

  const { data: exam } = await client.from('exams').select('id').eq('slug', examSlug).single()
  if (!exam) throw new Error(`exam missing: ${examSlug}`)
  const { data: subject } = await client.from('subjects').select('id').eq('slug', args.subject).single()
  if (!subject) throw new Error(`subject missing: ${args.subject}`)

  const { rows, skipped, duplicateKeys, total } = selectGroups(file, { years: args.year, limit: args.limit })

  const { data: already } = await client
    .from('questions')
    .select('id,question_text')
    .eq('exam_id', exam.id)
    .eq('subject_id', subject.id)
    .ilike('source', `jamb-bank:${batch}%`)
  if (already && already.length > 0) {
    throw new Error(`batch already present (${already.length} rows); use rollback or choose a new --source-batch`)
  }

  const inserts = []
  const seenText = new Set()
  for (const row of rows) {
    const canonical = norm(row.questionText)
    if (seenText.has(canonical)) continue
    seenText.add(canonical)
    inserts.push({
      exam_id: exam.id,
      subject_id: subject.id,
      question_text: row.questionText,
      options: row.options,
      correct_answer: row.answer,
      explanation: '',
      difficulty: 'medium',
      source: sourceTag,
      status: 'in_review',
      verified_state: 'unverified',
      review_note: `Bank import from ${row.source}; source-index ${row.index}; year ${row.year}; question ${row.number}; audit=${row.auditStatus}. Human review required before publish.`,
    })
  }

  if (inserts.length > 0) {
    const chunks = []
    for (let i = 0; i < inserts.length; i += 100) chunks.push(inserts.slice(i, i + 100))
    for (const chunk of chunks) {
      const { error } = await client.from('questions').insert(chunk)
      if (error) throw new Error(`insert failed for batch ${batch}: ${error.message}`)
    }
  }

  const report = {
    kind: 'question-bank-import',
    createdAt: new Date().toISOString(),
    file: parsedName(file),
    subject: args.subject,
    exam: examSlug,
    sourceBatch: sourceTag,
    auditRows: total,
    selected: rows.length,
    inserted: inserts.length,
    skippedGateCount: skipped.length,
    duplicateKeys: duplicateKeys.length,
    alreadyPresent: already?.length ?? 0,
  }
  mkdirSync(manifestRoot, { recursive: true })
  const out = args.output || resolve(manifestRoot, `${batch}.apply.json`)
  writeFileSync(out, JSON.stringify(report, null, 2))
  console.log(`inserted ${report.inserted} rows into in_review with source=${sourceTag}`)
  console.log(`report: ${out}`)
}

async function rollback() {
  if (!args.confirm) throw new Error('rollback requires --confirm')
  const batch = args.sourceBatch || args.batch
  if (!batch) throw new Error('rollback requires --source-batch <batch>')
  const client = db()
  const sourceTag = `jamb-bank:${batch}`
  const { data: rows, error } = await client
    .from('questions')
    .select('id, status, verified_state')
    .ilike('source', `${sourceTag}%`)
  if (error) throw new Error(`lookup failed: ${error.message}`)
  const deletable = (rows ?? []).filter(r => ['draft', 'in_review', 'rejected'].includes(r.status))
  const blocked = (rows ?? []).filter(r => !['draft', 'in_review', 'rejected'].includes(r.status))
  if (blocked.length > 0) {
    throw new Error(`refusing to delete ${blocked.length} non-draft rows in batch ${batch}`)
  }
  if (deletable.length > 0) {
    const { error: delError } = await client.from('questions').delete().in('id', deletable.map(r => r.id))
    if (delError) throw new Error(`delete failed: ${delError.message}`)
  }
  console.log(`deleted ${deletable.length} rows in batch ${batch}`)
}

async function summary() {
  const file = args.file
  if (file) {
    const { rows, skipped, duplicateKeys, total } = selectGroups(file, { years: args.year, limit: args.limit })
    console.log(`${parsedName(file)}: ${rows.length} selectable / ${total} audit rows; skipped ${skipped.length}; duplicate keys ${duplicateKeys.length}`)
    return
  }
  const audit = readJson(auditPath)
  console.log(`parsed rows: ${audit.parsed_rows}`)
  console.log(JSON.stringify(audit.status_counts, null, 2))
}

switch (command) {
  case 'plan': await plan(); break
  case 'apply': await apply(); break
  case 'rollback': await rollback(); break
  case 'status': await status(); break
  case 'summary': await summary(); break
  case 'help': usage(0); break
  default: usage(1)
}
