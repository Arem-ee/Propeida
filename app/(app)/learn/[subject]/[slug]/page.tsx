import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { SUBJECTS } from '@/lib/notes'
import {
  getLessonByPath,
  getLessonQuestions,
  getNextLessonInCurriculum,
} from '@/lib/actions/lessons'
import LessonPlayer from '@/components/lessons/lesson-player'
import UpgradeCard, { PRO_BULLETS } from '@/components/paywall/upgrade-card'

export async function generateMetadata({ params }: { params: Promise<{ subject: string; slug: string }> }) {
  const { subject, slug } = await params
  const lesson = await getLessonByPath(subject, slug)
  return { title: lesson ? lesson.note.topic : 'Lesson' }
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ subject: string; slug: string }>
}) {
  const { subject, slug } = await params
  const lesson = await getLessonByPath(subject, slug)
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
          body={lesson.teaserTakeaway ?? 'This lesson is part of Pro.'}
          bullets={PRO_BULLETS}
        />
      </div>
    )
  }

  let diagnostic = null
  let independent: Awaited<ReturnType<typeof getLessonQuestions>>['independent'] = []
  let microCheck: Awaited<ReturnType<typeof getLessonQuestions>>['independent'][number] | null = null
  if (subjectId) {
    try {
      // Scoped to the exam the lesson serves, and preferring questions
      // tagged to the lesson's own topic: a JAMB lesson is never quizzed
      // with a Post-UTME question, nor with one from another topic.
      const set = await getLessonQuestions(subjectId, examId, topicId)
      diagnostic = set.diagnostic
      microCheck = set.independent[0] ?? null
      independent = set.independent.slice(1)
    } catch {
      diagnostic = null
      independent = []
      microCheck = null
    }
  }

  // Onward path: the next lesson in curriculum order, from the database.
  const nextLesson = await getNextLessonInCurriculum(note.subject, note.slug)

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
            Bank questions for this subject are still being checked — the interactive lesson opens with them.
          </p>
        </div>
      )}
    </div>
  )
}
