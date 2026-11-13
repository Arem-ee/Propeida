'use client'

import { useState, useCallback } from 'react'
import { ChevronRight } from 'lucide-react'
import {
  updateOnboardingProfile,
  type ExamTarget,
  type HeardAbout,
  type StudyTime,
} from '@/lib/actions/onboarding'

const EXAM_TARGETS: { value: ExamTarget; label: string }[] = [
  { value: 'jamb', label: 'JAMB UTME' },
  { value: 'post-utme', label: 'Post-UTME' },
  { value: 'general', label: 'General study' },
]

const HEARD_ABOUT: { value: HeardAbout; label: string }[] = [
  { value: 'whatsapp', label: 'WhatsApp channel' },
  { value: 'friend', label: 'Friend or classmate' },
  { value: 'school', label: 'School or teacher' },
  { value: 'social', label: 'Social media' },
  { value: 'other', label: 'Other' },
]

const STUDY_TIME: { value: StudyTime; label: string }[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'night', label: 'Night' },
  { value: 'flexible', label: 'Flexible / varies' },
]

interface Props {
  examTarget: ExamTarget | null
  subjectCombinations: string[]
  intendedCourse: string | null
  heardAbout: HeardAbout | null
  studyTime: StudyTime | null
  targetScore: number | null
  accessibilityNeeds: { large_font?: boolean; high_contrast?: boolean; sound_off?: boolean }
  subjectsPending: boolean
  subjects: { id: string; name: string; slug: string }[]
}

