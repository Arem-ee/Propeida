import type { LessonVisual } from './index'

const MAX_FLOW_STEPS = 7
const MAX_COMPARE_ROWS = 4

const text = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : ''

/**
 * Validates a visual that came from a JSON block. Content is authored, not
 * trusted: a malformed figure degrades to nothing rather than breaking a
 * lesson. The checker fails authoring mistakes before they are seeded; this
 * only keeps a bad row from taking the player down.
 */
export function toLessonVisual(value: unknown): LessonVisual | null {
  if (!value || typeof value !== 'object') return null
  const v = value as Record<string, unknown>
  const caption = text(v.caption)
  if (!caption) return null

  if (v.kind === 'flow') {
    const raw = Array.isArray(v.steps) ? v.steps : []
    const steps = raw
      .map((step) => {
        if (typeof step === 'string') {
          const label = text(step)
          return label ? { label } : null
        }
        if (!step || typeof step !== 'object') return null
        const s = step as Record<string, unknown>
        const label = text(s.label)
        if (!label) return null
        const detail = text(s.detail)
        return detail ? { label, detail } : { label }
      })
      .filter((step): step is { label: string; detail?: string } => step !== null)
      .slice(0, MAX_FLOW_STEPS)
    if (steps.length < 2) return null
    return { kind: 'flow', caption, steps }
  }

  if (v.kind === 'compare') {
    const columns = Array.isArray(v.columns) ? v.columns.map(text) : []
    const [first, second] = columns
    if (columns.length !== 2 || !first || !second) return null
    const rows = (Array.isArray(v.rows) ? v.rows : [])
      .map((row) => {
        if (!row || typeof row !== 'object') return null
        const r = row as Record<string, unknown>
        const feature = text(r.feature)
        const left = text(r.left)
        const right = text(r.right)
        return feature && left && right ? { feature, left, right } : null
      })
      .filter(
        (row): row is { feature: string; left: string; right: string } => row !== null,
      )
      .slice(0, MAX_COMPARE_ROWS)
    if (rows.length < 1) return null
    return {
      kind: 'compare',
      caption,
      columns: [first, second],
      rows,
    }
  }

  return null
}

export const VISUAL_LIMITS = {
  maxFlowSteps: MAX_FLOW_STEPS,
  maxCompareRows: MAX_COMPARE_ROWS,
} as const
