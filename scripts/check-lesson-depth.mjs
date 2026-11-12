// Checks curriculum JSON against the two-tier lesson standard.
//
// Core (everything outside `Go deeper:` headings) must be 500–700 words.
// Depth must be 600–900 words when present, in at least two sections.
// Teach cards are checked for the one-concept shape: max three cards,
// 120–180 words each, a one-line takeaway and an inline check. Those shape
// issues stay warnings until the existing lessons are upgraded.
// Also checks required blocks and the depth heading convention.
//
// Usage:
//   node scripts/check-lesson-depth.mjs [file.json ...]
// With no arguments, checks every content-folder/*-curriculum.json.
//
// Exit code 1 means at least one error; warnings do not fail the run.

import { readdirSync, readFileSync } from 'node:fs'
import { basename, join } from 'node:path'

const CORE_MIN = 500
const CORE_MAX = 700
const DEPTH_MIN = 600
const DEPTH_MAX = 900
const DEPTH_PREFIX = /^go deeper\s*:\s*/i
const NEAR_DEPTH = /^go\s*deeper\b/i

// Figures are capped so they still read on a 360px phone: a chain longer than
// seven stops or a contrast with more than four rows is a lesson-shaped hole,
// not a bigger diagram.
const MAX_FLOW_STEPS = 7
const MAX_COMPARE_ROWS = 4

