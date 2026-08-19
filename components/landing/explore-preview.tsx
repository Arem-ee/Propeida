import Link from 'next/link'
import { ArrowRight, Building2, Flag, TrendingUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SceneArt } from '@/components/explore/visuals/scene-art'
import {
  getCareerOpportunity,
  demandLabel,
  firstSentence,
  sectorNames,
} from '@/lib/explore/opportunity'
import type { SceneKey } from '@/lib/explore/visual-scenes'
import { DEFAULT_SCENE, SECTOR_SCENES } from '@/lib/explore/visual-scenes'

type PreviewType = 'sectors' | 'demand' | 'reality'

interface PreviewCard {
  type: PreviewType
  label: string
  headline: string
  body: string
  ctaLabel: string
  scene: SceneKey
}

const TYPE_STYLES: Record<PreviewType, { pill: string; icon: string; gradient: string }> = {
  sectors: { pill: 'bg-teal-50 text-teal-700', icon: 'bg-teal-100', gradient: 'from-teal-50 to-white' },
  demand: { pill: 'bg-emerald-50 text-emerald-700', icon: 'bg-emerald-100', gradient: 'from-emerald-50 to-white' },
  reality: { pill: 'bg-rose-50 text-rose-700', icon: 'bg-rose-100', gradient: 'from-rose-50 to-white' },
}

const TYPE_ICONS: Record<PreviewType, LucideIcon> = {
  sectors: Building2,
  demand: TrendingUp,
  reality: Flag,
}

export default function LandingExplorePreview() {
  const career = getCareerOpportunity('software-engineer')!
  const href = '/explore/careers/software-engineer'
  const sectors = sectorNames(career.sectors).slice(0, 4)
  const sectorScene = SECTOR_SCENES[career.sectors[0] ?? ''] ?? DEFAULT_SCENE

  const cards: PreviewCard[] = [
    {
      type: 'sectors',
      label: 'Where it is needed',
      headline: 'Where are Software Engineers actually needed in Nigeria?',
      body: `${sectors.join(', ')} and more. Software skills spread across more sectors than most students expect.`,
      ctaLabel: 'See the opportunities',
      scene: sectorScene,
    },
    {
      type: 'demand',
      label: 'Demand check',
      headline: 'Is Software Engineering still worth studying in 2026?',
      body: `${demandLabel(career.demand.level)}. ${firstSentence(career.demand.summary)}`,
      ctaLabel: 'See the Nigerian outlook',
      scene: career.outlook.drivers?.[0]?.scene ?? DEFAULT_SCENE,
    },
    {
      type: 'reality',
      label: 'The Nigerian reality',
      headline: 'The Nigerian reality of studying Software Engineering',
      body: firstSentence(career.nigerianReality),
      ctaLabel: 'See what actually makes candidates employable',
      scene: career.dayInCareer?.[3]?.scene ?? DEFAULT_SCENE,
    },
  ]

  return (
    <section className="border-t border-gray-100 bg-white py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">Explore</p>
        <h2 className="mt-4 font-serif text-[30px] font-medium leading-tight text-gray-900 sm:text-[36px]">
          You don&apos;t know what you don&apos;t know.
        </h2>
        <p className="mt-4 max-w-xl text-[14.5px] leading-[1.9] text-gray-600">
          Your future has more options than anyone told you about. Here&apos;s a preview of the feed Propeida
          builds for you.
        </p>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const style = TYPE_STYLES[card.type]
            const Icon = TYPE_ICONS[card.type]
            return (
              <article
                key={card.type}
                className={`flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-b ${style.gradient} shadow-sm`}
              >
                <Link
                  href={href}
                  aria-label={`${card.headline} — ${card.ctaLabel}`}
                  className="flex flex-col gap-3 p-5 pb-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide ${style.pill}`}
                    >
                      {card.label}
                    </span>
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${style.icon}`}
                      aria-hidden="true"
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold leading-snug tracking-tight text-gray-900">
                    {card.headline}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600">{card.body}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600">
                    {card.ctaLabel}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
                <div className="px-5 pb-2">
                  <SceneArt scene={card.scene} className="h-28 w-full" label={`${card.label} illustration`} />
                </div>
              </article>
            )
          })}
        </div>

        <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Link
            href="/explore"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-blue-600 px-5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            See your own feed
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/explore/careers"
            className="inline-flex min-h-[44px] items-center text-sm font-bold text-blue-600 transition-colors hover:text-blue-700"
          >
            All careers
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}