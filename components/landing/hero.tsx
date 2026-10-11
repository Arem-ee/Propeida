import { Fragment } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { SceneArt } from '@/components/illustrations/scene-art'
import type { SceneKey } from '@/lib/illustrations/scene-art'

const JOURNEY = [
  { label: 'Student', scene: 'seedling' as SceneKey },
  { label: 'Exam', scene: 'education' as SceneKey },
  { label: 'University', scene: 'research' as SceneKey },
  { label: 'Skills', scene: 'tools' as SceneKey },
  { label: 'Career', scene: 'briefcase' as SceneKey },
]

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="mx-auto max-w-6xl px-5 pb-12 pt-14 sm:px-8 sm:pb-16 sm:pt-20 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <h1 className="text-[40px] font-medium leading-[1.06] tracking-tight text-gray-900 sm:text-[52px]">
              Prepare for the exam.{' '}
              <span className="font-semibold text-blue-700 underline decoration-blue-200 decoration-[1.5px] underline-offset-[8px]">
                Build for what&apos;s next
              </span>
              .
            </h1>

            <p className="mt-8 max-w-md text-[14.5px] leading-[1.9] text-gray-600">
              Real CBT practice for JAMB and Post-UTME that proves what you have actually learned.
              Start free. Upgrade when you are ready for deeper preparation.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/signup"
                className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Start preparing
              </Link>
              <Link
                href="/practice"
                className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-gray-200 bg-white px-6 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                Try a practice session
              </Link>
            </div>

            <p className="mt-6 text-[12.5px] text-gray-400">Free tier available · No card required</p>
          </div>

          <div className="relative lg:col-span-7">
            <div
              aria-hidden="true"
              className="absolute inset-0 translate-x-2.5 translate-y-2.5 rounded-2xl border border-gray-100 bg-gray-50/70 sm:translate-x-3.5 sm:translate-y-3.5"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-2xl border border-gray-100 bg-white/60 sm:translate-x-2 sm:translate-y-2"
            />

            <div className="relative rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_20px_44px_-36px_rgba(37,99,235,0.18)] sm:p-8">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                  Student to career
                </p>
                <span className="text-[11.5px] text-gray-400">In one place</span>
              </div>

              <div className="mt-5 border-t border-gray-100" />

              <div className="mt-5 flex items-center gap-1.5 sm:gap-2">
                {JOURNEY.map((step, index) => (
                  <Fragment key={step.scene}>
                    <div className="flex min-w-0 flex-1 flex-col items-center gap-2.5">
                      <div className="w-full overflow-hidden rounded-xl bg-gray-50 ring-1 ring-gray-100">
                        <SceneArt
                          scene={step.scene}
                          className="h-14 w-full sm:h-20"
                          label={`${step.label} illustration`}
                        />
                      </div>
                      <span className="truncate text-[10px] font-medium text-gray-500">{step.label}</span>
                    </div>
                    {index < JOURNEY.length - 1 && (
                      <ChevronRight
                        aria-hidden="true"
                        className="hidden h-4 w-4 shrink-0 text-gray-300 sm:block"
                      />
                    )}
                  </Fragment>
                ))}
              </div>

              <p className="mt-7 text-center text-[11.5px] text-gray-400">
                The journey Propeida covers — from exam day to first job.
              </p>
            </div>
          </div>
        </div>

        {/* 12 Students Active Learning Banner */}
        <div className="mt-16 sm:mt-20">
          <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-b from-blue-50/30 via-white to-gray-50/40 p-4 sm:p-8">
            <div className="mb-4 flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">
                  A Community of Builders & Learners
                </span>
                <h2 className="mt-1 text-base font-semibold text-gray-900 sm:text-lg">
                  Every student on their own path. Every future connected.
                </h2>
              </div>
              <span className="text-xs text-gray-400">12 diverse subjects &amp; skills</span>
            </div>

            <div className="relative mx-auto w-full overflow-hidden rounded-2xl bg-white shadow-2xs">
              <Image
                src="/images/landing/hero-students.jpg"
                alt="12 Nigerian students engaged in reading, painting, sketching, math, and tech activities with soft shadows on ground"
                width={1920}
                height={1080}
                priority
                className="h-auto w-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
