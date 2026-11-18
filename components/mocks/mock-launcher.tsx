'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Timer, FileText, Play } from 'lucide-react'
import { createSession, getFreeMockStatus } from '@/lib/actions/practice'
import UpgradeCard from '@/components/paywall/upgrade-card'

interface Exam {
  id: string
  name: string
  slug: string
  questionCount: number
  timeLimitSeconds: number
  subjectCounts: Record<string, number>
  subjectRoles: Record<string, number> | null
  subjectWeights: Record<string, number> | null
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
  defaultSubjectSlugs = [],
}: {
  exams: Exam[]
  allSubjects: Subject[]
  examSubjectMap: Record<string, string[]>
  defaultSubjectSlugs?: string[]
}) {
  const router = useRouter()
  const [selectedExamId, setSelectedExamId] = useState(exams[0]?.id ?? '')
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>(() =>
    defaultSubjectSlugs
      .map((slug) => allSubjects.find((s) => s.slug === slug)?.id)
      .filter((id): id is string => Boolean(id)),
  )
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mockFree, setMockFree] = useState(true)

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

  const englishRequirement = exam?.subjectRoles?.english ?? null
  const electiveRequirement = exam?.subjectRoles?.elective ?? null
  const countFor = (subjectId: string) => exam?.subjectCounts[subjectId] ?? 0

  // JAMB always carries English, so the paper includes it even though the
  // picker shows it as locked rather than as a separate choice.
  const selectedForMock = useMemo(() => {
    if (selectedSubjectIds.length > 0) {
      if (isJamb && englishId && !selectedSubjectIds.includes(englishId)) {
        return [englishId, ...selectedSubjectIds]
      }
      return selectedSubjectIds
    }
    return examSubjects.map((s) => s.id)
  }, [selectedSubjectIds, examSubjects, isJamb, englishId])

  const electives = selectedSubjectIds.filter((id) => id !== englishId)

  // Every slot gets an honest target. JAMB names its slots (English 60,
  // each elective 40); a fixed or weighted paper splits its question count
  // the same way the fetch path does. A JAMB paper only counts once it
  // holds English plus exactly 3 electives, so the readiness hint shows
  // before the learner picks them, not a shortfall for subjects nobody
  // chose.
  const slotRequirements = new Map<string, number>()
  if (exam) {
    if (isJamb) {
      if (englishId && englishRequirement) slotRequirements.set(englishId, englishRequirement)
      if (electives.length === 3 && electiveRequirement) {
        for (const id of electives) slotRequirements.set(id, electiveRequirement)
      }
    } else {
      let remaining = exam.questionCount
      selectedForMock.forEach((id, index) => {
        const isLast = index === selectedForMock.length - 1
        const slug = allSubjects.find((s) => s.id === id)?.slug
        const weighted = slug && exam.subjectWeights ? exam.subjectWeights[slug] : undefined
        const even = Math.floor(exam.questionCount / selectedForMock.length)
        const share = isLast
          ? remaining
          : Math.min(remaining, Math.max(0, weighted ?? even))
        slotRequirements.set(id, Math.max(0, share))
        remaining -= share
      })
    }
  }

  const electivesReady = electives.every(
    (id) => !electiveRequirement || countFor(id) >= electiveRequirement,
  )
  const englishReady = !englishRequirement
    || (englishId !== null && countFor(englishId) >= englishRequirement)
  const jambStructureReady = !isJamb || (englishId !== null && electives.length === 3)
  const jambReady = jambStructureReady && englishReady && electivesReady

  const shortfall = [...slotRequirements].reduce(
    (total, [id, needed]) => total + Math.max(0, needed - countFor(id)),
    0,
  )
  const bankReady = shortfall === 0 && jambReady

  // Free mock allowance: past it the start button becomes the paywall.
  useEffect(() => {
    if (!selectedExamId) return
    let live = true
    getFreeMockStatus(selectedExamId)
      .then((status) => { if (live) setMockFree(status.isPro || status.used < status.allowed) })
      .catch(() => { if (live) setMockFree(true) })
    return () => { live = false }
  }, [selectedExamId])

  const toggleSubject = (id: string) => {
    if (isJamb && id === englishId) return
    setSelectedSubjectIds((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id)
      // JAMB papers carry exactly 3 electives, so the picker stops there.
      if (isJamb && prev.filter((s) => s !== englishId).length >= 3) return prev
      return [...prev, id]
    })
  }

  const start = async () => {
    if (!exam || !bankReady) return
    setStarting(true)
    setError(null)
    try {
      const subjectIds = selectedForMock.length > 0
        ? selectedForMock
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
      setError(err instanceof Error ? err.message : 'Could not start the mock')
      setStarting(false)
    }
  }

  const requirementFor = (subjectId: string): number | null => {
    if (!exam) return null
    if (isJamb) return subjectId === englishId ? englishRequirement : electiveRequirement
    return slotRequirements.get(subjectId) ?? null
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-blue-100/70 bg-white p-5 sm:p-6 shadow-[0_2px_12px_-6px_rgba(16,28,51,0.12)] space-y-5">
        <div>
          <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-gray-500">Exam</p>
          <div className="flex flex-wrap gap-2">
            {exams.map((e) => (
              <button
                key={e.id}
                onClick={() => { setSelectedExamId(e.id); setSelectedSubjectIds([]); setMockFree(true) }}
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
          <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-gray-500">
            Subjects {isJamb ? '(English plus any 3 others)' : '(optional, and all are picked by default)'}
          </p>
          <div className="flex flex-wrap gap-2">
            {examSubjects.map((subject) => {
              const active = selectedSubjectIds.includes(subject.id)
              const locked = isJamb && subject.id === englishId
              const requirement = requirementFor(subject.id)
              const count = countFor(subject.id)
              const short = isJamb && !locked && requirement !== null && count < requirement
              return (
                <button
                  key={subject.id}
                  onClick={() => { if (!locked && !short) toggleSubject(subject.id) }}
                  aria-pressed={active || locked}
                  disabled={short}
                  className={`flex flex-col items-start rounded-2xl px-4 py-2.5 text-left text-sm font-extrabold min-h-[48px] transition-all border-2 ${
                    active || locked
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : short
                        ? 'border-gray-200 bg-gray-50 text-gray-400'
                        : 'border-gray-200 bg-white text-ink-soft'
                  } ${locked ? 'cursor-default' : short ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span>{subject.name}{locked ? ' · always included' : ''}</span>
                  {short && (
                    <span className="text-[11px] font-bold opacity-80">Not available yet</span>
                  )}
                </button>
              )
            })}
          </div>
          {isJamb && (
            <p className="mt-2 text-xs font-bold text-gray-500">
              {electives.length < 3
                ? `JAMB needs English plus 3 more subjects, and you have picked ${electives.length} of 3`
                : 'Your paper has English and 3 electives'}
            </p>
          )}
          {!englishReady && englishRequirement !== null && (
            <p className="mt-2 text-xs font-bold text-red-600">
              English is still being topped up for this paper, so check back soon
            </p>
          )}
        </div>

        {error && (
          <p className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-bold text-red-700">{error}</p>
        )}

        {exam && shortfall > 0 && (
          <p className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm font-bold text-amber-800">
            This paper needs subjects that are ready, so swap a greyed-out subject for one that is available, or check back soon
          </p>
        )}

        {!mockFree ? (
          <UpgradeCard
            title="Your free mock is used"
            body="Pro opens unlimited mocks under the same time and conditions"
            bullets={['You can take as many timed mocks as you want', 'You get every subject every time']}
          />
        ) : (
        <button
          onClick={start}
          disabled={starting || !exam || !bankReady}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-4 text-[16px] font-extrabold text-white hover:bg-blue-700 min-h-[56px] cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="h-5 w-5" />
          {starting ? 'Setting up your mock' : 'Enter mock exam'}
        </button>
        )}
        <p className="text-center text-xs font-semibold text-gray-500">
          It is timed with no pauses, and your answers save as you go
        </p>
      </div>
    </div>
  )
}
