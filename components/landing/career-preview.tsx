import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SceneArt } from '@/components/explore/visuals/scene-art'
import {
  getCareerOpportunity,
  firstSentence,
} from '@/lib/explore/opportunity'
import { DemandBadge, OutlookBadge, BasisTag } from '@/components/explore/opportunity/badges'
import { careerAccent } from '@/lib/explore/visuals'
import { ACCENT_STYLES, CAREER_SCENES, DEFAULT_SCENE } from '@/lib/explore/visual-scenes'

const OTHERS = [
  { label: 'Lawyer', href: '/explore/careers/lawyer' },
  { label: 'Medical Doctor', href: '/explore/careers/medical-doctor' },
]

export default function LandingCareerPreview() {
  const career = getCareerOpportunity('software-engineer')!
  const accent = careerAccent('software-engineer', 'Technology')
  const accentStyles = ACCENT_STYLES[accent]
  const skills = career.employability.skills
    .filter((skill) => skill.importance === 'essential')
    .slice(0, 4)
    .map((skill) => skill.name)
  const paths = career.learningPath.specializations.slice(0, 4).map((path) => path.name)

  return (
    <section className="border-t border-gray-100 bg-gray-50/50 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">
          Career intelligence
        </p>
        <h2 className="mt-4 font-serif text-[30px] font-medium leading-tight text-gray-900 sm:text-[36px]">
          Don&apos;t just choose a course. Understand where it can take you.
        </h2>
        <p className="mt-4 max-w-xl text-[14.5px] leading-[1.9] text-gray-600">
          Every career on Propeida shows where it is needed, where it is heading, and how you get there.
        </p>

        <div className="mt-12 grid gap-8 rounded-2xl border border-gray-100 bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_12px_32px_-24px_rgba(15,23,42,0.10)] sm:p-9 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${accentStyles.chip} ring-transparent`}
              >
                Technology
              </span>
              <DemandBadge level={career.demand.level} />
              <OutlookBadge level={career.outlook.level} />
              <BasisTag basis={career.outlook.basis} />
            </div>

            <h3 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">Software Engineering</h3>
            <p className="mt-2 text-[14px] font-medium text-gray-500">
              Needed across {career.sectors.length} sectors in Nigeria, by {career.employerTypes.length} types
              of employers.
            </p>
            <p className="mt-4 max-w-xl text-[14px] leading-[1.85] text-gray-600">
              {firstSentence(career.outlook.summary)}
            </p>

            <div className="mt-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                Skills employers screen for
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[12px] font-medium text-gray-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                Possible paths
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {paths.map((path) => (
                  <span
                    key={path}
                    className={`rounded-lg px-2.5 py-1.5 text-[12px] font-semibold ${accentStyles.soft} ${accentStyles.deep}`}
                  >
                    {path}
                  </span>
                ))}
              </div>
            </div>

            <Link
              href="/explore/careers/software-engineer"
              className="mt-9 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 transition-colors hover:text-blue-700"
            >
              See what your future could look like
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="lg:col-span-5">
            <div
              className={`h-full overflow-hidden rounded-2xl bg-gradient-to-b ${accentStyles.gradient} ring-1 ${accentStyles.ring}`}
            >
              <SceneArt
                scene={CAREER_SCENES['software-engineer'] ?? DEFAULT_SCENE}
                className="h-64 w-full sm:h-72 lg:h-full lg:min-h-[320px]"
                label="Software Engineering illustration"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-2 text-[13.5px]">
          <span className="text-gray-400">Also exploring:</span>
          {OTHERS.map((other, index) => (
            <span key={other.href} className="flex items-center gap-2">
              <Link
                href={other.href}
                className="font-medium text-gray-600 transition-colors hover:text-blue-600"
              >
                {other.label}
              </Link>
              {index < OTHERS.length - 1 && <span className="text-gray-300">·</span>}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}