import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import 'katex/dist/katex.min.css'
import { SUBJECTS } from '@/lib/notes'
import { getLessonQuestions, getNextLessonInCurriculum } from '@/lib/actions/lessons'
import { loadLessonByPath } from '@/lib/lesson-loader'
import LessonPlayer from '@/components/lessons/lesson-player'
import UpgradeCard, { PRO_BULLETS } from '@/components/paywall/upgrade-card'

export async function generateMetadata({ params }: { params: Promise<{ subject: string; slug: string }> }) {
  const { subject, slug } = await params
  const lesson = await loadLessonByPath(subject, slug)
  return { title: lesson ? lesson.note.topic : 'Lesson' }
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ subject: string; slug: string }>
}) {
  const { subject, slug } = await params
  const lesson = await loadLessonByPath(subject, slug)
  if (!lesson) notFound()

  const { note, enhancement, english, subjectId, examId, topicId, gated } = lesson
  const subjectLabel = SUBJECTS.find((s) => s.slug === note.subject)?.label ?? note.subject

  if (gated) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link
          href={`/learn/${note.subject}`}
          className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-ink-soft hover:text-blue-700 min-h-[36px]"
        >
          <ArrowLeft className="h-4 w-4" /> {subjectLabel} lessons
        </Link>
        <UpgradeCard
          title={note.topic}
          body={lesson.teaserTakeaway ?? 'You get this lesson with Pro'}
          bullets={PRO_BULLETS}
        />
      </div>
    )
  }

  // Question set and onward path are independent; fetch them together.
  const [set, nextLesson] = await Promise.all([
    subjectId
      ? getLessonQuestions(subjectId, examId, topicId).catch(() => null)
      : Promise.resolve(null),
    getNextLessonInCurriculum(note.subject, note.slug).catch(() => null),
  ])

  const diagnostic = set?.diagnostic ?? null
  const microCheck = set?.independent[0] ?? null
  const independent = set ? set.independent.slice(1) : []

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/learn/${note.subject}`}
        className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-ink-soft hover:text-blue-700 min-h-[36px]"
      >
        <ArrowLeft className="h-4 w-4" /> {subjectLabel} lessons
      </Link>

      {subjectId ? (
        <LessonPlayer
          note={note}
          subjectLabel={subjectLabel}
          enhancement={enhancement}
          english={english}
          diagnostic={diagnostic}
          independent={independent}
          microCheck={microCheck}
          nextLesson={nextLesson}
          subjectId={subjectId}
          examId={examId}
        />
      ) : (
        <div className="rounded-3xl border-2 border-dashed border-blue-200 bg-white/70 p-8 text-center">
          <h1 className="font-display text-2xl font-medium text-black">{note.topic}</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm font-semibold text-ink-soft">
            We are still checking bank questions for this subject, and the interactive lesson opens with them
          </p>
        </div>
      )}
    </div>
  )
}
