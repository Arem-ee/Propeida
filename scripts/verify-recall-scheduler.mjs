// Scheduler unit checks: compile lib/recall-scheduler.ts in-memory and assert invariants.
import { readFileSync } from 'fs'
import ts from 'typescript'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const src = readFileSync('lib/recall-scheduler.ts', 'utf8')
const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
const module = { exports: {} }
new Function('module', 'exports', js)(module, module.exports)
const { RECALL_CONFIG, retrievability, intervalDays, applyReview, initialState } = module.exports

let failures = 0
function check(label, condition) {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${label}`)
  if (!condition) failures++
}

check('R(0) = 1', Math.abs(retrievability(5, 0) - 1) < 1e-9)
check('R(S) = 0.9', Math.abs(retrievability(5, 5) - 0.9) < 1e-9)
check('R decays with time', retrievability(5, 10) < retrievability(5, 5))
check('interval(S) grows with stability', intervalDays(10) > intervalDays(2))
check('interval >= 1 day', intervalDays(0.4) >= 1)
check('interval capped at 30', intervalDays(1000) === RECALL_CONFIG.maxIntervalDays)

const base = new Date('2026-01-01T00:00:00Z').toISOString()
const now = new Date('2026-01-11T00:00:00Z') // 10 days later, R ~0.64 for S=5
const state = { stability: 5, difficulty: 5, reps: 2, lapses: 0, lastReviewAt: base }
const good = applyReview(state, 3, now)
check('success raises stability', good.stability > state.stability)
check('success never lowers difficulty below 1', good.difficulty >= 1)
check('success increments reps', good.reps === 3)
check('lapse does not increment reps', applyReview(state, 1, now).reps === 3)
const lapse = applyReview(state, 1, now)
check('lapse lowers or holds stability', lapse.stability <= state.stability)
check('lapse raises difficulty', lapse.stifficulty === undefined && lapse.difficulty > state.difficulty)
check('lapse increments lapses', lapse.lapses === 1)
check('due date in the future', new Date(good.nextDueAt).getTime() > now.getTime())
const firstAgain = initialState(1, now)
check('initial Again stability is the smallest ladder value', firstAgain.stability === RECALL_CONFIG.initialStability[0])
const firstEasy = initialState(4, now)
check('initial Easy stability is the largest ladder value', firstEasy.stability === RECALL_CONFIG.initialStability[3])
check('easy grows stability more than good at the same R', applyReview(state, 4, now).stability > good.stability)

console.log(failures === 0 ? '\nAll scheduler checks passed.' : `\n${failures} checks FAILED.`)
process.exit(failures === 0 ? 0 : 1)
