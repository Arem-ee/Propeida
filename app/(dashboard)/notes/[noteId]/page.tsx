import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Clock, Lightbulb, Target, ArrowRight, RefreshCcw } from 'lucide-react'
import {
  getNoteById,
  getReadingMinutes,
  getWordCount,
  getPracticeUrl,
  getSubjectLabel,
} from '@/lib/notes'

export default async function NotePage({
  params,
}: {
  params: Promise<{ noteId: string }>
}) {
  const { noteId } = await params
  const note = getNoteById(noteId)

  if (!note) notFound()

  const readingMinutes = getReadingMinutes(note)
  const wordCount = getWordCount(note)
  const practiceUrl = getPracticeUrl(note)

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/dashboard/notes"
        className="inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 min-h-[44px]"
      >
        <ArrowLeft className="h-4 w-4" />
        All revision notes
      </Link>

      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
            {getSubjectLabel(note.subject)}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
            <Clock className="h-3.5 w-3.5" />
            {readingMinutes} min read
          </span>
          <span className="text-xs font-semibold text-gray-400">· {wordCount} words</span>
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900">{note.topic}</h1>
        <p className="mt-3 text-base text-gray-500 leading-relaxed">{note.summary}</p>
      </header>

      <div className="mt-8 space-y-8">
        {note.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-lg font-extrabold text-gray-900">{section.heading}</h2>
            <ul className="mt-3 space-y-2.5">
              {section.bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-[15px] text-gray-600 leading-relaxed">
                  <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-amber-100 bg-amber-50 p-5">
        <div className="flex items-center gap-2 font-bold text-amber-800">
          <Lightbulb className="h-4 w-4" />
          Exam tip
        </div>
        <p className="mt-2 text-sm text-amber-700 leading-relaxed">{note.examTip}</p>
      </div>

      <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/60 p-6">
        <div className="flex items-center gap-2 font-bold text-gray-900">
          <Target className="h-4 w-4 text-blue-600" />
          Test yourself on this topic
        </div>
        <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
          Now practice what you just revised. Questions are drawn from this subject — then come back and re-read the
          note to lock it in.
        </p>
        <Link
          href={practiceUrl}
          className="mt-4 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 active:bg-blue-800 min-h-[44px]"
        >
          Start practicing
          <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-gray-400">
          <RefreshCcw className="h-3 w-3" />
          Read → Practice → Review → Read again
        </p>
      </div>
    </div>
  )
}