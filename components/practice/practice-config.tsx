'use client'

import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Play } from 'lucide-react'
import { createSession } from '@/lib/actions/practice'

interface Exam {
  id: string
  name: string
  slug: string
}

interface Subject {
  id: string
  name: string
  slug: string
}

const COUNTS = [5, 10, 15, 20]
const DIFFICULTIES = [
  { value: '', label: 'Mixed' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

export default function PracticeConfig({
  exams,
  allSubjects,
  examSubjectMap,
  activeSession,
}: {
  exams: Exam[]
  allSubjects: Subject[]
  examSubjectMap: Record<string, string[]>
  activeSession: { id: string; examName: string } | null
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const presetSlug = searchParams.get('subject')

  // Multi-preselect for mixed review (?subjects=a,b). Singular stays
  // backward-compatible with existing deep links.
  const presetSlugs = useMemo(() => {
    const multi = searchParams.get('subjects')
    if (multi) return multi.split(',').map((s) => s.trim()).filter(Boolean)
    return presetSlug ? [presetSlug] : []
  }, [searchParams, presetSlug])

  const presetSubjects = useMemo(
    () =>
      presetSlugs
        .map((slug) => allSubjects.find((s) => s.slug === slug))
        .filter((s): s is { id: string; name: string; slug: string } => Boolean(s)),
    [allSubjects, presetSlugs],
  )
  const presetSubject = presetSubjects[0] ?? null
  const presetExamId = useMemo(() => {
    if (!presetSubject) return null
    return exams.find((e) => (examSubjectMap[e.id] ?? []).includes(presetSubject.id))?.id ?? null
  }, [exams, examSubjectMap, presetSubject])

  const [selectedExamId, setSelectedExamId] = useState<string>(presetExamId ?? exams[0]?.id ?? '')
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>(
    presetSubjects.map((s) => s.id),
  )
  const [questionCount, setQuestionCount] = useState(10)
  const [difficulty, setDifficulty] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const examSubjects = useMemo(() => {
    const ids = examSubjectMap[selectedExamId] ?? []
    return allSubjects.filter((s) => ids.includes(s.id))
  }, [allSubjects, examSubjectMap, selectedExamId])

  const selectedExam = exams.find((e) => e.id === selectedExamId)

  const toggleSubject = (id: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    )
  }

  const handleStart = async () => {
    if (!selectedExamId || selectedSubjectIds.length === 0) {
      setError('Choose an exam and at least one subject.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = await createSession({
        examId: selectedExamId,
        examSlug: selectedExam?.slug ?? '',
        subjectIds: selectedSubjectIds,
        questionCount,
        difficulty: difficulty || null,
        mode: 'practice',
      })
      const params = new URLSearchParams()
      if (result.warmupIds.length > 0) params.set('warmup', result.warmupIds.join(','))
      if (result.lessonNoteId) params.set('lesson', result.lessonNoteId)
      const qs = params.toString()
      router.push(`/practice/session/${result.sessionId}${qs ? `?${qs}` : ''}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      {presetSubjects.length > 0 && (
        <div className="rounded-2xl bg-blue-50 border border-blue-100 px-4 py-3 text-[13px] font-bold text-blue-700">
          {presetSubjects.length > 1
            ? `Mixed review: ${presetSubjects.map((s) => s.name).join(' + ')} — pre-selected below.`
            : `From your review: ${presetSubjects[0]!.name} — pre-selected below.`}
        </div>
      )}

      {activeSession && (
        <button
          onClick={() => router.push(`/practice/session/${activeSession.id}`)}
          className="w-full rounded-3xl border-2 border-amber-200 bg-amber-50 p-5 text-left cursor-pointer"
        >
          <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-amber-700">Resume</p>
          <p className="mt-1 font-display text-xl font-medium text-black">{activeSession.examName}</p>
          <p className="text-sm font-semibold text-ink-soft">You have a session in progress.</p>
        </button>
      )}

      <div className="rounded-3xl border border-blue-100/70 bg-white p-5 sm:p-6 shadow-[0_2px_12px_-6px_rgba(16,28,51,0.12)] space-y-5">
        <div>
          <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-gray-500">Exam</p>
          <div className="flex flex-wrap gap-2">
            {exams.map((exam) => (
              <button
                key={exam.id}
                onClick={() => { setSelectedExamId(exam.id); setSelectedSubjectIds([]) }}
                className={`rounded-2xl px-4 py-2.5 text-sm font-extrabold min-h-[48px] cursor-pointer transition-all ${
                  selectedExamId === exam.id
                    ? 'bg-blue-600 text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.6)]'
                    : 'bg-gray-100 text-ink-soft hover:bg-blue-50'
                }`}
              >
                {exam.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-gray-500">Subjects</p>
          {examSubjects.length === 0 ? (
            <p className="text-sm font-semibold text-gray-500">No subjects linked to this exam yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {examSubjects.map((subject) => {
                const active = selectedSubjectIds.includes(subject.id)
                return (
                  <button
                    key={subject.id}
                    onClick={() => toggleSubject(subject.id)}
                    aria-pressed={active}
                    className={`rounded-2xl px-4 py-2.5 text-sm font-extrabold min-h-[48px] cursor-pointer transition-all border-2 ${
                      active
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-ink-soft'
                    }`}
                  >
                    {subject.name}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-gray-500">Questions</p>
            <div className="flex gap-2">
              {COUNTS.map((n) => (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  className={`flex-1 rounded-2xl py-2.5 text-sm font-extrabold min-h-[48px] cursor-pointer transition-all ${
                    questionCount === n ? 'bg-ink text-white' : 'bg-gray-100 text-ink-soft'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-gray-500">Difficulty</p>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full rounded-2xl border-2 border-gray-200 bg-white px-3 py-2.5 text-sm font-extrabold text-black min-h-[48px]"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-bold text-red-700">{error}</p>
        )}

        <button
          onClick={handleStart}
          disabled={loading || !selectedExamId || selectedSubjectIds.length === 0}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-[16px] font-extrabold text-white hover:bg-blue-700 shadow-[0_12px_28px_-12px_rgba(37,99,235,0.7)] min-h-[56px] cursor-pointer transition-all disabled:opacity-50"
        >
          <Play className="h-5 w-5" />
          {loading ? 'Setting up...' : 'Start practicing'}
        </button>
      </div>

    </div>
  )
}
