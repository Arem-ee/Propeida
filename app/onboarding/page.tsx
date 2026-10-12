'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  completeOnboarding,
  getOnboardingCheck,
  submitOnboardingCheck,
  type CheckQuestion,
} from '@/lib/actions/onboarding'

type Confidence = 'sure' | 'unsure' | null

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [started, setStarted] = useState(false)
  const [questions, setQuestions] = useState<CheckQuestion[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [confidence, setConfidence] = useState<Confidence>(null)
  const [answers, setAnswers] = useState<{ questionId: string; subjectId: string; selectedAnswer: string; confidence: 'sure' | 'unsure' }[]>([])
  const [loadError, setLoadError] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [summary, setSummary] = useState<{ subjectName: string; correct: number; total: number }[] | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const check = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      if (profile?.onboarding_completed) {
        router.push('/home')
        return
      }
      setLoading(false)
    }
    check()
  }, [router])

  const begin = useCallback(async () => {
    setStarted(true)
    try {
      const qs = await getOnboardingCheck()
      setQuestions(qs)
    } catch {
      setLoadError(true)
    }
  }, [])

  const handleSkip = useCallback(async () => {
    setSaving(true)
    try { await completeOnboarding() } catch {}
    router.push('/home')
    router.refresh()
  }, [router])

  const answer = () => {
    const q = questions[index]
    if (!q || !selected) return
    setAnswers((prev) => [...prev, { questionId: q.id, subjectId: q.subjectId, selectedAnswer: selected, confidence: confidence ?? 'unsure' }])
    if (index < questions.length - 1) {
      setIndex((i) => i + 1)
      setSelected(null)
      setConfidence(null)
    } else {
      void finish([...answers, { questionId: q.id, subjectId: q.subjectId, selectedAnswer: selected, confidence: confidence ?? 'unsure' }])
    }
  }

  const finish = async (all: { questionId: string; subjectId: string; selectedAnswer: string; confidence: 'sure' | 'unsure' }[]) => {
    setFinishing(true)
    try {
      const result = await submitOnboardingCheck(all)
      setSummary(result.summary)
    } catch {
      await handleSkip()
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="flex justify-end mb-2">
          <button
            onClick={handleSkip}
            disabled={saving}
            className="text-sm font-bold text-gray-400 hover:text-gray-600 min-h-[44px] px-3 cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Loading...' : 'Skip'}
          </button>
        </div>

        {!started ? (
          <div className="rounded-3xl border border-blue-100/70 bg-white p-8 sm:p-10 text-center shadow-[0_2px_16px_-8px_rgba(16,28,51,0.15)]">
            <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-tight text-black">
              Let&apos;s see where you stand.
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-[15px] font-semibold leading-relaxed text-ink-soft">
              Five quick questions — no teaching, no pressure. Wrong answers just show us where to start.
            </p>
            <button
              onClick={begin}
              className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-[16px] font-extrabold text-white hover:bg-blue-700 shadow-[0_12px_28px_-12px_rgba(37,99,235,0.7)] min-h-[56px] cursor-pointer transition-all"
            >
              Start my 5-minute check
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        ) : summary ? (
          <div className="rounded-3xl border-2 border-emerald-200 bg-emerald-50/60 p-8 sm:p-10 text-center animate-pop">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
              <Check className="h-8 w-8 text-emerald-600" strokeWidth={3} />
            </span>
            <h1 className="font-display text-3xl font-medium text-black">Placed.</h1>
            <div className="mx-auto mt-4 max-w-sm space-y-2 text-left">
              {summary.map((s) => (
                <div key={s.subjectName} className="flex items-center justify-between rounded-2xl bg-white/70 border border-emerald-200 px-4 py-3">
                  <span className="text-sm font-extrabold text-black">{s.subjectName}</span>
                  <span className="text-sm font-extrabold text-emerald-700">{s.correct}/{s.total}</span>
                </div>
              ))}
            </div>
            <p className="mx-auto mt-4 max-w-sm text-sm font-semibold text-ink-soft">
              Your home is set up around this — weakest first, reviews scheduled.
            </p>
            <Link
              href="/home"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-[16px] font-extrabold text-white hover:bg-blue-700 min-h-[56px]"
            >
              Go to my home
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        ) : loadError || questions.length === 0 ? (
          <div className="rounded-3xl border border-blue-100/70 bg-white p-8 text-center">
            <p className="text-[15px] font-semibold text-ink-soft">
              {loadError ? 'The check could not load — your home works without it.' : 'Preparing your check...'}
            </p>
            <button
              onClick={handleSkip}
              className="mt-5 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-7 py-3.5 text-[15px] font-extrabold text-white min-h-[52px] cursor-pointer"
            >
              Continue to home
            </button>
          </div>
        ) : (
          (() => {
            const q = questions[index]!
            const total = questions.length
            return (
              <div className="rounded-3xl border border-blue-100/70 bg-white p-5 sm:p-7 shadow-[0_2px_16px_-8px_rgba(16,28,51,0.15)]">
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-white border border-blue-100 px-3.5 py-1.5 text-xs font-extrabold text-ink-soft shadow-sm">
                    Check {index + 1} of {total} · {q.subjectName}
                  </span>
                </div>
                <p className="font-display text-lg sm:text-xl font-medium leading-snug text-black">{q.questionText}</p>
                <div className="mt-4 space-y-2.5">
                  {q.options.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setSelected(opt.key)}
                      className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3.5 text-left min-h-[56px] transition-all cursor-pointer ${
                        selected === opt.key
                          ? 'border-blue-600 bg-blue-50/60 shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold border-2 ${
                        selected === opt.key ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-500 bg-white'
                      }`}>
                        {opt.key}
                      </span>
                      <span className="text-[15px] font-bold text-black">{opt.text}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  {(['sure', 'unsure'] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setConfidence(c)}
                      className={`flex-1 rounded-2xl border-2 px-4 py-2.5 text-sm font-extrabold min-h-[48px] cursor-pointer transition-all ${
                        confidence === c ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-500'
                      }`}
                    >
                      {c === 'sure' ? 'Sure' : 'Unsure'}
                    </button>
                  ))}
                </div>
                <button
                  onClick={answer}
                  disabled={!selected || !confidence || finishing}
                  className={`mt-3 w-full rounded-2xl py-3.5 text-[15px] font-extrabold text-white min-h-[52px] transition-all ${
                    selected && confidence && !finishing ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer' : 'bg-gray-300'
                  }`}
                >
                  {finishing ? 'Placing you...' : index < total - 1 ? 'Next' : 'See my placement'}
                </button>
                <p className="mt-3 text-center text-xs font-semibold text-gray-400">
                  <X className="mr-1 inline h-3 w-3" />
                  Guessing is fine — unsure answers place you best.
                </p>
              </div>
            )
          })()
        )}
      </div>
    </div>
  )
}

