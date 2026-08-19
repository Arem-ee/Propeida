import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react'
import { getCareerBySlug } from '@/lib/explore/details'
import { getPublishedSlugs } from '@/lib/explore/data'
import { getCareerOpportunity, employerTypeNames } from '@/lib/explore/opportunity'
import { careerAccent, getCareerVisuals } from '@/lib/explore/visuals'
import { HeroSection } from '@/components/explore/opportunity/career-hero'
import {
  DayInCareerSection,
  ForecastSection,
  NigeriaSection,
  SectorGallery,
} from '@/components/explore/opportunity/journey-sections'
import {
  ProjectGallery,
  RealityCard,
} from '@/components/explore/opportunity/editorial-sections'
import { SkillMap } from '@/components/explore/opportunity/skill-map'
import { BranchMap } from '@/components/explore/opportunity/branch-map'
import { LearningJourney } from '@/components/explore/opportunity/learning-journey'
import { SectionShell, Transition } from '@/components/explore/opportunity/visual-card'
import {
  EmployersSection,
  EvidenceSection,
  InternationalSection,
  SectionCard,
  SnapshotStrip,
} from '@/components/explore/opportunity/sections'
import CareerActions from '@/components/explore/opportunity/career-actions'

export const revalidate = 300

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs('careers')
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const career = await getCareerBySlug(slug)
  if (!career) return { title: 'Career | Propeida' }
  return {
    title: `${career.name} Career Guide | Propeida`,
    description: career.short_description ?? `Explore the ${career.name} career path — what it involves, where it happens, and the courses that lead there.`,
  }
}

