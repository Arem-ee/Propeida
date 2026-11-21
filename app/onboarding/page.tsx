'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  saveOnboardingProfile,
  type ExamTarget,
  type AccessibilityNeeds,
} from '@/lib/actions/onboarding'
import { isStandaloneSubject } from '@/lib/subject-scope'
import { ArrowRight, ChevronLeft, HelpCircle, Check } from 'lucide-react'
import { Mascot, type MascotExpression } from '@/components/mascot'
import { MascotSays } from '@/components/celebrations/speech-bubble'
import { Confetti } from '@/components/celebrations/confetti'
import { WinToastList, useWins } from '@/components/celebrations/win-toast-list'
import { ReferralClaim } from '@/components/referrals/referral-claim'

type Step =
  | 'welcome'
  | 'exam'
  | 'subjects'
  | 'accessibility'
  | 'summary'

const STEPS: Step[] = [
  'welcome', 'exam', 'subjects', 'accessibility', 'summary',
]

interface Subject { id: string; name: string; slug: string }

const EXAM_TARGETS: { value: ExamTarget; label: string; hint: string }[] = [
  { value: 'jamb', label: 'JAMB UTME', hint: 'University entrance exam (CBT)' },
  { value: 'post-utme', label: 'Post-UTME', hint: 'University screening (e.g. UNILORIN)' },
  { value: 'general', label: 'General study', hint: 'Build knowledge without a specific exam' },
]

/**
 * Encouraging micro-copy per step. Keeps tone warm but never
 * childish: serious where it matters (accessibility, errors),
 * delightful where it's just a form field.
 */
const STEP_COPY: Record<
  Step,
  { mascot: MascotExpression; heading?: string; lead?: string; footnote?: string }
> = {
  welcome: {
    mascot: 'welcome',
    lead: 'This setup takes under a minute',
  },
  exam: {
    mascot: 'thinking',
    heading: 'What are you preparing for?',
    lead: 'This shapes everything you see, including lessons, questions, and mocks',
  },
  subjects: {
    mascot: 'encourage',
    heading: 'Your subjects',
    lead: 'You pick what you want to study, and you can change this later',
    footnote: 'You can choose whenever you are ready and nothing is locked',
  },
  accessibility: {
    mascot: 'encourage',
    heading: 'One last optional thing',
    lead: 'You can turn on anything that helps you, or skip past this',
  },
  summary: {
    mascot: 'celebrate',
    heading: 'You are all set',
    lead: "You can tap 'Start learning' when you are ready",
  },
}

