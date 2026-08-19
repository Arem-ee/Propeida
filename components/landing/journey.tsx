import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SceneArt } from '@/components/explore/visuals/scene-art'
import type { SceneKey } from '@/lib/explore/visual-scenes'

const STEPS = [
  {
    number: '01',
    title: 'Prepare',
    body: 'Practise the real exams with the real timer.',
    scene: 'education' as SceneKey,
  },
  {
    number: '02',
    title: 'Discover',
    body: 'See careers you didn\u2019t know existed.',
    scene: 'compass' as SceneKey,
  },
  {
    number: '03',
    title: 'Understand',
    body: 'Know where each career is needed, and where it is heading.',
    scene: 'research' as SceneKey,
  },
  {
    number: '04',
    title: 'Build',
    body: 'Learn the skills that matter, in the right order.',
    scene: 'tools' as SceneKey,
  },
  {
    number: '05',
    title: 'Move',
    body: 'Walk into the exam ready — and know what comes next.',
    scene: 'briefcase' as SceneKey,
  },
]

export default function LandingJourney() {
  return (
    <section className="border-t border-gray-100 bg-gray-50/50 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">How it works</p>
        <h2 className="mt-4 max-w-2xl font-serif text-[30px] font-medium leading-tight text-gray-900 sm:text-[36px]">
          From &ldquo;what do I study?&rdquo; to &ldquo;what do I do next?&rdquo;
        </h2>
        <p className="mt-4 max-w-xl text-[14.5px] leading-[1.9] text-gray-600">
          Five steps. One journey. Propeida walks with you from the exam to the career.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_12px_32px_-24px_rgba(15,23,42,0.10)]"
            >
              <span className="font-serif text-[26px] italic leading-none text-blue-700">{step.number}</span>
              <div className="mt-4 overflow-hidden rounded-xl ring-1 ring-gray-100">
                <SceneArt scene={step.scene} className="h-24 w-full" label={`${step.title} illustration`} />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">{step.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-gray-600">{step.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Link
            href="/signup"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-blue-600 px-5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Start with step one
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/explore"
            className="inline-flex min-h-[44px] items-center text-sm font-bold text-blue-600 transition-colors hover:text-blue-700"
          >
            Or just start exploring
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}