import { NumberLine, FractionBars, AlgebraBalance, CoordinatePlane } from '@/components/maths/diagrams'

export interface StepVisual {
  kind: 'number-line' | 'fraction-bars' | 'balance' | 'plane'
  props: Record<string, unknown>
}

const num = (v: unknown, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : fallback

const str = (v: unknown): string => (typeof v === 'string' ? v : '')

type Parsed =
  | { kind: 'number-line'; min: number; max: number; step: number; points: { value: number; label: string; color?: string }[] }
  | { kind: 'fraction-bars'; fractions: { numerator: number; denominator: number; color?: string; label?: string }[] }
  | { kind: 'balance'; left: string[]; right: string[]; tilt: number }
  | { kind: 'plane'; points: { x: number; y: number; label?: string; color?: string }[]; range: number }
  | null

/**
 * Pure validation: malformed content becomes null here, in plain code.
 * Rendering below never throws, so no error boundary is needed.
 */
function parseVisual(visual: StepVisual | null | undefined): Parsed {
  if (!visual || typeof visual !== 'object') return null
  try {
    switch (visual.kind) {
      case 'number-line': {
        const p = visual.props ?? {}
        const min = num(p.min, 0)
        const max = num(p.max, 10)
        const rawPoints = Array.isArray(p.points) ? p.points : []
        if (max <= min || rawPoints.length === 0) return null
        return {
          kind: 'number-line',
          min,
          max,
          step: num(p.step, 1) || 1,
          points: rawPoints.map((pt) => {
            const o = pt as Record<string, unknown>
            return {
              value: num(o.value, min),
              label: str(o.label),
              color: typeof o.color === 'string' ? o.color : undefined,
            }
          }),
        }
      }
      case 'fraction-bars': {
        const raw = (visual.props ?? {}).fractions
        if (!Array.isArray(raw) || raw.length === 0) return null
        return {
          kind: 'fraction-bars',
          fractions: raw.map((f) => {
            const o = f as Record<string, unknown>
            return {
              numerator: Math.max(0, Math.floor(num(o.numerator, 0))),
              denominator: Math.max(1, Math.floor(num(o.denominator, 1))),
              color: typeof o.color === 'string' ? o.color : undefined,
              label: typeof o.label === 'string' ? o.label : undefined,
            }
          }),
        }
      }
      case 'balance': {
        const p = visual.props ?? {}
        if (!Array.isArray(p.left) || !Array.isArray(p.right)) return null
        return {
          kind: 'balance',
          left: (p.left as unknown[]).map(String),
          right: (p.right as unknown[]).map(String),
          tilt: typeof p.tilt === 'number' ? p.tilt : 0,
        }
      }
      case 'plane': {
        const raw = (visual.props ?? {}).points
        if (!Array.isArray(raw) || raw.length === 0) return null
        return {
          kind: 'plane',
          range: num((visual.props ?? {}).range, 5) || 5,
          points: raw.map((pt) => {
            const o = pt as Record<string, unknown>
            return {
              x: num(o.x, 0),
              y: num(o.y, 0),
              label: typeof o.label === 'string' ? o.label : undefined,
              color: typeof o.color === 'string' ? o.color : undefined,
            }
          }),
        }
      }
      default:
        return null
    }
  } catch {
    return null
  }
}

/**
 * Renders a worked-step visual. Malformed content degrades to nothing —
 * a broken diagram must never crash a lesson.
 */
export default function StepVisual({ visual }: { visual: StepVisual | null | undefined }) {
  const parsed = parseVisual(visual)
  if (!parsed) return null

  return (
    <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50/40 p-3">
      {parsed.kind === 'number-line' && (
        <NumberLine min={parsed.min} max={parsed.max} step={parsed.step} points={parsed.points} />
      )}
      {parsed.kind === 'fraction-bars' && <FractionBars fractions={parsed.fractions} />}
      {parsed.kind === 'balance' && (
        <AlgebraBalance left={parsed.left} right={parsed.right} tilt={parsed.tilt} />
      )}
      {parsed.kind === 'plane' && <CoordinatePlane points={parsed.points} range={parsed.range} />}
    </div>
  )
}
