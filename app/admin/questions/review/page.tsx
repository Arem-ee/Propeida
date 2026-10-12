'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, ShieldCheck, Quote, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ReviewItem {
  id: string
  exam_id: string
  subject_id: string
  question_text: string
  options: { key: string; text: string }[] | Record<string, string>
  correct_answer: string
  explanation: string | null
  difficulty: string
  cognitive_level: string | null
  status: string
  verified_state: string
  review_note: string | null
  exams: { name: string } | { name: string }[] | null
  subjects: { name: string } | { name: string }[] | null
}

function optionsList(options: ReviewItem['options']): { key: string; text: string }[] {
  if (Array.isArray(options)) return options
  return Object.entries(options ?? {}).map(([key, text]) => ({ key, text: String(text) }))
}

export default function QuestionReviewPage() {
  const [items, setItems] = useState<ReviewItem[]>([])
  const [acting, setActing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('questions')
      .select('id, exam_id, subject_id, question_text, options, correct_answer, explanation, difficulty, cognitive_level, status, verified_state, review_note, exams!questions_exam_id_fkey(name), subjects(name)')
      .in('status', ['draft', 'in_review'])
      .order('created_at', { ascending: true })
    setItems((data ?? []) as ReviewItem[])
  }, [])

  useEffect(() => { void load() }, [load])

  const transition = async (item: ReviewItem, change: { status?: string; verified_state?: string }) => {
    setActing(item.id)
    setError(null)
    try {
      const res = await fetch('/api/admin/questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          exam_id: item.exam_id,
          subject_id: item.subject_id,
          question_text: item.question_text,
          options: item.options,
          correct_answer: item.correct_answer,
          explanation: item.explanation,
          difficulty: item.difficulty,
          cognitive_level: item.cognitive_level,
          ...change,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Transition failed')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transition failed')
    } finally {
      setActing(null)
    }
  }

  return (
    <div>
      <Link
        href="/admin/questions"
        className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-blue-700 min-h-[36px]"
      >
        <ArrowLeft className="h-4 w-4" /> Questions
      </Link>
      <h1 className="text-2xl font-extrabold text-gray-900">Review queue</h1>
      <p className="mt-1 text-sm font-semibold text-gray-500">
        {items.length} waiting · nothing publishes while unverified — verify first, then publish.
      </p>

      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>
      )}

      <div className="mt-6 space-y-4">
        {items.map((item) => {
          const exam = Array.isArray(item.exams) ? item.exams[0] : item.exams
          const subject = Array.isArray(item.subjects) ? item.subjects[0] : item.subjects
          const busy = acting === item.id
          return (
            <article key={item.id} className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-gray-500">
                <span>{(exam as { name?: string })?.name ?? '-'}</span>
                <span aria-hidden>·</span>
                <span>{(subject as { name?: string })?.name ?? '-'}</span>
                <span aria-hidden>·</span>
                <span>{item.difficulty}</span>
                {item.cognitive_level && (
                  <>
                    <span aria-hidden>·</span>
                    <span>{item.cognitive_level}</span>
                  </>
                )}
                <span className={`ml-auto inline-flex items-center rounded-full px-2.5 py-0.5 ${
                  item.status === 'in_review' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {item.status.replace('_', ' ')}
                </span>
              </div>

              <p className="mt-2 text-[15px] font-bold text-gray-900">{item.question_text}</p>
              <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
                {optionsList(item.options).map((o) => (
                  <div
                    key={o.key}
                    className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                      o.key === item.correct_answer
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <span className="font-extrabold">{o.key.toUpperCase()}.</span> {o.text}
                  </div>
                ))}
              </div>
              {item.explanation && (
                <p className="mt-2 text-[13px] font-semibold text-gray-500">{item.explanation}</p>
              )}
              {item.review_note && (
                <p className="mt-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-[13px] font-bold text-amber-800">
                  Note: {item.review_note}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  disabled={busy}
                  onClick={() => void transition(item, { status: 'in_review' })}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-extrabold text-gray-600 hover:bg-gray-50 min-h-[44px] cursor-pointer disabled:opacity-50"
                >
                  Mark in review
                </button>
                <button
                  disabled={busy}
                  onClick={() => void transition(item, { verified_state: 'source_cited' })}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 px-4 py-2 text-xs font-extrabold text-amber-800 hover:bg-amber-50 min-h-[44px] cursor-pointer disabled:opacity-50"
                >
                  <Quote className="h-3.5 w-3.5" /> Source-cited 🔶
                </button>
                <button
                  disabled={busy}
                  onClick={() => void transition(item, { verified_state: 'human_verified' })}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 px-4 py-2 text-xs font-extrabold text-emerald-800 hover:bg-emerald-50 min-h-[44px] cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> Human-verified ✅
                </button>
                <button
                  disabled={busy}
                  onClick={() => void transition(item, { status: 'published' })}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-blue-700 min-h-[44px] cursor-pointer disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" /> {busy ? 'Working…' : 'Publish'}
                </button>
                <button
                  disabled={busy}
                  onClick={() => void transition(item, { status: 'rejected' })}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2 text-xs font-extrabold text-red-600 hover:bg-red-50 min-h-[44px] cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="h-3.5 w-3.5" /> Reject
                </button>
                <Link
                  href={`/admin/questions/${item.id}/edit`}
                  className="inline-flex items-center rounded-xl px-4 py-2 text-xs font-extrabold text-blue-600 hover:bg-blue-50 min-h-[44px]"
                >
                  Full edit
                </Link>
              </div>
            </article>
          )
        })}
        {items.length === 0 && (
          <p className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center text-sm font-semibold text-gray-500">
            Queue clear — every question is published or rejected.
          </p>
        )}
      </div>
    </div>
  )
}
