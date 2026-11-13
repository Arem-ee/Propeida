'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import {
  getOnboardingCheck,
  submitOnboardingCheck,
  type CheckQuestion,
} from '@/lib/actions/onboarding'
import { ArrowRight, Check, ArrowLeft } from 'lucide-react'

type Confidence = 'sure' | 'unsure' | null

type Phase = 'intro' | 'questions' | 'summary'

export default function DiagnosticPage() {
  const [phase, setPhase] = useState<Phase>('intro')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [questions, setQuestions] = useState<CheckQuestion[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [confidence, setConfidence] = useState<Confidence>(null)
  const [answers, setAnswers] = useState<{
    questionId: string
    subjectId: string
    selectedAnswer: string
    confidence: 'sure' | 'unsure'
  }[]>([])
  const [summary, setSummary] = useState<{
    subjectName: string
    correct: number
    total: number
  }[] | null>(null)

  const loadQuestions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const qs = await getOnboardingCheck()
      setQuestions(qs)
      setPhase('questions')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not load the placement check.')
    } finally {
      setLoading(false)
    }
  }, [])

  const submitAnswers = useCallback(async () => {
    const all = [...answers, { questionId: questions[index]!.id, subjectId: questions[index]!.subjectId, selectedAnswer: selected!, confidence: confidence! }]
    setLoading(true)
    setError(null)
    try {
      const result = await submitOnboardingCheck(all)
      setSummary(result.summary)
      setPhase('summary')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not submit your answers. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [answers, questions, index, selected, confidence])

  const total = questions.length
  const current = index + 1
  const q = questions[index]

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (phase === 'intro') {
    return (
      <div className="flex min-h-screen flex-col bg-paper">
        <div className="w-full max-w-xl mx-auto px-4 py-12">
          <div className="rounded-3xl border border-blue-100/70 bg-white p-8 sm:p-10 shadow-[0_2px_16px_-8px_rgba(16,28,51,0.15)] text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-6">
              <Check className="h-8 w-8 text-blue-600" strokeWidth={3} />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-tight text-black mb-3">
              Placement check
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-[15px] font-semibold leading-relaxed text-ink-soft mb-8">
              Five quick questions in English and Mathematics. Wrong answers just show us where to start —
              no pressure, no teaching, no scores shared with anyone.
            </p>
            <div className="flex flex-col gap-3 items-center">
              <button
                onClick={loadQuestions}
                disabled={loading}
                className="w-full sm:w-auto rounded-2xl bg-blue-600 px-8 py-4 text-[16px] font-extrabold text-white hover:bg-blue-700 min-h-[56px] cursor-pointer disabled:opacity-50 transition-all"
              >
                {loading ? 'Loading...' : 'Start placement check'}
                <ArrowRight className="h-5 w-5" />
              </button>
              <Link
                href="/home"
                className="mt-3 w-full sm:w-auto rounded-2xl border border-gray-200 bg-white px-8 py-3 text-[15px] font-extrabold text-ink-soft hover:bg-gray-50 min-h-[52px] cursor-pointer transition-all"
              >
                Skip — go to home
              </Link>
            </div>
            {error && <p className="mt-4 text-sm font-bold text-red-600">{error}</p>}
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'summary') {
    return (
      <div className="flex min-h-screen flex-col bg-paper">
        <div className="w-full max-w-xl mx-auto px-4 py-12">
          <div className="rounded-3xl border-2 border-emerald-200 bg-emerald-50/60 p-8 sm:p-10 text-center animate-pop">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
              <Check className="h-8 w-8 text-emerald-600" strokeWidth={3} />
            </span>
            <h1 className="font-display text-3xl font-medium text-black mb-3">Placement complete.</h1>
            <p className="mx-auto mt-3 max-w-sm text-[15px] font-semibold leading-relaxed text-ink-soft mb-6">
              Your results are recorded — they help us seed your review queue and target practice.
            </p>
            <div className="mx-auto mt-4 max-w-sm space-y-2 text-left">
              {summary?.map((s) => (
                <div key={s.subjectName} className="flex items-center justify-between rounded-2xl bg-white/70 border border-emerald-200 px-4 py-3">
                  <span className="text-sm font-extrabold text-black">{s.subjectName}</span>
                  <span className="text-sm font-extrabold text-emerald-700">{s.correct}/{s.total}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 items-center">
              <Link
                href="/home"
                className="w-full sm:w-auto rounded-2xl bg-blue-600 px-8 py-4 text-[16px] font-extrabold text-white hover:bg-blue-700 min-h-[56px] cursor-pointer transition-all"
              >
                Go to home <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

   // questions phase
   if (!q) return null

   return (
     <div className="flex min-h-screen flex-col bg-paper">
       <div className="w-full max-w-xl mx-auto px-4 py-8">
         <div className="flex items-center justify-between mb-2">
           <span className="text-xs font-extrabold text-ink-soft uppercase tracking-wider">
             Question {current} of {total}
           </span>
           <Link
             href="/home"
             className="text-sm font-bold text-ink-soft hover:text-blue-700 min-h-[36px]"
           >
             <ArrowLeft className="h-4 w-4 mr-1" /> Exit to home
           </Link>
         </div>
         <div className="rounded-3xl border border-blue-100/70 bg-white p-5 sm:p-7 shadow-[0_2px_16px_-8px_rgba(16,28,51,0.15)] min-h-[60vh] flex flex-col">
           <div className="mb-4 flex items-center justify-between">
             <span className="rounded-full bg-white border border-blue-100 px-3.5 py-1.5 text-xs font-extrabold text-ink-soft shadow-sm">
               {q.subjectName}
             </span>
           </div>
           <p className="font-display text-lg sm:text-xl font-medium leading-snug text-black mb-6">
             {q.questionText}
           </p>
           <div className="mt-4 space-y-2.5 flex-1">
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
           <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
             <button
               onClick={() => {
                 if (!selected || !confidence) return
                 setAnswers((prev) => [...prev, {
                   questionId: q.id,
                   subjectId: q.subjectId,
                   selectedAnswer: selected,
                   confidence: confidence!,
                 }])
                 setSelected(null)
                 setConfidence(null)
                 if (index < total - 1) setIndex((i) => i + 1)
                 else submitAnswers()
               }}
               disabled={!selected || !confidence || loading}
               className={`flex items-center gap-2 rounded-2xl px-6 py-3.5 text-[15px] font-extrabold text-white min-h-[52px] transition-all ${
                 selected && confidence && !loading
                   ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'
                   : 'bg-gray-300'
               }`}
             >
               {index < total - 1 ? 'Next' : (
                 <>
                   Finish placement <ArrowRight className="h-4 w-4" />
                 </>
               )}
             </button>
           </div>
         </div>
       </div>
     </div>
   )
 }