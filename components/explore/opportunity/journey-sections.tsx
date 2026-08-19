import { Clock3 } from 'lucide-react'
import { NigeriaOutline } from '@/components/explore/visuals/scene-art'
import { VisualBox } from '@/components/explore/visuals/visual-box'
import { SceneCard } from '@/components/explore/opportunity/visual-card'
import { BasisTag, OutlookBadge } from '@/components/explore/opportunity/badges'
import type { CareerDetail } from '@/lib/explore/types'
import type { CareerOpportunity } from '@/lib/explore/opportunity'
import { sectorNames } from '@/lib/explore/opportunity'
import type { AccentKey } from '@/lib/explore/visual-scenes'
import type { CareerVisuals } from '@/lib/explore/visuals'
import { ACCENT_STYLES } from '@/lib/explore/visual-scenes'

interface SectionProps {
  career: CareerDetail
  opportunity: CareerOpportunity
  accent: AccentKey
  visuals: CareerVisuals
}

export function SectorGallery({ career, opportunity, accent, visuals }: SectionProps) {
  const names = sectorNames(opportunity.sectors)
  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${ACCENT_STYLES[accent].deep}`}>
          Where is it needed?
        </p>
        <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          The sectors calling for {career.name}s
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">
          These are the parts of the Nigerian economy where this career shows up most. Scroll sideways — each card is
          a scene from a typical workplace.
        </p>
      </div>
      <div className="mt-10 overflow-x-auto px-4 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto flex max-w-6xl snap-x snap-mandatory gap-4">
          {opportunity.sectors.map((sector, index) => (
            <SceneCard
              key={sector}
              accent={accent}
              visual={visuals.sectors[sector]}
              className="w-64 shrink-0 snap-start sm:w-72"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Sector {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-1 text-base font-bold text-slate-900">{names[index] ?? sector}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Work here touches products, people and infrastructure daily — the practical stage of this career.
              </p>
            </SceneCard>
          ))}
        </div>
      </div>
    </section>
  )
}

export function NigeriaSection({ opportunity, accent }: SectionProps) {
  return (
    <section className="bg-gradient-to-b from-white to-slate-50 py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10">
              <NigeriaOutline className="mx-auto w-64 max-w-full sm:w-80" />
              <p className="mt-4 text-center text-xs text-slate-400">Illustrative shape, not to scale</p>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${ACCENT_STYLES[accent].deep}`}>
              The Nigerian reality
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Why it matters in Nigeria
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-700">{opportunity.nigerianReality}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function horizonPoints(horizon: string): string[] {
  const [start, end] = horizon.split(' to ')
  if (start === undefined) return ['Today', horizon]
  if (end === undefined) return ['Today', start]
  return ['Today', start, end]
}

export function ForecastSection({ opportunity, accent }: SectionProps) {
  const points = horizonPoints(opportunity.outlook.horizon)
  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${ACCENT_STYLES[accent].deep}`}>
            Where is it heading?
          </p>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
            {opportunity.outlook.horizon}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <OutlookBadge level={opportunity.outlook.level} />
          <BasisTag basis={opportunity.outlook.basis} />
        </div>
        <h2 className="mt-4 max-w-3xl font-serif text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Why demand is moving this way
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">{opportunity.outlook.summary}</p>

        {opportunity.outlook.drivers && opportunity.outlook.drivers.length > 0 ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {opportunity.outlook.drivers.map((driver) => (
              <div
                key={driver.label}
                className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                {driver.scene ? (
                  <div className={`w-24 shrink-0 overflow-hidden rounded-xl ${ACCENT_STYLES[accent].soft}`}>
                    <VisualBox
                      visual={{ kind: 'scene', scene: driver.scene, alt: `Illustration for ${driver.label}` }}
                      className="aspect-[4/3] w-full"
                      decorative
                    />
                  </div>
                ) : null}
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{driver.label}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{driver.note}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h3 className="text-sm font-bold text-slate-900">How the demand horizon stretches</h3>
          <div className="relative mt-8">
            <div className="absolute left-[16.666%] right-[16.666%] top-5 h-0.5 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-400" aria-hidden />
            <ol className="relative grid grid-cols-3 gap-4">
              {points.map((point, index) => (
                <li key={point} className="flex flex-col items-center gap-2 text-center">
                  <span
                    className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-[10px] font-bold ${
                      index === 0 ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200'
                    }`}
                  >
                    {index === 0 ? 'Now' : point}
                  </span>
                  <span className="text-sm font-semibold text-slate-900">{point}</span>
                  <span className="text-xs text-slate-500">
                    {index === 0 ? 'Baseline' : index === points.length - 1 ? 'Horizon' : 'Midpoint'}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}

export function DayInCareerSection({ opportunity, accent }: SectionProps) {
  const day = opportunity.dayInCareer
  if (!day || day.length === 0) return null
  return (
    <section className="bg-slate-50 py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${ACCENT_STYLES[accent].icon}`}>
            <Clock3 className="h-4 w-4" aria-hidden />
          </span>
          <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${ACCENT_STYLES[accent].deep}`}>
            A day in the life
          </p>
        </div>
        <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          From morning to evening
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">
          A representative day for someone working in this field in Nigeria. Hours and rhythm vary by employer, but
          the shape below is typical.
        </p>
        <ol className="relative mt-10 space-y-8 border-l-2 border-slate-200 pl-6 sm:pl-8">
          {day.map((step) => (
            <li key={step.time} className="relative">
              <span
                className={`absolute -left-[35px] top-1.5 h-4 w-4 rounded-full ring-4 ring-slate-50 ${ACCENT_STYLES[accent].solid}`}
                aria-hidden
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <span className="w-16 shrink-0 font-mono text-sm font-bold text-slate-900">{step.time}</span>
                {step.scene ? (
                  <div className={`hidden w-40 shrink-0 overflow-hidden rounded-xl sm:block ${ACCENT_STYLES[accent].soft}`}>
                    <VisualBox
                      visual={{ kind: 'scene', scene: step.scene, alt: `Illustration for ${step.activity}` }}
                      className="aspect-[4/3] w-full"
                      decorative
                    />
                  </div>
                ) : null}
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{step.activity}</h3>
                  <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600">{step.detail}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}