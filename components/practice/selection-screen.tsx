'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, AlertCircle, Timer, BookOpen, Lock } from 'lucide-react'
import { createSession } from '@/lib/actions/practice'

interface Exam {
  id: string
  name: string
  slug: string
  subject_selection_mode: 'user_selects' | 'fixed'
}

interface Subject {
  id: string
  name: string
  slug: string
}

interface ActiveSession {
  id: string
  mode: string
  examName: string
}

interface SelectionScreenProps {
  exams: Exam[]
  allSubjects: Subject[]
  examSubjectMap: Record<string, string[]>
  activeSession: ActiveSession | null
}

export default function SelectionScreen({ exams, allSubjects, examSubjectMap, activeSession }: SelectionScreenProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const hubParam = searchParams.get('hub') === 'universities' ? '?hub=universities' : ''
  const subjectParam = searchParams.get('subject')
  const topicParam = searchParams.get('topic')
  const [selectedExamId, setSelectedExamId] = useState<string>('')
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([])
  const [questionCount, setQuestionCount] = useState(10)
  const [difficulty, setDifficulty] = useState<string>('')
  const [mode, setMode] = useState<'practice' | 'mock'>('practice')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedExam = exams.find((e) => e.id === selectedExamId)
  const isFixed = selectedExam?.subject_selection_mode === 'fixed'
  const isJambMock = selectedExam?.slug === 'jamb' && mode === 'mock'
  const englishSubject = allSubjects.find((s) => s.slug === 'english')
  const notesSubjectName = subjectParam ? allSubjects.find((s) => s.slug === subjectParam)?.name ?? null : null

  // When JAMB mock is active, ensure English is always in selectedSubjectIds
  useEffect(() => {
    if (isJambMock && englishSubject && !selectedSubjectIds.includes(englishSubject.id)) {
      setSelectedSubjectIds((prev) => [englishSubject.id, ...prev])
    }
  }, [isJambMock, englishSubject?.id])

  const handleExamChange = (examId: string) => {
    setSelectedExamId(examId)
    setMode('practice')
    setQuestionCount(10)
    setDifficulty('')
    const exam = exams.find((e) => e.id === examId)
    if (exam?.subject_selection_mode === 'fixed') {
      setSelectedSubjectIds(examSubjectMap[examId] ?? [])
    } else {
      setSelectedSubjectIds([])
    }

    // Revision Notes integration: pre-select the subject a note pointed to.
    if (subjectParam) {
      const presetSubject = allSubjects.find((s) => s.slug === subjectParam)
      if (presetSubject) {
        const examSubjects = examSubjectMap[examId] ?? []
        if (exam?.subject_selection_mode === 'fixed') {
          // Fixed exams include all linked subjects automatically; nothing to preselect.
        } else if (examSubjects.length === 0 || examSubjects.includes(presetSubject.id)) {
          setSelectedSubjectIds([presetSubject.id])
        }
      }
    }
  }

  const availableSubjects = isFixed && selectedExam
    ? allSubjects.filter((s) => (examSubjectMap[selectedExam.id] ?? []).includes(s.id))
    : allSubjects

  const handleSubjectToggle = useCallback((subjectId: string) => {
    setSelectedSubjectIds((prev) => {
      // English is locked in JAMB mock mode
      if (subjectId === englishSubject?.id && isJambMock) return prev

      const isSelected = prev.includes(subjectId)
      if (isSelected) {
        return prev.filter((id) => id !== subjectId)
      }

      // In JAMB mock, max 3 electives + English = 4 total
      if (isJambMock) {
        const electiveCount = prev.filter((id) => id !== englishSubject?.id).length
        if (electiveCount >= 3) return prev
      }

      return [...prev, subjectId]
    })
  }, [englishSubject?.id, isJambMock])

  const handleStart = async () => {
    if (!selectedExamId) return

    let subjectIds: string[]
    if (isJambMock && englishSubject) {
      const electives = selectedSubjectIds.filter((id) => id !== englishSubject.id)
      if (electives.length !== 3) {
        setError('Select exactly 3 additional subjects for JAMB mock exam')
        return
      }
      subjectIds = [englishSubject.id, ...electives]
    } else {
      subjectIds = selectedSubjectIds.length > 0 ? selectedSubjectIds : (examSubjectMap[selectedExamId] ?? [])
    }

    setLoading(true)
    setError(null)

    try {
      const result = await createSession({
        examId: selectedExamId,
        examSlug: selectedExam?.slug ?? '',
        subjectIds,
        questionCount: isJambMock ? 180 : questionCount,
        difficulty: isJambMock ? null : (difficulty || null),
        mode,
      })

      router.push(`/practice/session/${result.sessionId}${hubParam}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session')
      setLoading(false)
    }
  }

  return (
    <div className="mt-8 space-y-8">
      {subjectParam && (
        <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-xs font-semibold text-blue-700">
          {notesSubjectName ? `From your Revision Note: ${notesSubjectName} — ` : ''}choose an exam and the
          subject will be pre-selected for you.
          {topicParam && <span> Topic-level filtering is coming soon.</span>}
        </div>
      )}

      {activeSession && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">You have an active session</p>
            <p className="text-xs text-amber-700 mt-1">
              {activeSession.examName} ({activeSession.mode} mode)
            </p>
            <button
              onClick={() => router.push(`/practice/session/${activeSession.id}${hubParam}`)}
              className="mt-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 min-h-[44px] cursor-pointer"
            >
              Resume session
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{error}</div>
      )}

      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Select Exam</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {exams.map((exam) => (
            <button
              key={exam.id}
              onClick={() => handleExamChange(exam.id)}
              className={`rounded-xl border p-3.5 text-left transition-all min-h-[44px] cursor-pointer ${
                selectedExamId === exam.id
                  ? 'border-blue-600 bg-blue-50/10 text-blue-600'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-sm font-bold">{exam.name}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedExamId && (
        <>
          {isFixed && mode === 'mock' && !isJambMock ? (
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-700">
              This exam uses fixed subjects — all linked subjects will be included automatically.
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Subjects
              </label>
              {isJambMock && (
                <p className="text-xs text-gray-500 mb-3">
                  English is compulsory. Select exactly 3 additional subjects for the mock exam.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {availableSubjects.map((subject) => {
                  const isEnglish = subject.id === englishSubject?.id
                  const isLocked = isJambMock && isEnglish
                  const isSelected = selectedSubjectIds.includes(subject.id)
                  return (
                    <button
                      key={subject.id}
                      onClick={() => handleSubjectToggle(subject.id)}
                      disabled={isLocked && isJambMock}
                      className={`rounded-xl border px-3.5 py-2 text-sm font-semibold transition-all min-h-[44px] ${
                        isLocked || isSelected
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      } ${isLocked ? 'opacity-80 cursor-default' : 'cursor-pointer'}`}
                    >
                      <span className="flex items-center gap-1.5">
                        {isLocked && <Lock className="h-3.5 w-3.5" />}
                        {subject.name}
                      </span>
                    </button>
                  )
                })}
              </div>
              {isJambMock && englishSubject && (
                <p className="text-xs text-gray-400 mt-2">
                  {(() => {
                    const count = selectedSubjectIds.filter((id) => id !== englishSubject.id).length
                    if (count < 3) return `${count}/3 elective subjects selected`
                    if (count === 3) return '3/3 elective subjects selected'
                    return ''
                  })()}
                </p>
              )}
            </div>
          )}

          {isJambMock ? (
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-700">
              JAMB mock exam: 180 questions across English (60) and 3 electives (40 each), 2-hour time limit.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Question Count
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none min-h-[44px]"
                >
                  {[5, 10, 15, 20, 30, 50].map((n) => (
                    <option key={n} value={n}>{n} questions</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none min-h-[44px]"
                >
                  <option value="">All levels</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Mode</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode('practice')}
                className={`flex items-center gap-3 rounded-xl border p-4 transition-all min-h-[44px] cursor-pointer ${
                  mode === 'practice'
                    ? 'border-blue-600 bg-blue-50/10'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <BookOpen className={`h-5 w-5 ${mode === 'practice' ? 'text-blue-600' : 'text-gray-400'}`} />
                <div className="text-left">
                  <div className={`text-sm font-bold ${mode === 'practice' ? 'text-blue-600' : 'text-gray-700'}`}>Practice</div>
                  <div className="text-xs text-gray-400">Immediate feedback</div>
                </div>
              </button>

              <button
                onClick={() => setMode('mock')}
                className={`flex items-center gap-3 rounded-xl border p-4 transition-all min-h-[44px] cursor-pointer ${
                  mode === 'mock'
                    ? 'border-blue-600 bg-blue-50/10'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <Timer className={`h-5 w-5 ${mode === 'mock' ? 'text-blue-600' : 'text-gray-400'}`} />
                <div className="text-left">
                  <div className={`text-sm font-bold ${mode === 'mock' ? 'text-blue-600' : 'text-gray-700'}`}>Mock Exam</div>
                  <div className="text-xs text-gray-400">Timed, no feedback</div>
                </div>
              </button>
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={
              loading ||
              (isJambMock && englishSubject
                ? selectedSubjectIds.filter((id) => id !== englishSubject.id).length !== 3
                : selectedSubjectIds.length === 0)
            }
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-base font-bold text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed min-h-[44px] cursor-pointer"
          >
            {loading ? 'Creating session...' : `Start ${mode === 'mock' && !isJambMock ? 'Mock Exam' : mode === 'mock' ? 'JAMB Mock Exam' : 'Practice'}`}
            <ArrowRight className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  )
}
