import FlowVisual from './flow'
import CompareVisual from './compare'
import ChartVisual from './chart'

/**
 * Renders the visual attached to one section. Unknown or malformed figures
 * degrade to nothing: a lesson stays readable without its diagram.
 */
export default function LessonVisualBlock({ visual }: { visual: unknown }) {
  if (!visual || typeof visual !== 'object') return null
  const kind = (visual as { kind?: unknown }).kind
  if (kind === 'flow') return <FlowVisual visual={visual} />
  if (kind === 'compare') return <CompareVisual visual={visual} />
  if (kind === 'chart') return <ChartVisual visual={visual} />
  return null
}
