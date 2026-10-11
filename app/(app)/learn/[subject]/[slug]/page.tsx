import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Lightbulb } from 'lucide-react'
import { getNoteByPath, SUBJECTS } from '@/lib/notes'

export async function generateMetadata({ params }: { params: Promise<{ subject: string; slug: string }> }) {
  const { subject, slug } = await params
  const note = getNoteByPath(subject, slug)
  return { title: note ? note.topic : 'Lesson' }
}

export default async function LessonReaderPage({
  params,
}: {
  params: Promise<{ subject: string; slug: string }>
}) {
  const { subject, slug } = await params
  const note = getNoteByPath(subject, slug)
  if (!note) notFound()

  const subjectLabel = SUBJECTS.find((s) => s.slug === note.subject)?.label ?? note.subject

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/learn/${note.subject}`}
        className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-ink-soft hover:text-blue-700 min-h-[36px]"
      >
        <ArrowLeft className="h-4 w-4" /> {subjectLabel} lessons
      </Link>

      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-blue-700">
        {subjectLabel}
      </p>
      <h1 className="mt-1.5 font-display text-[30px] font-semibold leading-tight text-black sm:text-4xl">
        {note.topic}
      </h1>
      <p className="mt-3 text-[16px] font-semibold leading-relaxed text-ink-soft">
        {note.summary}
      </p>

      <div className="mt-7 space-y-6">
        {note.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-display text-[22px] font-medium text-black">{section.heading}</h2>
            {section.paragraphs?.map((p, i) => (
              <p key={i} className="mt-2 text-[16px] font-semibold leading-[1.65] text-ink-soft">{p}</p>
            ))}
            <ul className="mt-3 space-y-2.5">
              {section.bullets.map((b, i) => (
                <li key={i} className="flex gap-3 text-[16px] font-semibold leading-[1.65] text-ink-soft">
                  <span className="mt-[11px] h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                  {b}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {note.examTip && (
        <div className="mt-8 rounded-3xl border-2 border-amber-200 bg-amber-50 p-5 sm:p-6">
          <p className="flex items-center gap-2 font-display text-lg font-medium text-amber-900">
            <Lightbulb className="h-5 w-5 text-amber-600" />
            Exam tip
          </p>
          <p className="mt-1.5 text-[15px] font-semibold leading-relaxed text-amber-900">{note.examTip}</p>
        </div>
      )}

      <div className="mt-8 rounded-3xl bg-ink text-white p-5 sm:p-6">
        <p className="font-display text-xl font-medium">Prove you kept it.</p>
        <p className="mt-1 text-sm font-semibold text-blue-100/80">
          Targeted practice on this topic opens with the Practice tab.
        </p>
        <Link
          href="/practice"
          className="mt-4 inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-extrabold text-ink hover:bg-blue-50 min-h-[48px] transition-colors"
        >
          Go to Practice
        </Link>
      </div>
    </div>
  )
}
