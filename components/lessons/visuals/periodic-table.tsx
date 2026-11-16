import PeriodicTable from '@/components/chemistry/periodic-table'

interface PeriodicVisualData {
  kind: 'periodic-table'
  caption?: string
  initialFocus?: 'first-20' | 'all'
  highlight?: string[]
}

export default function PeriodicTableVisual({ visual }: { visual: unknown }) {
  if (!visual || typeof visual !== 'object') return null
  const v = visual as PeriodicVisualData

  return (
    <div className="my-5">
      <PeriodicTable
        initialFocus={v.initialFocus ?? 'first-20'}
        highlightElements={v.highlight ?? []}
        caption={v.caption}
      />
    </div>
  )
}
