import Link from 'next/link'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { VisualBox } from '@/components/explore/visuals/visual-box'
import CareerActions from '@/components/explore/opportunity/career-actions'
import { DemandBadge, OutlookBadge } from '@/components/explore/opportunity/badges'
import type { CareerDetail } from '@/lib/explore/types'
import type { CareerOpportunity } from '@/lib/explore/opportunity'
import { employerTypeNames } from '@/lib/explore/opportunity'
import type { AccentKey, ResolvedVisual } from '@/lib/explore/visual-scenes'
import { ACCENT_STYLES } from '@/lib/explore/visual-scenes'

interface HeroSectionProps {
  career: CareerDetail
  accent: AccentKey
  hero: ResolvedVisual
  opportunity?: CareerOpportunity | null
}

export function HeroSection({ career, accent, hero, opportunity }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-slate-950">
      <VisualBox
        visual={hero}
        className="absolute inset-0 h-full w-full"
        sizes="100vw"
        priority
        decorative
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/50 to-slate-950/85"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10">
        <nav className="flex flex-wrap items-center gap-1 text-xs text-slate-300" aria-label="Breadcrumb">
          <Link href="/explore" className="hover:text-white min-h-[32px] inline-flex items-center">
            Explore
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <Link href="/explore/careers" className="hover:text-white min-h-[32px] inline-flex items-center">
            Careers
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <span className="text-white">{career.name}</span>
        </nav>

        <div className="mt-10 max-w-3xl sm:mt-16">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold text-white ring-1 ring-white/30 ${ACCENT_STYLES[accent].solid}`}
            >
              {career.category}
            </span>
            {opportunity ? (
              <>
                <DemandBadge level={opportunity.demand.level} />
                <OutlookBadge level={opportunity.outlook.level} />
              </>
            ) : null}
          </div>
          <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {career.name}
          </h1>
          {career.short_description ? (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg">
              {career.short_description}
            </p>
          ) : null}
          {opportunity ? (
            <p className="mt-4 text-sm font-semibold text-white/85">
              Needed across {opportunity.sectors.length} sectors in Nigeria, by{' '}
              {employerTypeNames(opportunity.employerTypes).length} types of employers
            </p>
          ) : null}
          <div className="mt-8 hidden sm:block">
            <CareerActions entityId={career.id} entityName={career.name} />
          </div>
        </div>
      </div>

      <div
        className="relative flex justify-center pb-5"
        aria-hidden
      >
        <ChevronDown className="h-5 w-5 animate-bounce text-white/70" />
      </div>
    </section>
  )
}