'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { completeOnboarding } from '@/lib/actions/onboarding'
import { ChevronLeft, ArrowRight, Sparkles } from 'lucide-react'

const STEPS = [
  {
    title: 'Welcome to Propeida',
    body: "We built this because passing JAMB or your Post-UTME shouldn't come down to luck, or to grinding through past questions with no idea what you actually know. Whichever one you're preparing for, everything here is built around one thing: walking into that exam hall already knowing what to expect.",
  },
  {
    title: 'What to expect',
    body: "Practice mode gives you instant feedback on every answer — so each question teaches you something, not just tests you. Mock mode runs a full timed exam simulation, just like the real thing. The free tier gives you a real taste of everything before you decide to upgrade. And your progress carries across sessions — streaks, leaderboard, all of it. Nothing resets.",
  },
  {
    title: 'One last thing',
    body: "You've got this. Good luck — we'll be here the whole way.",
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(true)
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
        router.push('/dashboard')
      }
      setLoading(false)
    }
    check()
  }, [router])

  const handleNext = useCallback(async () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
    } else {
      setSaving(true)
      try { await completeOnboarding() } catch {}
      router.push('/dashboard')
      router.refresh()
    }
  }, [step, router])

  const handleSkip = useCallback(async () => {
    setSaving(true)
    try { await completeOnboarding() } catch {}
    router.push('/dashboard')
    router.refresh()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  const current = STEPS[step]!

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="relative w-full max-w-lg">
        {/* Skip — visible at every step */}
        <div className="flex justify-end mb-2">
          <button
            onClick={handleSkip}
            disabled={saving}
            className="text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors min-h-[44px] px-3 cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Loading...' : 'Skip'}
          </button>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-8 sm:p-10 shadow-sm">
          {/* Step indicator */}
          <div className="flex items-center gap-1.5 mb-8">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= step ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
            <span className="ml-3 text-xs font-bold text-gray-400 tabular-nums">
              {step + 1}/{STEPS.length}
            </span>
          </div>

          {/* Step icon */}
          {step === 0 && (
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <Sparkles className="h-6 w-6 text-blue-600" />
            </div>
          )}

          {/* Title */}
          <h2 className="text-xl font-extrabold text-gray-900 mb-3">
            {current.title}
          </h2>

          {/* Body */}
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {current.body}
          </p>

          {/* Navigation */}
          <div className="mt-8 flex items-center gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors min-h-[44px] cursor-pointer disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
            )}
            <div className="flex-1" />
            <button
              onClick={handleNext}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors min-h-[44px] cursor-pointer disabled:bg-blue-300"
            >
              {step < STEPS.length - 1 ? 'Continue' : 'Go to Dashboard'}
              {step < STEPS.length - 1 && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