function words(text) {
  return String(text ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
}

function visualIssues(visual, label) {
  if (!visual || typeof visual !== 'object') return [`"${label}" visual is not an object`]
  const issues = []
  const caption = String(visual.caption ?? '').trim()
  if (!caption) {
    issues.push(`"${label}" visual has no caption`)
  } else if (words(caption) > 30) {
    issues.push(`"${label}" visual caption is ${words(caption)} words (keep it under 30)`)
  }

  if (visual.kind === 'flow') {
    const steps = Array.isArray(visual.steps) ? visual.steps : []
    if (steps.length < 2 || steps.length > MAX_FLOW_STEPS) {
      issues.push(`"${label}" flow has ${steps.length} steps (need 2–${MAX_FLOW_STEPS})`)
    }
    const labels = steps.map((step) =>
      String(typeof step === 'string' ? step : (step?.label ?? '')).trim(),
    )
    if (labels.some((text) => !text)) issues.push(`"${label}" flow has an unlabelled step`)
    if (new Set(labels).size !== labels.length) {
      issues.push(`"${label}" flow repeats a step label`)
    }
    labels.forEach((text) => {
      if (words(text) > 6) issues.push(`"${label}" flow step "${text}" is too long for a node`)
    })
    return issues
  }

  if (visual.kind === 'compare') {
    const columns = Array.isArray(visual.columns) ? visual.columns : []
    if (columns.length !== 2 || columns.some((c) => !String(c ?? '').trim())) {
      issues.push(`"${label}" compare needs exactly two column headings`)
    }
    const rows = Array.isArray(visual.rows) ? visual.rows : []
    if (rows.length < 1 || rows.length > MAX_COMPARE_ROWS) {
      issues.push(`"${label}" compare has ${rows.length} rows (need 1–${MAX_COMPARE_ROWS})`)
    }
    rows.forEach((row, i) => {
      for (const field of ['feature', 'left', 'right']) {
        if (!String(row?.[field] ?? '').trim()) {
          issues.push(`"${label}" compare row ${i + 1} has no ${field}`)
        } else if (words(row[field]) > 15) {
          issues.push(`"${label}" compare row ${i + 1} ${field} is over 15 words`)
        }
      }
    })
    return issues
  }

  if (visual.kind === 'chart') {
    const xLabel = String(visual.xLabel ?? '').trim()
    const yLabel = String(visual.yLabel ?? '').trim()
    if (!xLabel) issues.push(`"${label}" chart has no x label`)
    if (!yLabel) issues.push(`"${label}" chart has no y label`)
    if (words(xLabel) > 6) issues.push(`"${label}" chart x label is ${words(xLabel)} words (keep it under 6)`)
    if (words(yLabel) > 6) issues.push(`"${label}" chart y label is ${words(yLabel)} words (keep it under 6)`)
    const series = Array.isArray(visual.series) ? visual.series : []
    if (series.length < 1) {
      issues.push(`"${label}" chart has no series`)
      return issues
    }
    if (series.length > 3) {
      issues.push(`"${label}" chart has ${series.length} series (max 3)`)
    }
    series.forEach((s, i) => {
      const pts = Array.isArray(s?.points) ? s.points : []
      if (pts.length < 2) {
        issues.push(`"${label}" chart series ${i + 1} has ${pts.length} points (need at least 2)`)
      } else if (pts.length > 64) {
        issues.push(`"${label}" chart series ${i + 1} has ${pts.length} points (max 64)`)
      }
      for (const p of pts) {
        if (!Array.isArray(p) || p.length < 2 || !Number.isFinite(Number(p[0])) || !Number.isFinite(Number(p[1]))) {
          issues.push(`"${label}" chart series ${i + 1} has a non-numeric point`)
          break
        }
      }
    })
    return issues
  }

  issues.push(`"${label}" visual kind "${visual.kind}" is not supported`)
  return issues
}

function blockWords(block) {
  const c = block.content ?? {}
  if (block.type === 'text') {
    return (
      words(c.heading) +
      (c.paragraphs ?? []).reduce((n, p) => n + words(p), 0) +
      (c.bullets ?? []).reduce((n, b) => n + words(b), 0) +
      words(c.takeaway)
    )
  }
  if (block.type === 'callout') return words(c.title) + words(c.body)
  if (block.type === 'worked_example') {
    return (
      words(c.problem) +
      (c.steps ?? []).reduce(
        (n, s) => n + words(s.operation) + words(s.reason) + words(s.result),
        0,
      )
    )
  }
  return 0
}

function isDepth(block) {
  return DEPTH_PREFIX.test(String(block.content?.heading ?? '').trim())
}

function checkLesson(lesson, file) {
  const errors = []
  const warnings = []
  const blocks = lesson.blocks ?? []
  const texts = blocks.filter((b) => b.type === 'text')
  const depthBlocks = texts.filter(isDepth)
  const coreBlocks = blocks.filter((b) => !isDepth(b))

  const coreTexts = coreBlocks.filter((b) => b.type === 'text')
  const coreWords = coreBlocks.reduce((n, b) => n + blockWords(b), 0)
  const depthWords = depthBlocks.reduce((n, b) => n + blockWords(b), 0)

  if (coreWords < CORE_MIN || coreWords > CORE_MAX) {
    errors.push(`core ${coreWords} words (need ${CORE_MIN}–${CORE_MAX})`)
  }
  if (depthBlocks.length > 0 && depthBlocks.length < 2) {
    errors.push(`depth has ${depthBlocks.length} section (need at least 2)`)
  }
  if (depthWords > 0 && (depthWords < DEPTH_MIN || depthWords > DEPTH_MAX)) {
    errors.push(`depth ${depthWords} words (need ${DEPTH_MIN}–${DEPTH_MAX})`)
  }

  for (const block of texts) {
    const heading = String(block.content?.heading ?? '').trim()
    if (NEAR_DEPTH.test(heading) && !DEPTH_PREFIX.test(heading)) {
      errors.push(`depth heading must be "Go deeper: …": "${heading}"`)
    }
    if (!heading) warnings.push('text block with an empty heading (treated as intro)')
  }

  const headings = texts
    .map((b) => String(b.content?.heading ?? '').trim().toLowerCase())
    .filter(Boolean)
  const seen = new Set()
  for (const h of headings) {
    if (seen.has(h)) errors.push(`duplicate heading "${h}"`)
    seen.add(h)
  }

  if (coreBlocks.filter((b) => b.type === 'text').length < 3) {
    warnings.push('core has fewer than 3 teaching sections')
  }

  // The first text block is the summary; the rest are teach cards.
  const sectionBlocks = coreTexts.slice(1)
  if (sectionBlocks.length > 3) {
    warnings.push(`${sectionBlocks.length} section cards (max 3) — split the lesson`)
  }
  sectionBlocks.forEach((block, i) => {
    const c = block.content ?? {}
    const label = String(c.heading ?? '').trim() || `section ${i + 1}`
    const w = blockWords(block)
    if (w < 120 || w > 180) {
      warnings.push(`"${label}" is ${w} words (need 120–180)`)
    }
    if (!String(c.takeaway ?? '').trim()) {
      warnings.push(`"${label}" has no takeaway`)
    } else if (words(c.takeaway) > 20) {
      warnings.push(`"${label}" takeaway is ${words(c.takeaway)} words (keep it under 20)`)
    }
    if (c.visual) warnings.push(...visualIssues(c.visual, label))
    const check = c.check
    if (!check || typeof check !== 'object') {
      warnings.push(`"${label}" has no inline check`)
      return
    }
    const options = Array.isArray(check.options) ? check.options : []
    if (!String(check.question ?? '').trim()) warnings.push(`"${label}" check has no question`)
    if (options.length < 2) warnings.push(`"${label}" check needs at least two options`)
    if (
      typeof check.answer !== 'number' ||
      check.answer < 0 ||
      check.answer >= options.length
    ) {
      warnings.push(`"${label}" check answer must be a valid option index`)
    }
    if (!String(check.why ?? '').trim()) warnings.push(`"${label}" check has no why`)
  })

  for (const type of ['worked_example', 'guided_question']) {
    if (!blocks.some((b) => b.type === type)) errors.push(`missing ${type}`)
  }
  if (!blocks.some((b) => b.type === 'callout')) warnings.push('no exam tip (callout)')

  return { errors, warnings, coreWords, depthWords, sections: coreTexts.length, depthSections: depthBlocks.length }
}

const args = process.argv.slice(2)
const files =
  args.length > 0
    ? args
    : readdirSync('content-folder')
        .filter((f) => f.endsWith('-curriculum.json'))
        .map((f) => join('content-folder', f))

let failures = 0
for (const file of files) {
  const source = JSON.parse(readFileSync(file, 'utf8'))
  const topics = new Set((source.topics ?? []).map((t) => t.slug))
  console.log(`\n${basename(file)} — ${(source.lessons ?? []).length} lessons`)
  for (const lesson of source.lessons ?? []) {
    const { errors, warnings, coreWords, depthWords, sections, depthSections } = checkLesson(lesson, file)
    const status = errors.length === 0 ? (warnings.length === 0 ? 'ok  ' : 'warn') : 'FAIL'
    console.log(
      `  ${status} ${String(coreWords).padStart(4)}w core` +
        (depthSections > 0 ? ` + ${String(depthWords).padStart(4)}w depth` : '') +
        ` / ${sections} sections — ${lesson.slug}`,
    )
    for (const e of errors) console.log(`       error: ${e}`)
    for (const w of warnings) console.log(`       warn:  ${w}`)
    if (topics.size > 0 && !topics.has(lesson.topic ?? lesson.slug)) console.log(`       warn:  no topic with this slug in ${basename(file)}`)
    if (errors.length > 0) failures += 1
  }
}

console.log(`\n${failures === 0 ? 'All lessons pass.' : `${failures} lesson(s) need work.`}`)
process.exit(failures === 0 ? 0 : 1)
