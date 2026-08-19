import type { DemandLevel, OutlookBasis, OutlookLevel } from '@/lib/explore/opportunity'
import {
  BASIS_LABELS,
  DEMAND_LABELS,
  OUTLOOK_LABELS,
} from '@/lib/explore/opportunity'

const DEMAND_STYLES: Record<DemandLevel, string> = {
  high: 'bg-orange-50 text-orange-700 ring-orange-200',
  growing: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  moderate: 'bg-sky-50 text-sky-700 ring-sky-200',
  competitive: 'bg-violet-50 text-violet-700 ring-violet-200',
  emerging: 'bg-teal-50 text-teal-700 ring-teal-200',
  limited: 'bg-amber-50 text-amber-700 ring-amber-200',
  uncertain: 'bg-gray-50 text-gray-600 ring-gray-200',
}

const OUTLOOK_STYLES: Record<OutlookLevel, string> = {
  growing: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  stable: 'bg-sky-50 text-sky-700 ring-sky-200',
  emerging: 'bg-teal-50 text-teal-700 ring-teal-200',
  competitive: 'bg-violet-50 text-violet-700 ring-violet-200',
  declining: 'bg-amber-50 text-amber-700 ring-amber-200',
  uncertain: 'bg-gray-50 text-gray-600 ring-gray-200',
}

const BASIS_STYLES: Record<OutlookBasis, string> = {
  evidence: 'bg-blue-50 text-blue-700 ring-blue-200',
  trend: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  projection: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  interpretation: 'bg-gray-50 text-gray-600 ring-gray-200',
}

export function DemandBadge({ level }: { level: DemandLevel }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${DEMAND_STYLES[level]}`}
    >
      {DEMAND_LABELS[level]} demand
    </span>
  )
}

export function OutlookBadge({ level }: { level: OutlookLevel }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${OUTLOOK_STYLES[level]}`}
    >
      {OUTLOOK_LABELS[level]} outlook
    </span>
  )
}

export function BasisTag({ basis }: { basis: OutlookBasis }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${BASIS_STYLES[basis]}`}
      title="How this assessment was reached: cited evidence, an observed trend, an industry projection, or Propeida's editorial interpretation."
    >
      {BASIS_LABELS[basis]}
    </span>
  )
}