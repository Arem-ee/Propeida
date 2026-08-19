import type { ReactNode } from 'react'
import { Building2, ExternalLink, Info, Landmark } from 'lucide-react'
import type { CareerOpportunity } from '@/lib/explore/opportunity'
import {
  BASIS_LABELS,
  OUTLOOK_LABELS,
  employerTypeNames,
  sectorNames,
} from '@/lib/explore/opportunity'
import { DemandBadge, OutlookBadge, BasisTag } from './badges'

export function SectionCard({
  icon,
  title,
  aside,
  children,
}: {
  icon: ReactNode
  title: string
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-gray-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            {icon}
          </span>
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  )
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-sm font-semibold text-gray-700">
      {children}
    </span>
  )
}

export function SnapshotStrip({ opportunity }: { opportunity: CareerOpportunity }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <DemandBadge level={opportunity.demand.level} />
      <OutlookBadge level={opportunity.outlook.level} />
      <span className="text-xs font-medium text-gray-400">
        Last reviewed {formatDate(opportunity.lastReviewed)}
      </span>
    </div>
  )
}

export function formatDate(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function DemandSection({ opportunity }: { opportunity: CareerOpportunity }) {
  const { demand } = opportunity
  return (
    <SectionCard
      icon={<Info className="h-5 w-5" />}
      title="How much is this career in demand?"
      aside={<DemandBadge level={demand.level} />}
    >
      <p className="text-sm leading-relaxed text-gray-600">{demand.summary}</p>
      <p className="mt-3 text-xs italic leading-relaxed text-gray-400">{demand.evidenceNote}</p>
    </SectionCard>
  )
}

export function OutlookSection({ opportunity }: { opportunity: CareerOpportunity }) {
  const { outlook } = opportunity
  return (
    <SectionCard
      icon={<Info className="h-5 w-5" />}
      title={`${outlook.horizon}: where is this heading?`}
      aside={
        <div className="flex flex-wrap items-center gap-2">
          <OutlookBadge level={outlook.level} />
          <BasisTag basis={outlook.basis} />
        </div>
      }
    >
      <p className="text-sm leading-relaxed text-gray-600">{outlook.summary}</p>
      <p className="mt-3 text-xs italic leading-relaxed text-gray-400">
        This outlook is a {BASIS_LABELS[outlook.basis].toLowerCase()} assessment, not a guarantee.
        Labels: {Object.values(OUTLOOK_LABELS).join(', ')}.
      </p>
    </SectionCard>
  )
}

export function SectorsSection({ opportunity }: { opportunity: CareerOpportunity }) {
  const names = sectorNames(opportunity.sectors)
  if (names.length === 0) return null
  return (
    <SectionCard
      icon={<Building2 className="h-5 w-5" />}
      title="Where is this career needed in Nigeria?"
    >
      <div className="flex flex-wrap gap-2">
        {names.map((name) => (
          <Chip key={name}>{name}</Chip>
        ))}
      </div>
    </SectionCard>
  )
}

export function EmployersSection({ opportunity }: { opportunity: CareerOpportunity }) {
  const names = employerTypeNames(opportunity.employerTypes)
  if (names.length === 0) return null
  return (
    <SectionCard
      icon={<Landmark className="h-5 w-5" />}
      title="Who needs these skills?"
    >
      <div className="flex flex-wrap gap-2">
        {names.map((name) => (
          <Chip key={name}>{name}</Chip>
        ))}
      </div>
    </SectionCard>
  )
}

export function RealitySection({ opportunity }: { opportunity: CareerOpportunity }) {
  if (!opportunity.nigerianReality) return null
  return (
    <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm sm:p-8">
      <h2 className="mb-4 flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-amber-900">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
          <Info className="h-5 w-5" />
        </span>
        The Nigerian reality
      </h2>
      <p className="text-sm leading-relaxed text-amber-900/80">{opportunity.nigerianReality}</p>
    </section>
  )
}

export function InternationalSection({ opportunity }: { opportunity: CareerOpportunity }) {
  const { internationalTransferability } = opportunity
  if (!internationalTransferability.intro && internationalTransferability.destinations.length === 0) {
    return null
  }
  return (
    <SectionCard
      icon={<ExternalLink className="h-5 w-5" />}
      title="Where else can this take you?"
    >
      <p className="mb-4 text-sm leading-relaxed text-gray-600">
        {internationalTransferability.intro}
      </p>
      <ul className="space-y-3">
        {internationalTransferability.destinations.map((d) => (
          <li key={d.country} className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
            <p className="text-sm font-bold text-gray-900">{d.country}</p>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">{d.note}</p>
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}

export function EvidenceSection({ opportunity }: { opportunity: CareerOpportunity }) {
  if (opportunity.evidence.length === 0) return null
  return (
    <SectionCard icon={<Info className="h-5 w-5" />} title="Where this information comes from">
      <ul className="space-y-3">
        {opportunity.evidence.map((entry, i) => (
          <li key={i} className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
            <p className="text-sm font-bold text-gray-900">{entry.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">{entry.claim}</p>
            <p className="mt-2 text-xs font-medium text-gray-400">
              {entry.source}
              {entry.accessedAt ? ` - accessed ${formatDate(entry.accessedAt)}` : ''}
              {entry.url ? (
                <a
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline"
                >
                  View source <ExternalLink className="h-3 w-3" />
                </a>
              ) : null}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs italic leading-relaxed text-gray-400">
        V1 data is curated by the Propeida editorial team and is clearly marked as such.
        It will be replaced with cited sources as evidence is collected.
      </p>
    </SectionCard>
  )
}