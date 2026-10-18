import Link from 'next/link'
import { BookOpen, Sigma, Newspaper, ChevronRight } from 'lucide-react'
import { SUBJECTS, getNotesBySubject, type SubjectSlug } from '@/lib/notes'

const SUBJECT_STYLE: Record<SubjectSlug, { icon: typeof BookOpen; tile: string }> = {
  english: { icon: BookOpen, tile: 'bg-blue-600' },
  mathematics: { icon: Sigma, tile: 'bg-amber-500' },
  'current-affairs': { icon: Newspaper, tile: 'bg-emerald-500' },
}

export const metadata = {
  title: 'Learn',
}

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-7">
        <h1 className="font-display text-[32px] font-semibold leading-tight text-black sm:text-4xl">
          Learn
        </h1>
        <p className="mt-1.5 text-[15px] font-semibold text-ink-soft">
          One idea at a time. Pick a subject.
        </p>
      </div>

      <div className="space-y-3.5">
        {SUBJECTS.map((subject) => {
          const style = SUBJECT_STYLE[subject.slug]
          const Icon = style.icon
          const count = getNotesBySubject(subject.slug).length
          return (
            <Link
              key={subject.slug}
              href={`/learn/${subject.slug}`}
              className="group flex items-center gap-4 rounded-3xl border border-blue-100/70 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(16,28,51,0.12)] hover:border-blue-300 hover:shadow-[0_12px_32px_-16px_rgba(37,99,235,0.4)] transition-all min-h-[76px]"
            >
              <span className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl ${style.tile} text-white shadow-[0_8px_20px_-8px_rgba(16,28,51,0.4)]`}>
                <Icon className="h-6 w-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-xl font-medium text-black">{subject.label}</span>
                <span className="mt-0.5 block truncate text-[13px] font-semibold text-ink-soft">
                  {subject.description}
                </span>
                <span className="mt-1 block text-xs font-extrabold text-gray-500">
                  {count} lesson{count === 1 ? '' : 's'}
                </span>
              </span>
              <ChevronRight className="h-6 w-6 shrink-0 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
