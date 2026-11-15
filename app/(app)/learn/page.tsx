import Link from 'next/link'
import {
  BookOpen,
  Sigma,
  Newspaper,
  ChevronRight,
  Microscope,
  FlaskConical,
  Atom,
  Landmark,
  TrendingUp,
  Store,
  type LucideIcon,
} from 'lucide-react'
import { getLearnSubjects } from '@/lib/actions/learn-subjects'

export const metadata = {
  title: 'Learn',
}

const SUBJECT_META: Record<string, { icon: LucideIcon; tile: string; description: string }> = {
  english: { icon: BookOpen, tile: 'bg-blue-600', description: 'Grammar, comprehension and vocabulary essentials.' },
  mathematics: { icon: Sigma, tile: 'bg-amber-500', description: 'Core topics for objective-style questions.' },
  'current-affairs': { icon: Newspaper, tile: 'bg-emerald-600', description: 'Government, institutions and recent developments.' },
  biology: { icon: Microscope, tile: 'bg-green-600', description: 'From cells to ecosystems, by specimen and system.' },
  chemistry: { icon: FlaskConical, tile: 'bg-violet-600', description: 'Molecules, reactions, rates and measurements.' },
  physics: { icon: Atom, tile: 'bg-sky-600', description: 'Mechanics, waves, electricity and modern physics.' },
  government: { icon: Landmark, tile: 'bg-rose-600', description: 'Politics and institutions in Nigeria and beyond.' },
  economics: { icon: TrendingUp, tile: 'bg-indigo-600', description: 'Markets, business and public policy in Nigeria.' },
  commerce: { icon: Store, tile: 'bg-teal-600', description: 'Business, trade and administration.' },
}
const FALLBACK_META = { icon: BookOpen, tile: 'bg-slate-500', description: 'JAMB syllabus lessons.' }

export default async function LearnPage() {
  const subjects = await getLearnSubjects()

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-7">
        <h1 className="font-display text-[32px] font-semibold leading-tight text-black sm:text-4xl">
          Learn
        </h1>
        <p className="mt-1.5 text-[15px] font-semibold text-ink-soft">
          You learn one idea at a time, so pick a subject
        </p>
      </div>

      {subjects.length === 0 ? (
        <p className="text-[15px] font-semibold text-ink-soft">
          No subjects are live yet. They appear here as each one is published.
        </p>
      ) : (
        <div className="space-y-3.5">
          {subjects.map((subject) => {
            const meta = SUBJECT_META[subject.slug] ?? FALLBACK_META
            const Icon = meta.icon
            return (
              <Link
                key={subject.slug}
                href={`/learn/${subject.slug}`}
                className="group flex items-center gap-4 rounded-3xl border border-blue-100/70 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(16,28,51,0.12)] hover:border-blue-300 hover:shadow-[0_12px_32px_-16px_rgba(37,99,235,0.4)] transition-all min-h-[76px]"
              >
                <span className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl ${meta.tile} text-white shadow-[0_8px_20px_-8px_rgba(16,28,51,0.4)]`}>
                  <Icon className="h-6 w-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-xl font-medium text-black">{subject.label}</span>
                  <span className="mt-0.5 block truncate text-[13px] font-semibold text-ink-soft">
                    {meta.description}
                  </span>
                  <span className="mt-1 block text-xs font-extrabold text-gray-500">
                    {subject.lessonCount} lesson{subject.lessonCount === 1 ? '' : 's'}
                  </span>
                </span>
                <ChevronRight className="h-6 w-6 shrink-0 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