const CARD_CLASS = 'rounded-3xl border border-blue-100/70 bg-white p-5 sm:p-7 shadow-[0_2px_16px_-8px_rgba(16,28,51,0.15)]'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>('welcome')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [subjectsLoading, setSubjectsLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)

  const { add } = useWins()

  const [examTarget, setExamTarget] = useState<ExamTarget | null>(null)
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [subjectsPending, setSubjectsPending] = useState(false)
  const [accessibility, setAccessibility] = useState<AccessibilityNeeds>({
    large_font: false, high_contrast: false, sound_off: false,
  })

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const { data } = await supabase.from('subjects').select('id, name, slug').order('name')
      if (!cancelled) {
        setSubjects((data ?? []) as Subject[])
        setSubjectsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [supabase])

  // /onboarding lives outside the (app) group, so nothing here redirects a
  // user who is not signed in. Guard it here so they never hit a generic
  // "Something went wrong" when the save action has no session.
  useEffect(() => {
    let cancelled = false
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!cancelled && !data.session) {
        router.replace('/login')
      }
    }
    checkSession()
    return () => { cancelled = true }
  }, [supabase, router])

  const goNext = useCallback(() => {
    const next = STEPS[STEPS.indexOf(step) + 1]
    if (next) setStep(next)
  }, [step])

  const goBack = useCallback(() => {
    const prev = STEPS[STEPS.indexOf(step) - 1]
    if (prev) setStep(prev)
  }, [step])

  const currentIndex = STEPS.indexOf(step) + 1
  const totalSteps = STEPS.length

  const canProceed = useCallback((): boolean => {
    switch (step) {
      case 'welcome':
        return true
      case 'exam':
        return !!examTarget
      case 'subjects':
        return selectedSubjects.length > 0 || subjectsPending
      case 'accessibility':
        return true
      case 'summary':
        return true
      default:
        return false
    }
  }, [step, examTarget, selectedSubjects, subjectsPending])

  const stepError = useCallback((): string | null => {
    switch (step) {
      case 'exam':
        return examTarget ? null : 'Please select what you are preparing for'
      case 'subjects':
        return selectedSubjects.length > 0 || subjectsPending
          ? null
          : 'Please select at least one subject, or choose to pick subjects later'
      default:
        return null
    }
  }, [step, examTarget, selectedSubjects, subjectsPending])

  const handleSave = useCallback(async () => {
    setError(null)
    const err = stepError()
    if (err) { setError(err); return }

    setLoading(true)
    try {
      await saveOnboardingProfile({
        exam_target: examTarget!,
        subject_combinations: selectedSubjects,
        accessibility_needs: accessibility,
        subjects_pending: subjectsPending,
      })
      add({
        kind: 'onboarded',
        message: 'You are all set',
        subtext: 'Welcome to Propeida, and you can start learning now',
        mascot: true,
        duration: 5000,
      })
      setShowConfetti(true)
      router.push('/home')
    } catch (err: unknown) {
      if (err instanceof Error && (err as { name?: string }).name === 'OnboardingError') {
        setError(err.message)
      } else {
        setError('Something went wrong, so please try again')
      }
    } finally {
      setLoading(false)
    }
  }, [
    examTarget, selectedSubjects,
    accessibility, subjectsPending, router, stepError, add,
  ])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <WinToastList />
      <ReferralClaim />
      <Confetti enabled={showConfetti} count={70} onEnd={() => setShowConfetti(false)} />
      <div className="w-full max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-extrabold text-ink-soft uppercase tracking-wider">
            Step {currentIndex} of {totalSteps}
          </span>
          {error && (
            <span className="text-xs font-extrabold text-red-600">{error}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1 -mx-4 px-4 sm:-mx-6 sm:px-6">
          {STEPS.map((s, i) => {
            const active = i === STEPS.indexOf(step)
            const completed = i < STEPS.indexOf(step)
            return (
              <div key={s} className="flex shrink-0 items-center gap-2">
                {i > 0 && (
                  <div className={`h-1 w-3 sm:w-4 ${completed ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
                <div className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-300 sm:h-8 sm:w-8 ${
                  active
                    ? 'bg-blue-600 text-white'
                    : completed ? 'bg-emerald-100 text-emerald-600 animate-pop-in' : 'bg-gray-200 text-gray-400'
                }`}>
                  {completed ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : (
                    <span className="text-[10px] font-extrabold">{i + 1}</span>
                  )}
                </div>
                <span className={`hidden text-[11px] font-extrabold uppercase tracking-tighter sm:inline ${
                  active || completed ? 'text-black' : 'text-gray-400'
                }`}>
                  {s.replace('-', ' ')}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="w-full max-w-xl mx-auto px-4">
        <div className={`${CARD_CLASS} min-h-[60vh] flex flex-col animate-fade-up`} key={step}>
          {step === 'welcome' && (
            <div className="text-center flex-1">
              <div className="flex items-center justify-center mb-6">
                <MascotSays expression="welcome" size="lg" text="It takes about a minute" />
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-tight text-black mb-3">
                Welcome to Propeida
              </h1>
              <p className="mx-auto mt-3 max-w-sm text-[15px] font-semibold leading-relaxed text-ink-soft mb-8">
                {STEP_COPY.welcome.lead}, and you tell us what you are preparing for so we can show you the right
                lessons, questions, and mocks
              </p>
              <button
                onClick={() => {
                  add({ kind: 'onboarded', message: 'We are glad you are here', mascot: true, duration: 3000 })
                  goNext()
                }}
                className="w-full sm:w-auto rounded-2xl bg-blue-600 px-8 py-4 text-[16px] font-extrabold text-white hover:bg-blue-700 min-h-[56px] cursor-pointer transition-all win-pulse pressable"
              >
                Get started
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={async () => {
                  setError(null)
                  setLoading(true)
                  try {
                    await saveOnboardingProfile({
                      exam_target: 'general',
                      subject_combinations: [],
                      intended_course: null,
                      heard_about: 'other',
                      study_time: 'flexible',
                      target_score: 1,
                      accessibility_needs: { large_font: false, high_contrast: false, sound_off: false },
                      subjects_pending: true,
                    })
                    router.push('/home')
                  } catch (err: unknown) {
                    if (err instanceof Error && (err as { name?: string }).name === 'OnboardingError') {
                      setError(err.message)
                    } else {
                      setError('Something went wrong, so please try again')
                    }
                  } finally {
                    setLoading(false)
                  }
                }}
                className="mt-3 w-full sm:w-auto rounded-2xl border border-gray-200 bg-white px-8 py-3 text-[15px] font-extrabold text-ink-soft hover:bg-gray-50 min-h-[52px] cursor-pointer transition-all"
              >
                Skip for now
              </button>
            </div>
          )}
          {step === 'exam' && (
            <div className="flex-1 space-y-6">
              <div className="flex items-center justify-start gap-3 mb-2">
                <Mascot expression={STEP_COPY.exam.mascot} size="sm" className="shrink-0 animate-pop-in" />
                <div>
                  <h2 className="font-display text-2xl font-semibold text-black mb-0.5">
                    {STEP_COPY.exam.heading}
                  </h2>
                  <p className="text-[14px] text-ink-soft">{STEP_COPY.exam.lead}</p>
                </div>
              </div>
              <div className="space-y-3">
                {EXAM_TARGETS.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setExamTarget(t.value)}
                    className={`flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all pressable ${
                      examTarget === t.value
                        ? 'border-blue-600 bg-blue-50/60'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-extrabold text-black">{t.label}</div>
                      <div className="text-xs text-ink-soft">{t.hint}</div>
                    </div>
                    {examTarget === t.value && <Check className="h-5 w-5 text-blue-600" strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 'summary' && (
            <div className="flex-1 space-y-6">
              <div className="flex items-center justify-start gap-3 mb-4">
                <MascotSays
                  expression={STEP_COPY.summary.mascot}
                  size="md"
                  text="You are ready for this one"
                />
              </div>
              <div>
                <h2 className="font-display text-2xl font-semibold text-black mb-0.5">{STEP_COPY.summary.heading}</h2>
                <p className="text-[14px] text-ink-soft">{STEP_COPY.summary.lead}</p>
              </div>
              <div className="space-y-4 text-[14px]">
                <div className="flex justify-between text-black">
                  <span className="font-semibold text-ink-soft">Preparing for</span>
                  <span className="font-medium">{EXAM_TARGETS.find((t) => t.value === examTarget)?.label ?? 'Not set'}</span>
                </div>
                <div className="flex justify-between text-black">
                  <span className="font-semibold text-ink-soft">Subjects</span>
                  <span className="font-medium">
                    {selectedSubjects.length > 0
                      ? selectedSubjects.join(', ')
                      : subjectsPending
                        ? 'You will pick these later'
                        : 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between text-black">
                  <span className="font-semibold text-ink-soft">Accessibility</span>
                  <span className="font-medium">
                    {Object.entries(accessibility).filter(([, v]) => v).map(([k]) => k.replace('_', ' ')).join(', ') || 'You turned none on'}
                  </span>
                </div>
              </div>
            </div>
          )}
          {step === 'subjects' && (
            <div className="flex-1 space-y-6">
              <div className="flex items-center justify-start gap-3 mb-2">
                <Mascot expression={STEP_COPY.subjects.mascot} size="sm" className="shrink-0 animate-pop-in" />
                <div>
                  <h2 className="font-display text-2xl font-semibold text-black mb-0.5">
                    {STEP_COPY.subjects.heading}
                  </h2>
                  <p className="text-[14px] text-ink-soft">{STEP_COPY.subjects.lead}</p>
                </div>
              </div>

              <button
                onClick={() => setSubjectsPending(true)}
                className="w-full rounded-2xl border-2 border-dashed border-gray-200 bg-white/50 px-4 py-4 text-left transition-all hover:bg-gray-50"
              >
                <HelpCircle className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-[14px] font-semibold text-ink-soft">I&apos;m not sure yet, so show me everything</span>
              </button>

              {subjectsLoading ? (
                <div className="flex min-h-[200px] items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {subjects
                    // Current Affairs is a standalone revision vertical, not
                    // a JAMB/Post-UTME exam subject, so it stays out of the
                    // exam-subject picker for both exam paths.
                    .filter((s) =>
                      examTarget === 'general' || !isStandaloneSubject(s.slug),
                    )
                    .map((s) => {
                    const isSelected = selectedSubjects.includes(s.slug)
                    return (
                      <button
                        key={s.id}
                        onClick={() => {
                          setSelectedSubjects(prev =>
                            prev.includes(s.slug) ? prev.filter((id) => id !== s.slug) : [...prev, s.slug]
                          )
                        }}
                        className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition-all pressable ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/60'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => e.preventDefault()}
                          className="h-5 w-5 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-semibold text-black">{s.name}</span>
                      </button>
                    )
                  })}
                </div>
              )}

              {subjectsPending && (
                <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 animate-pop-in">
                  <Mascot expression="thinking" size="sm" />
                  <p className="text-[13px] font-semibold leading-snug text-blue-800">
                    You can choose whenever you are ready and nothing is locked
                  </p>
                </div>
              )}
            </div>
          )}
          {step === 'accessibility' && (
            <div className="flex-1 space-y-6">
              <div className="flex items-center justify-start gap-3 mb-2">
                <Mascot expression={STEP_COPY.accessibility.mascot} size="sm" className="shrink-0 animate-pop-in" />
                <div>
                  <h2 className="font-display text-2xl font-semibold text-black mb-0.5">
                    {STEP_COPY.accessibility.heading}
                  </h2>
                  <p className="text-[14px] text-ink-soft">{STEP_COPY.accessibility.lead}</p>
                </div>
              </div>
              <div className="space-y-3">
                <label
                  onClick={() => setAccessibility(prev => ({ ...prev, large_font: !prev.large_font }))}
                  className="flex items-center gap-3 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={accessibility.large_font}
                    onChange={(e) => e.preventDefault()}
                    className="h-5 w-5 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-semibold text-black">Large font</span>
                </label>
                <label
                  onClick={() => setAccessibility(prev => ({ ...prev, high_contrast: !prev.high_contrast }))}
                  className="flex items-center gap-3 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={accessibility.high_contrast}
                    onChange={(e) => e.preventDefault()}
                    className="h-5 w-5 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-semibold text-black">High contrast</span>
                </label>
                <label
                  onClick={() => setAccessibility(prev => ({ ...prev, sound_off: !prev.sound_off }))}
                  className="flex items-center gap-3 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={accessibility.sound_off}
                    onChange={(e) => e.preventDefault()}
                    className="h-5 w-5 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-semibold text-black">Sound off</span>
                </label>
              </div>
            </div>
          )}
          <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
            {step !== 'welcome' && (
              <button
                onClick={goBack}
                disabled={loading}
                className="flex items-center gap-2 text-sm font-bold text-ink-soft hover:text-blue-600 cursor-pointer disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={loading || !canProceed()}
              className={`flex items-center gap-2 rounded-2xl px-6 py-3.5 text-[15px] font-extrabold text-white min-h-[52px] transition-all pressable ${
                canProceed() && !loading
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-[0_0_0_3px_rgba(37,99,235,0.12)] cursor-pointer'
                  : 'bg-gray-300'
              }`}
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : step === 'summary' ? (
                <>
                  Start learning <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Continue <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