export default function OnboardingPreferencesEditor({
  examTarget: initialExamTarget,
  subjectCombinations: initialSubjectCombinations,
  intendedCourse: initialIntendedCourse,
  heardAbout: initialHeardAbout,
  studyTime: initialStudyTime,
  targetScore: initialTargetScore,
  accessibilityNeeds: initialAccessibilityNeeds,
  subjectsPending: initialSubjectsPending,
  subjects,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [examTarget, setExamTarget] = useState<ExamTarget | null>(initialExamTarget)
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(initialSubjectCombinations)
  const [subjectsPending, setSubjectsPending] = useState(initialSubjectsPending)
  const [intendedCourse, setIntendedCourse] = useState(initialIntendedCourse ?? '')
  const [heardAbout, setHeardAbout] = useState<HeardAbout | null>(initialHeardAbout)
  const [studyTime, setStudyTime] = useState<StudyTime | null>(initialStudyTime)
  const [targetScore, setTargetScore] = useState(initialTargetScore ?? '')
  const [accessibility, setAccessibility] = useState({
    large_font: !!initialAccessibilityNeeds.large_font,
    high_contrast: !!initialAccessibilityNeeds.high_contrast,
    sound_off: !!initialAccessibilityNeeds.sound_off,
  })

  const handleSave = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await updateOnboardingProfile({
        exam_target: examTarget ?? undefined,
        subject_combinations: selectedSubjects,
        intended_course: intendedCourse.trim() || null,
        heard_about: heardAbout ?? undefined,
        study_time: studyTime ?? undefined,
        target_score: targetScore ? Number(targetScore) : undefined,
        accessibility_needs: accessibility,
        subjects_pending: subjectsPending,
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not save your preferences.')
    } finally {
      setLoading(false)
    }
  }, [
    examTarget, selectedSubjects, intendedCourse, heardAbout, studyTime,
    targetScore, accessibility, subjectsPending,
  ])

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center gap-2">
        <ChevronRight className="h-4 w-4 text-gray-400" />
        <h2 className="font-display text-lg font-medium text-black">Learning preferences</h2>
      </div>
      <p className="text-[13px] font-semibold text-ink-soft">
        Update what you&rsquo;re preparing for and how you like to study. Changes apply immediately.
      </p>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-5">
        <div className="rounded-3xl border border-blue-100/70 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(16,28,51,0.12)]">
          <p className="font-display text-lg font-medium text-black mb-1">Preparing for</p>
          <div className="mt-2.5 space-y-2">
            {EXAM_TARGETS.map((t) => (
              <button
                key={t.value}
                onClick={() => setExamTarget(t.value)}
                aria-pressed={examTarget === t.value}
                className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                  examTarget === t.value
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-ink-soft'
                }`}
              >
                <span className="flex-1 font-semibold text-black">{t.label}</span>
                {examTarget === t.value && '✓'}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-blue-100/70 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(16,28,51,0.12)]">
          <p className="font-display text-lg font-medium text-black mb-1">Subjects</p>
          <p className="mt-0.5 text-[13px] font-semibold text-ink-soft mb-3.5">
            {subjectsPending && selectedSubjects.length === 0
              ? 'Pick later'
              : selectedSubjects.length > 0
                ? selectedSubjects.join(', ')
                : 'None selected'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {subjects.map((s) => {
              const isSelected = selectedSubjects.includes(s.slug) || selectedSubjects.includes(s.name)
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSubjectsPending(false)
                    setSelectedSubjects((prev) =>
                      prev.includes(s.slug)
                        ? prev.filter((id) => id !== s.slug)
                        : prev.includes(s.name)
                          ? prev.filter((id) => id !== s.name)
                          : [...prev, s.slug],
                    )
                  }}
                  aria-pressed={isSelected}
                  className={`flex items-center gap-2 rounded-2xl border-2 px-3 py-2.5 text-left text-[13px] font-bold min-h-[48px] transition-all pressable ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-ink-soft'
                  }`}
                >
                  <span className="flex-1">{s.name}</span>
                  {isSelected && '✓'}
                </button>
              )
            })}
          </div>
          <button
            onClick={() => {
              setSubjectsPending((p) => !p)
              if (!subjectsPending) setSelectedSubjects([])
            }}
            className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-bold text-blue-600 hover:text-blue-700 min-h-[36px] cursor-pointer"
          >
            {subjectsPending ? 'I have chosen my subjects' : 'I&apos;m not sure yet — pick later'}
          </button>
        </div>

        <div className="rounded-3xl border border-blue-100/70 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(16,28,51,0.12)]">
          <p className="font-display text-lg font-medium text-black mb-1">Intended course</p>
          <input
            value={intendedCourse}
            onChange={(e) => setIntendedCourse(e.target.value)}
            placeholder="e.g. Medicine, Law, Computer Science"
            className="mt-0.5 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-h-[48px]"
          />
        </div>

        <div className="rounded-3xl border border-blue-100/70 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(16,28,51,0.12)]">
          <p className="font-display text-lg font-medium text-black mb-1">How did you hear about us?</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {HEARD_ABOUT.map((o) => (
              <button
                key={o.value}
                onClick={() => setHeardAbout(o.value)}
                aria-pressed={heardAbout === o.value}
                className={`inline-flex items-center justify-center rounded-xl border-2 px-4 py-2.5 text-sm font-extrabold min-h-[44px] transition-all ${
                  heardAbout === o.value
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-ink-soft'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-blue-100/70 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(16,28,51,0.12)]">
          <p className="font-display text-lg font-medium text-black mb-1">Preferred study time</p>
          <div className="mt-2.5 flex gap-2">
            {STUDY_TIME.map((t) => (
              <button
                key={t.value}
                onClick={() => setStudyTime(t.value)}
                aria-pressed={studyTime === t.value}
                className={`flex-1 rounded-xl border-2 px-4 py-2.5 text-sm font-extrabold min-h-[44px] transition-all ${
                  studyTime === t.value
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-ink-soft'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-blue-100/70 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(16,28,51,0.12)]">
          <p className="font-display text-lg font-medium text-black mb-1">Target score</p>
          <input
            type="number"
            min="1"
            max={examTarget === 'jamb' ? 400 : examTarget === 'post-utme' ? 100 : 400}
            value={targetScore}
            onChange={(e) => setTargetScore(e.target.value)}
            className="mt-0.5 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-h-[48px]"
          />
        </div>

        <div className="rounded-3xl border border-blue-100/70 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(16,28,51,0.12)]">
          <p className="font-display text-lg font-medium text-black mb-1">Accessibility needs</p>
          <p className="mt-0.5 text-[13px] font-semibold text-ink-soft">Saved to your profile. These are separate from the device display options under Settings.</p>
          <div className="mt-2.5 space-y-2">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={accessibility.large_font}
                onChange={() => setAccessibility((prev) => ({ ...prev, large_font: !prev.large_font }))}
                className="h-5 w-5 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-semibold text-black">Large font</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={accessibility.high_contrast}
                onChange={() => setAccessibility((prev) => ({ ...prev, high_contrast: !prev.high_contrast }))}
                className="h-5 w-5 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-semibold text-black">High contrast</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={accessibility.sound_off}
                onChange={() => setAccessibility((prev) => ({ ...prev, sound_off: !prev.sound_off }))}
                className="h-5 w-5 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-semibold text-black">Sound off</span>
            </label>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full rounded-2xl bg-blue-600 px-8 py-4 text-[15px] font-extrabold text-white hover:bg-blue-700 min-h-[56px] transition-all cursor-pointer disabled:opacity-50 pressable"
      >
        {loading ? 'Saving...' : 'Save preferences'}
      </button>
    </div>
  )
}