function ListBlock({
  title,
  items,
  icon,
}: {
  title: string
  items: string[]
  icon: React.ReactNode
}) {
  if (items.length === 0) return null
  return (
    <section className="mt-8">
      <div className="flex items-center gap-2">
        <span className="text-blue-600">{icon}</span>
        <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
      </div>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default async function CareerPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const career = await getCareerBySlug(slug)
  if (!career) notFound()

  const opportunity = getCareerOpportunity(career.slug)
  const accent = careerAccent(career.slug, career.category)
  const visuals = getCareerVisuals(career, opportunity ?? null, career.category, career.name)

  return (
    <div className="mx-auto pb-24 sm:pb-14">
      <HeroSection
        career={career}
        accent={accent}
        hero={visuals.hero}
        opportunity={opportunity ?? undefined}
      />

      {career.description && (
        <SectionShell accent={accent} kicker="What is this?" title={`${career.name} in plain words`}>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-2">
              <p className="whitespace-pre-line text-sm leading-7 text-slate-600">{career.description}</p>
            </div>
            {opportunity ? (
              <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h3 className="text-sm font-bold text-slate-900">The short version</h3>
                <div className="mt-4">
                  <SnapshotStrip opportunity={opportunity} />
                </div>
                <p className="mt-5 text-sm leading-relaxed text-slate-600">{opportunity.demand.summary}</p>
                <p className="mt-2 text-xs italic leading-relaxed text-slate-400">
                  {opportunity.demand.evidenceNote}
                </p>
                <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Sectors in Nigeria
                    </dt>
                    <dd className="mt-1 font-serif text-2xl font-semibold text-slate-900">
                      {opportunity.sectors.length}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Employer types
                    </dt>
                    <dd className="mt-1 font-serif text-2xl font-semibold text-slate-900">
                      {employerTypeNames(opportunity.employerTypes).length}
                    </dd>
                  </div>
                </dl>
              </aside>
            ) : null}
          </div>
        </SectionShell>
      )}

      {opportunity ? (
        <>
          <SectorGallery career={career} opportunity={opportunity} accent={accent} visuals={visuals} />
          <NigeriaSection career={career} opportunity={opportunity} accent={accent} visuals={visuals} />
          <ForecastSection career={career} opportunity={opportunity} accent={accent} visuals={visuals} />

          <Transition>But what does the work actually look like?</Transition>
          <DayInCareerSection career={career} opportunity={opportunity} accent={accent} visuals={visuals} />
          <RealityCard career={career} opportunity={opportunity} accent={accent} visuals={visuals} />

          <Transition>So what separates someone with the degree from someone employers actually want?</Transition>
          <SectionShell
            id="skills"
            accent={accent}
            kicker="What you'd need to know"
            title="Skills that employers actually screen for"
            intro="Four groups — from the must-haves every employer checks to the differentiators that separate you from the crowd."
            className="bg-slate-50"
          >
            <SkillMap opportunity={opportunity} accent={accent} />
          </SectionShell>

          <Transition>And you don't have to take the same path as everyone else.</Transition>
          <SectionShell
            id="branches"
            accent={accent}
            kicker="Branching out"
            title="One career, many directions"
            intro="Each branch is a chain of steps from foundation to focus. Tap one to see the roles and sectors it opens."
          >
            <BranchMap opportunity={opportunity} accent={accent} />
          </SectionShell>

          <SectionShell
            id="learning-journey"
            accent={accent}
            kicker="The learning journey"
            title="What should you learn first?"
            intro="Start with the first step — the rest of the journey unfolds from it. Tap a stage to see the concrete things to do."
            className="bg-slate-50"
          >
            <LearningJourney opportunity={opportunity} accent={accent} visuals={visuals} />
          </SectionShell>

          <Transition>Learning gets you ready — building gets you noticed.</Transition>
          <ProjectGallery career={career} opportunity={opportunity} accent={accent} visuals={visuals} />

          <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6">
            <EmployersSection opportunity={opportunity} />
            <InternationalSection opportunity={opportunity} />
            <EvidenceSection opportunity={opportunity} />
            {career.career_progression ? (
              <SectionCard icon={<CheckCircle2 className="h-5 w-5" />} title="Career pathway">
                <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                  {career.career_progression}
                </p>
              </SectionCard>
            ) : null}
          </div>
        </>
      ) : (
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {career.career_progression ? (
            <SectionCard icon={<CheckCircle2 className="h-5 w-5" />} title="Career pathway">
              <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                {career.career_progression}
              </p>
            </SectionCard>
          ) : null}
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <details className="group mt-10 list-none rounded-3xl border border-slate-200 bg-slate-50/50 p-6 [&::-webkit-details-marker]:hidden sm:p-8">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
            <h2 className="text-xl font-extrabold text-slate-900">Deeper info</h2>
            <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-4">
            <p className="text-sm text-slate-500">
              Everything below the surface — the full picture, if you want it.
            </p>
            <ListBlock
              title="What you would do"
              items={career.what_you_do}
              icon={<CheckCircle2 className="h-4 w-4" />}
            />
            <ListBlock
              title="Where you would work"
              items={career.work_environments}
              icon={<CheckCircle2 className="h-4 w-4" />}
            />
            <ListBlock
              title="Industries you could work in"
              items={career.industries}
              icon={<CheckCircle2 className="h-4 w-4" />}
            />
            <ListBlock
              title="Common job titles"
              items={career.common_job_titles}
              icon={<CheckCircle2 className="h-4 w-4" />}
            />
            <ListBlock
              title="Skills that help"
              items={career.skills}
              icon={<CheckCircle2 className="h-4 w-4" />}
            />

            {career.misconceptions.length > 0 && (
              <section className="mt-8">
                <h2 className="text-lg font-extrabold text-slate-900">Common misconceptions</h2>
                <ul className="mt-3 space-y-2">
                  {career.misconceptions.map((item) => (
                    <li
                      key={item}
                      className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </details>

        {career.relatedCareerItems.length > 0 && (
          <section className="mt-12">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              What else might you like?
            </p>
            <h2 className="mt-2 text-xl font-extrabold text-slate-900">If this interests you, explore:</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {career.relatedCareerItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/explore/careers/${item.slug}`}
                  className="inline-flex min-h-[40px] items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-600"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Courses that lead here</h2>
              <p className="mt-1 text-sm text-slate-500">
                {career.courses.length > 0
                  ? 'Start with one of these university courses.'
                  : 'Courses for this career are being added.'}
              </p>
            </div>
            <Link
              href="/explore/courses"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 min-h-[44px]"
            >
              All courses <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {career.courses.length > 0 ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {career.courses.map((course) => (
                <div key={course.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
                  <Link
                    href={`/explore/courses/${course.slug}`}
                    className="group flex items-start justify-between gap-3"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600">{course.name}</h3>
                      {course.description && (
                        <p className="mt-1 text-sm text-slate-500 line-clamp-2">{course.description}</p>
                      )}
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-500" />
                  </Link>
                  {course.universities.length > 0 && (
                    <div className="mt-3 border-t border-slate-100 pt-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Offered at
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {course.universities.map((university) => (
                          <Link
                            key={university.id}
                            href={`/explore/universities/${university.slug}`}
                            className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                          >
                            {university.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-8 text-center text-sm text-slate-500">
              No courses linked yet — we are mapping this career to its courses.
            </p>
          )}
        </section>

        <section className="mt-12 rounded-3xl bg-blue-600 px-6 py-8 text-center">
          <h2 className="text-xl font-extrabold text-white sm:text-2xl">
            Ready to aim for {career.name}?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-blue-100">
            Practice the exact subjects your dream course demands, and walk into the exam hall confident.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-50"
            >
              Start practicing free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/practice"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/30 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              Go to practice <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-5 text-sm text-blue-100">
            Not this one?{' '}
            <Link href="/explore/careers" className="font-bold text-white underline underline-offset-4 hover:text-blue-50">
              Explore more careers
            </Link>
          </p>
        </section>
      </div>

      <CareerActions variant="bar" entityId={career.id} entityName={career.name} />
    </div>
  )
}