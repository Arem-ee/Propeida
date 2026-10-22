import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Target,
  ArrowRight,
  Lock,
} from 'lucide-react'
import { SUBJECTS, isValidSubject } from '@/lib/notes'
import { getNextRecommendedLesson, getSubjectCurriculum } from '@/lib/actions/lessons'

export async function generateMetadata({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = await params
  const found = SUBJECTS.find((s) => s.slug === subject)
  return { title: found ? `Learn ${found.label}` : 'Learn' }
}

export default async function SubjectLessonsPage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = await params
  if (!isValidSubject(subject)) notFound()

  const meta = SUBJECTS.find((s) => s.slug === subject)
  const { note } = await getNextRecommendedLesson(subject)
  const { sections, recommendedLessonId } = await getSubjectCurriculum(subject)

  const hasCurriculum = sections.some((s) => s.topics.length > 0)

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
          {note ? 'Your next step' : 'Your curriculum'}
        </p>
      </div>

      {note && (
        <div className="space-y-3">
          <Link
            href={`/learn/${note.subject}/${note.slug}`}
            className="group block relative rounded-3xl border border-blue-100/70 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(16,28,51,0.12)] hover:border-blue-300 hover:shadow-[0_12px_32px_-16px_rgba(37,99,235,0.4)] transition-all"
          >
            <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-700">
              <Sparkles className="h-3 w-3" />
              <span>Recommended for you</span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-display text-xl font-medium leading-snug text-black">{note.topic}</h2>
                <p className="mt-1.5 line-clamp-2 text-sm font-semibold leading-relaxed text-ink-soft">
                  {note.summary}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-extrabold text-blue-700">
                    {note.responseType === 'mcq' && 'Multiple choice'}
                    {note.responseType === 'text' && 'Free response'}
                    {note.responseType === 'derivation' && 'Step-by-step'}
                  </span>
                </div>
              </div>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <BookOpen className="h-6 w-6" />
              </span>
            </div>
            <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-extrabold text-blue-700">
              Start lesson <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
      )}

      {hasCurriculum && (
        <div className="mt-8 space-y-8">
          {sections.map((section) => (
            <section key={section.key}>
              <div className="flex items-baseline gap-2">
                <h2 className="font-display text-lg font-semibold text-black">{section.title}</h2>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-extrabold text-gray-500">
                  Section {section.key}
                </span>
              </div>
              <ul className="mt-3 space-y-1.5">
                {section.topics.map((topic) => {
                  const isRecommended = topic.lesson?.id === recommendedLessonId
                  const body = (
                    <>
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${
                          topic.lesson
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {topic.order}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold leading-snug text-gray-900">
                          {topic.name}
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-gray-500">
                          {topic.description}
                        </span>
                      </span>
                      {topic.lesson ? (
                        <span className="flex shrink-0 items-center gap-1.5 text-xs font-extrabold text-blue-700">
                          {isRecommended ? (
                            <>
                              <Sparkles className="h-3.5 w-3.5" />
                              Next
                            </>
                          ) : (
                            <>
                              <ArrowRight className="h-3.5 w-3.5" />
                              Start
                            </>
                          )}
                        </span>
                      ) : (
                        <span className="flex shrink-0 items-center gap-1.5 text-xs font-extrabold text-gray-400">
                          <Lock className="h-3.5 w-3.5" />
                          Coming
                        </span>
                      )}
                    </>
                  )

                  return (
                    <li key={topic.id}>
                      {topic.lesson ? (
                        <Link
                          href={`/learn/${subject}/${topic.lesson.slug}`}
                          className={`flex items-start gap-3 rounded-2xl border p-3.5 transition-colors ${
                            isRecommended
                              ? 'border-blue-300 bg-blue-50/50'
                              : 'border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/30'
                          }`}
                        >
                          {body}
                        </Link>
                      ) : (
                        <div className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50/50 p-3.5">
                          {body}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      {!note && !hasCurriculum && (
        <div className="rounded-3xl border-2 border-emerald-200 bg-emerald-50/60 p-8 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-600" />
          <h2 className="mt-4 font-display text-2xl font-medium text-black">All caught up</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm font-semibold text-ink-soft">
            You&apos;ve completed every lesson in this subject. Time to practise or review!
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/practice?subject=${subject}`}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-7 py-3.5 text-[15px] font-extrabold text-white hover:bg-blue-700 min-h-[52px]"
            >
              <Target className="h-5 w-5" />
              Practise this subject
            </Link>
            <Link
              href="/learn"
              className="inline-flex items-center justify-center rounded-2xl border-2 border-gray-200 bg-white px-7 py-3.5 text-[15px] font-extrabold text-ink-soft hover:border-gray-300 min-h-[52px]"
            >
              Browse subjects
            </Link>
          </div>
        </div>
      )}

      {!note && hasCurriculum && (
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            href={`/practice?subject=${subject}`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-7 py-3.5 text-[15px] font-extrabold text-white hover:bg-blue-700 min-h-[52px]"
          >
            <Target className="h-5 w-5" />
            Practise this subject
          </Link>
          <Link
            href="/learn"
            className="inline-flex items-center justify-center rounded-2xl border-2 border-gray-200 bg-white px-7 py-3.5 text-[15px] font-extrabold text-ink-soft hover:border-gray-300 min-h-[52px]"
          >
            Browse subjects
          </Link>
        </div>
      )}
    </div>
  )
}
