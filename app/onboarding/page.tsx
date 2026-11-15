'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  saveOnboardingProfile,
  type ExamTarget,
  type HeardAbout,
  type StudyTime,
  type AccessibilityNeeds,
} from '@/lib/actions/onboarding'
import { isStandaloneSubject } from '@/lib/subject-scope'
import { ArrowRight, ChevronLeft, HelpCircle, Check } from 'lucide-react'
import { Mascot, type MascotExpression } from '@/components/mascot'
import { MascotSays } from '@/components/celebrations/speech-bubble'
import { Confetti } from '@/components/celebrations/confetti'
import { WinToastList, useWins } from '@/components/celebrations/win-toast-list'

type Step =
  | 'welcome'
  | 'exam'
  | 'subjects'
  | 'name'
  | 'course'
  | 'heard-about'
  | 'study-time'
  | 'target-score'
  | 'accessibility'
  | 'summary'

const STEPS: Step[] = [
  'welcome', 'exam', 'subjects', 'name', 'course',
  'heard-about', 'study-time', 'target-score', 'accessibility', 'summary',
]

interface Subject { id: string; name: string; slug: string }

const EXAM_TARGETS: { value: ExamTarget; label: string; hint: string }[] = [
  { value: 'jamb', label: 'JAMB UTME', hint: 'University entrance exam (CBT)' },
  { value: 'post-utme', label: 'Post-UTME', hint: 'University screening (e.g. UNILORIN)' },
  { value: 'general', label: 'General study', hint: 'Build knowledge without a specific exam' },
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
  name: {
    mascot: 'encourage',
    heading: 'Your full name',
    lead: 'We use this for certificates and support messages',
  },
  course: {
    mascot: 'thinking',
    heading: 'Course you intend to study',
    lead: 'This is optional, and you can set your Post-UTME target school later',
  },
  'heard-about': {
    mascot: 'encourage',
    heading: 'How did you hear about us?',
    lead: 'This helps us reach more people preparing for the same exams',
  },
  'study-time': {
    mascot: 'encourage',
    heading: 'Preferred study time',
    lead: "We will show 'Today's review' at a good time for you",
  },
  'target-score': {
    mascot: 'thinking',
    heading: 'Target score',
    lead: "This sets your personal goal on the progress map",
  },
  accessibility: {
    mascot: 'encourage',
    heading: 'Accessibility needs',
    lead: 'You can turn on anything that helps you, and you can change it later',
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
  const [name, setName] = useState('')
  const [course, setCourse] = useState('')
  const [heardAbout, setHeardAbout] = useState<HeardAbout | null>(null)
  const [studyTime, setStudyTime] = useState<StudyTime | null>(null)
  const [targetScore, setTargetScore] = useState<string>('')
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
      case 'name':
        return name.trim().length >= 2
      case 'course':
        return true
      case 'heard-about':
        return !!heardAbout
      case 'study-time':
        return !!studyTime
      case 'target-score': {
        const n = Number(targetScore)
        if (!n || n < 1) return false
        if (examTarget === 'jamb' && n > 400) return false
        if (examTarget === 'post-utme' && n > 100) return false
        return true
      }
      case 'accessibility':
        return true
      case 'summary':
        return true
      default:
        return false
    }
  }, [step, examTarget, selectedSubjects, subjectsPending, name, heardAbout, studyTime, targetScore])

  const stepError = useCallback((): string | null => {
    switch (step) {
      case 'exam':
        return examTarget ? null : 'Please select what you are preparing for'
      case 'subjects':
        return selectedSubjects.length > 0 || subjectsPending
          ? null
          : 'Please select at least one subject, or choose to pick subjects later'
      case 'name':
        return name.trim().length >= 2 ? null : 'Please enter your full name'
      case 'heard-about':
        return heardAbout ? null : 'Please select how you heard about us'
      case 'study-time':
        return studyTime ? null : 'Please select your preferred study time'
      case 'target-score': {
        const n = Number(targetScore)
        if (!n || n < 1) return 'Please enter a valid target score'
        if (examTarget === 'jamb' && n > 400) return 'JAMB scores run from 1 to 400'
        if (examTarget === 'post-utme' && n > 100) return 'Post-UTME scores are typically out of 100'
        return null
      }
      default:
        return null
    }
  }, [step, examTarget, selectedSubjects, subjectsPending, name, heardAbout, studyTime, targetScore])

  const handleSave = useCallback(async () => {
    setError(null)
    const err = stepError()
    if (err) { setError(err); return }

    setLoading(true)
    try {
      await saveOnboardingProfile({
        exam_target: examTarget!,
        subject_combinations: selectedSubjects,
        intended_course: course.trim() || null,
        heard_about: heardAbout!,
        study_time: studyTime!,
        target_score: Number(targetScore),
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
    examTarget, selectedSubjects, course, heardAbout, studyTime, targetScore,
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
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => {
            const active = i === STEPS.indexOf(step)
            const completed = i < STEPS.indexOf(step)
            return (
              <div key={s} className="flex items-center gap-2">
                {i > 0 && (
                  <div className={`h-1 w-4 ${completed ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
                <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300 ${
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
                <span className={`text-[11px] font-extrabold uppercase tracking-tighter ${
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
                onClick={() => {
                  saveOnboardingProfile({
                    exam_target: 'general',
                    subject_combinations: [],
                    intended_course: null,
                    heard_about: 'other',
                    study_time: 'flexible',
                    target_score: 1,
                    accessibility_needs: { large_font: false, high_contrast: false, sound_off: false },
                    subjects_pending: true,
                  }).then(() => router.push('/home')).catch(() => router.push('/home'))
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
                {name && (
                  <div className="flex justify-between text-black">
                    <span className="font-semibold text-ink-soft">Full name</span>
                    <span className="font-medium">{name}</span>
                  </div>
                )}
                {course && (
                  <div className="flex justify-between text-black">
                    <span className="font-semibold text-ink-soft">Intended course</span>
                    <span className="font-medium">{course}</span>
                  </div>
                )}
                <div className="flex justify-between text-black">
                  <span className="font-semibold text-ink-soft">Heard about us</span>
                  <span className="font-medium">{HEARD_ABOUT.find((o) => o.value === heardAbout)?.label ?? 'Not set'}</span>
                </div>
                <div className="flex justify-between text-black">
                  <span className="font-semibold text-ink-soft">Study time</span>
                  <span className="font-medium">{STUDY_TIME.find((t) => t.value === studyTime)?.label ?? 'Not set'}</span>
                </div>
                <div className="flex justify-between text-black">
                  <span className="font-semibold text-ink-soft">Target score</span>
                  <span className="font-medium">{targetScore}</span>
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
          {step === 'name' && (
            <div className="flex-1 space-y-6">
              <div className="flex items-center justify-start gap-3 mb-2">
                <Mascot expression={STEP_COPY.name.mascot} size="sm" className="shrink-0 animate-pop-in" />
                <div>
                  <h2 className="font-display text-2xl font-semibold text-black mb-0.5">
                    {STEP_COPY.name.heading}
                  </h2>
                  <p className="text-[14px] text-ink-soft">{STEP_COPY.name.lead}</p>
                </div>
              </div>
              <input
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Adebola Okafor"
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-h-[56px]"
              />
            </div>
          )}
          {step === 'course' && (
            <div className="flex-1 space-y-6">
              <div className="flex items-center justify-start gap-3 mb-2">
                <Mascot expression={STEP_COPY.course.mascot} size="sm" className="shrink-0 animate-pop-in" />
                <div>
                  <h2 className="font-display text-2xl font-semibold text-black mb-0.5">
                    {STEP_COPY.course.heading}
                  </h2>
                  <p className="text-[14px] text-ink-soft">{STEP_COPY.course.lead}</p>
                </div>
              </div>
              <input
                autoComplete="off"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. Medicine, Law, Computer Science"
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-h-[56px]"
              />
            </div>
          )}

          {step === 'heard-about' && (
            <div className="flex-1 space-y-6">
              <div className="flex items-center justify-start gap-3 mb-2">
                <Mascot expression={STEP_COPY['heard-about'].mascot} size="sm" className="shrink-0 animate-pop-in" />
                <div>
                  <h2 className="font-display text-2xl font-semibold text-black mb-0.5">
                    {STEP_COPY['heard-about'].heading}
                  </h2>
                  <p className="text-[14px] text-ink-soft">{STEP_COPY['heard-about'].lead}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {HEARD_ABOUT.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => setHeardAbout(o.value)}
                    className={`flex items-center justify-center rounded-2xl border-2 p-4 text-left transition-all pressable ${
                      heardAbout === o.value
                        ? 'border-blue-600 bg-blue-50/60'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-black">{o.label}</span>
                    </div>
                    {heardAbout === o.value && <Check className="h-5 w-5 text-blue-600" strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'study-time' && (
            <div className="flex-1 space-y-6">
              <div className="flex items-center justify-start gap-3 mb-2">
                <Mascot expression={STEP_COPY['study-time'].mascot} size="sm" className="shrink-0 animate-pop-in" />
                <div>
                  <h2 className="font-display text-2xl font-semibold text-black mb-0.5">
                    {STEP_COPY['study-time'].heading}
                  </h2>
                  <p className="text-[14px] text-ink-soft">{STEP_COPY['study-time'].lead}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {STUDY_TIME.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setStudyTime(t.value)}
                    className={`flex items-center justify-center rounded-2xl border-2 p-4 text-left transition-all pressable ${
                      studyTime === t.value
                        ? 'border-blue-600 bg-blue-50/60'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-black">{t.label}</span>
                    </div>
                    {studyTime === t.value && <Check className="h-5 w-5 text-blue-600" strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'target-score' && (
            <div className="flex-1 space-y-6">
              <div className="flex items-center justify-start gap-3 mb-2">
                <Mascot expression={STEP_COPY['target-score'].mascot} size="sm" className="shrink-0 animate-pop-in" />
                <div>
                  <h2 className="font-display text-2xl font-semibold text-black mb-0.5">
                    {STEP_COPY['target-score'].heading}
                  </h2>
                  <p className="text-[14px] text-ink-soft">{STEP_COPY['target-score'].lead}</p>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-black">
                  Target score (out of {examTarget === 'jamb' ? 400 : examTarget === 'post-utme' ? 100 : 400})
                </label>
                <input
                  type="number"
                  min="1"
                  max={examTarget === 'jamb' ? 400 : examTarget === 'post-utme' ? 100 : 400}
                  value={targetScore}
                  onChange={(e) => setTargetScore(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-h-[56px]"
                />
              </div>
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

