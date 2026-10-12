'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Timer, FileText, Play } from 'lucide-react'
import { createSession } from '@/lib/actions/practice'

interface Exam {
  id: string
  name: string
  slug: string
  questionCount: number
  timeLimitSeconds: number
}

interface Subject {
  id: string
  name: string
  slug: string
}

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  return h > 0 ? `${h} hr${m > 0 ? ` ${m} min` : ''}` : `${m} min`
}

export default function MockLauncher({
  exams,
  allSubjects,
  examSubjectMap,
}: {
  exams: Exam[]
  allSubjects: Subject[]
  examSubjectMap: Record<string, string[]>
}) {
  const router = useRouter()
  const [selectedExamId, setSelectedExamId] = useState(exams[0]?.id ?? '')
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([])
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const exam = exams.find((e) => e.id === selectedExamId) ?? null
  const isJamb = exam?.slug === 'jamb'
  const englishId = useMemo(
    () => allSubjects.find((s) => s.slug === 'english')?.id ?? null,
    [allSubjects],
  )
  const examSubjects = useMemo(() => {
    const ids = examSubjectMap[selectedExamId] ?? []
    return allSubjects.filter((s) => ids.includes(s.id))
  }, [allSubjects, examSubjectMap, selectedExamId])

  const electives = selectedSubjectIds.filter((id) => id !== englishId)
  const jambReady = !isJamb || (englishId !== null && selectedSubjectIds.includes(englishId) && electives.length === 3)

  // JAMB always carries English: pre-select it whenever a JAMB paper loads.
  useEffect(() => {
    if (isJamb && englishId && !selectedSubjectIds.includes(englishId)) {
      setSelectedSubjectIds((prev) => [englishId, ...prev]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isJamb, englishId])

  const toggleSubject = (id: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    )
  }

  const start = async () => {
    if (!exam) return
    setStarting(true)
    setError(null)
    try {
      const subjectIds = selectedSubjectIds.length > 0
        ? selectedSubjectIds
        : (examSubjectMap[exam.id] ?? [])
      const result = await createSession({
        examId: exam.id,
        examSlug: exam.slug,
        subjectIds,
        questionCount: exam.questionCount,
        difficulty: null,
        mode: 'mock',
      })
      router.push(`/mocks/session/${result.sessionId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start mock')
      setStarting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-blue-100/70 bg-white p-5 sm:p-6 shadow-[0_2px_12px_-6px_rgba(16,28,51,0.12)] space-y-5">
        <div>
          <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-gray-400">Exam</p>
          <div className="flex flex-wrap gap-2">
            {exams.map((e) => (
              <button
                key={e.id}
                onClick={() => { setSelectedExamId(e.id); setSelectedSubjectIds([]) }}
                className={`rounded-2xl px-4 py-2.5 text-sm font-extrabold min-h-[48px] cursor-pointer transition-all ${
                  selectedExamId === e.id
                    ? 'bg-blue-600 text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.6)]'
                    : 'bg-gray-100 text-ink-soft hover:bg-blue-50'
                }`}
              >
                {e.name}
              </button>
            ))}
          </div>
        </div>

        {exam && (
          <div className="flex flex-wrap gap-2 rounded-2xl bg-cream border border-amber-100 px-4 py-3">
            <span className="inline-flex items-center gap-1.5 text-[13px] font-extrabold text-ink">
              <FileText className="h-4 w-4 text-blue-600" />
              {exam.questionCount} questions
            </span>
            <span className="inline-flex items-center gap-1.5 text-[13px] font-extrabold text-ink">
              <Timer className="h-4 w-4 text-blue-600" />
              {formatDuration(exam.timeLimitSeconds)}
            </span>
          </div>
        )}

        <div>
          <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-gray-400">
            Subjects {isJamb ? '(English + any 3)' : '(optional — all by default)'}
          </p>
          <div className="flex flex-wrap gap-2">
            {examSubjects.map((subject) => {
              const active = selectedSubjectIds.includes(subject.id)
              const locked = isJamb && subject.id === englishId
              return (
                <button
                  key={subject.id}
                  onClick={() => { if (!locked) toggleSubject(subject.id) }}
                  aria-pressed={active || locked}
                  className={`rounded-2xl px-4 py-2.5 text-sm font-extrabold min-h-[48px] transition-all border-2 ${
                    active || locked
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-ink-soft'
                  } ${locked ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  {subject.name}{locked ? ' · required' : ''}
                </button>
              )
            })}
          </div>
          {isJamb && (
            <p className="mt-2 text-xs font-bold text-gray-400">
              JAMB rule: English is compulsory — pick exactly 3 more. {electives.length}/3 chosen.
            </p>
          )}
        </div>

        {error && (
          <p className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-bold text-red-700">{error}</p>
        )}

        <button
          onClick={start}
          disabled={starting || !exam || !jambReady}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-4 text-[16px] font-extrabold text-white hover:bg-blue-700 min-h-[56px] cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="h-5 w-5" />
          {starting ? 'Opening the hall...' : 'Enter mock exam'}
        </button>
        <p className="text-center text-xs font-semibold text-gray-400">
          Timed, no pauses. Answers autosave as you go.
        </p>
      </div>
    </div>
  )
}
