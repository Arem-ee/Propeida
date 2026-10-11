import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ChevronRight, BookOpen } from 'lucide-react'
import { SUBJECTS, getNotesBySubject, isValidSubject } from '@/lib/notes'

export async function generateMetadata({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = await params
  const found = SUBJECTS.find((s) => s.slug === subject)
  return { title: found ? `Learn ${found.label}` : 'Learn' }
}

export default async function SubjectLessonsPage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = await params
  if (!isValidSubject(subject)) notFound()

  const meta = SUBJECTS.find((s) => s.slug === subject)
  const notes = getNotesBySubject(subject)

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/learn"
        className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-ink-soft hover:text-blue-700 min-h-[36px]"
      >
        <ArrowLeft className="h-4 w-4" /> Subjects
      </Link>

      <div className="mb-6">
        <h1 className="font-display text-[32px] font-semibold leading-tight text-black sm:text-4xl">
          {meta?.label ?? subject}
        </h1>
        <p className="mt-1.5 text-[15px] font-semibold text-ink-soft">
          {notes.length} lesson{notes.length === 1 ? '' : 's'} — short enough to finish anywhere.
        </p>
      </div>

      {notes.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-blue-200 bg-white/70 p-8 text-center">
          <h2 className="font-display text-2xl font-medium text-black">Lessons on the way</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm font-semibold text-ink-soft">
            This subject is still being written and checked. Meanwhile, your other subjects are ready.
          </p>
          <Link
            href="/learn"
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-7 py-3.5 text-[15px] font-extrabold text-white hover:bg-blue-700 min-h-[52px]"
          >
            Browse subjects
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <Link
              key={note.id}
              href={`/learn/${note.subject}/${note.slug}`}
              className="group block rounded-3xl border border-blue-100/70 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(16,28,51,0.12)] hover:border-blue-300 hover:shadow-[0_12px_32px_-16px_rgba(37,99,235,0.4)] transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-display text-xl font-medium leading-snug text-black">{note.topic}</h2>
                  <p className="mt-1.5 line-clamp-2 text-sm font-semibold leading-relaxed text-ink-soft">
                    {note.summary}
                  </p>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                  <BookOpen className="h-5 w-5" />
                </span>
              </div>
              <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-extrabold text-blue-700">
                Read lesson
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
