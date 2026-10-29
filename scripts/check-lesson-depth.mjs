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

function words(text) {
  return String(text ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
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
