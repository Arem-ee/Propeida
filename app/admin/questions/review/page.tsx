'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Check, ShieldCheck, Quote, XCircle, Inbox, PenLine } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import PageHeader from '@/components/admin/page-header'
import { FormError } from '@/components/admin/form'
import { QuestionStatusPill } from '@/components/admin/badge'
import { parseExplanation } from '@/lib/lessons'

interface ReviewItem {
  id: string
  exam_id: string
  subject_id: string
  question_text: string
  options: { key: string; text: string }[] | Record<string, string>
  correct_answer: string
  explanation: string | null
  steps: { operation: string; reason: string; result: string; predictPrompt?: string }[] | null
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

interface ReviewHistory {
  question_id: string
  verified_state: string
  note: string | null
  created_at: string
}

export default function QuestionReviewPage() {
  const [items, setItems] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<Record<string, ReviewHistory[]>>({})
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [acting, setActing] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refused, setRefused] = useState<{ id: string; text: string }[]>([])

  const load = useCallback(async () => {
    const supabase = createClient()
    // The answer key is not readable by a signed-in learner. The review
    // queue is served by a definer function that checks the caller is an
    // admin, so a reviewer can still see the key they are verifying.
    const { data } = await supabase.rpc('get_question_review_queue')
    const rows = (data ?? []) as unknown as ReviewItem[]
    setItems(rows)
    setSelected((prev) => new Set([...prev].filter((id) => rows.some((r) => r.id === id))))
    setLoading(false)
    if (rows.length > 0) {
      const { data: hist } = await supabase
        .from('question_reviews')
        .select('question_id, verified_state, note, created_at')
        .in('question_id', rows.map((r) => r.id))
        .order('created_at', { ascending: false })
      const grouped: Record<string, ReviewHistory[]> = {}
      for (const h of (hist ?? []) as ReviewHistory[]) {
        if (!grouped[h.question_id]) grouped[h.question_id] = []
        grouped[h.question_id]!.push(h)
      }
      setHistory(grouped)
    } else {
      setHistory({})
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    setSelected((prev) => (prev.size === items.length ? new Set() : new Set(items.map((i) => i.id))))
  }

  const bulkPublish = async () => {
    if (selected.size === 0 || publishing) return
    setPublishing(true)
    setError(null)
    setRefused([])
    try {
      const res = await fetch('/api/admin/questions/bulk-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected) }),
      })
      const data = await res.json()
      if (!res.ok) {
        setRefused(data.refused ?? [])
        throw new Error(data.error ?? 'Bulk publish failed')
      }
      setSelected(new Set())
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk publish failed')
    } finally {
      setPublishing(false)
    }
  }

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
      <PageHeader
        eyebrow="Content · Review"
        title="Review queue"
        description="Verify each question against its source before publishing. Source-cited means you saw where the answer comes from. Human-verified means you solved it yourself. Unverified stays out of learner sessions"
        actions={
          <Link
            href="/admin/questions"
            className="inline-flex min-h-[44px] items-center rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-ink-soft hover:bg-gray-50"
          >
            Question bank
          </Link>
        }
      />

      {error && (
        <div className="mt-4">
          <FormError>{error}</FormError>
        </div>
      )}
      {refused.length > 0 && (
        <div role="alert" className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3">
          <p className="text-sm font-extrabold text-amber-800">Still unverified — verify these first, then re-publish:</p>
          <ul className="mt-1.5 list-disc pl-5 text-[13px] font-semibold text-amber-900">
            {refused.map((r) => (
              <li key={r.id}>{r.text}…</li>
            ))}
          </ul>
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2.5 rounded-2xl border border-blue-200 bg-blue-50/60 p-3.5">
          <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 text-xs font-extrabold text-blue-900">
            <input
              type="checkbox"
              checked={selected.size === items.length}
              onChange={toggleSelectAll}
              className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600"
            />
            Select all ({items.length})
          </label>
          <span className="text-xs font-bold text-blue-700">{selected.size} selected</span>
          <button
            onClick={() => void bulkPublish()}
            disabled={selected.size === 0 || publishing}
            className="ml-auto cursor-pointer rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-extrabold text-white hover:bg-blue-700 min-h-[44px] disabled:opacity-50"
          >
            {publishing ? 'Publishing…' : `Publish selected (${selected.size})`}
          </button>
        </div>
      )}

      <div className="mt-5 space-y-5">
        {items.map((item) => {
          const exam = Array.isArray(item.exams) ? item.exams[0] : item.exams
          const subject = Array.isArray(item.subjects) ? item.subjects[0] : item.subjects
          const busy = acting === item.id
          const itemHistory = history[item.id] ?? []
          const meta = [
            (exam as { name?: string })?.name,
            (subject as { name?: string })?.name,
            item.difficulty,
            item.cognitive_level,
          ].filter(Boolean) as string[]

          return (
            <article
              key={item.id}
              className="overflow-hidden rounded-2xl border border-blue-100/70 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]"
            >
              {/* 1 · meta strip — context only, deliberately quiet */}
              <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/70 py-2 pl-4 pr-4 text-[11px] font-bold text-ink-soft">
                <input
                  type="checkbox"
                  checked={selected.has(item.id)}
                  onChange={() => toggleSelect(item.id)}
                  aria-label="Select for bulk publish"
                  className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600"
                />
                <span className="min-w-0 truncate capitalize">
                  {meta.join(' · ')}
                </span>
                <span className="ml-auto shrink-0"><QuestionStatusPill status={item.status} /></span>
              </div>

              {/* 2 · the question — the dominant voice in the card */}
              <div className="px-5 pt-4">
                <h3 className="font-display text-[17px] font-medium leading-snug text-black">
                  {item.question_text}
                </h3>
              </div>

              {/* 3 · options — scannable grid, key marked only for the reviewer */}
              <div className="grid gap-2 px-5 pt-3 sm:grid-cols-2">
                {optionsList(item.options).map((o) => {
                  const isKey = o.key === item.correct_answer
                  return (
                    <div
                      key={o.key}
                      className={`flex items-start gap-2.5 rounded-xl border px-3 py-2.5 ${
                        isKey
                          ? 'border-emerald-400 bg-emerald-50/70'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-extrabold ${
                          isKey ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-ink-soft'
                        }`}
                      >
                        {o.key.toUpperCase()}
                      </span>
                      <span className={`min-w-0 text-[13px] font-semibold leading-snug ${isKey ? 'text-emerald-900' : 'text-ink-soft'}`}>
                        {o.text}
                      </span>
                      {isKey && <Check className="ml-auto h-4 w-4 shrink-0 self-center text-emerald-600" aria-hidden />}
                    </div>
                  )
                })}
              </div>

              {Array.isArray(item.steps) && item.steps.length > 0 && (
                <div className="mx-5 mt-3 rounded-xl border border-blue-100 bg-blue-50/40 px-4 py-3">
                  <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-blue-700/70">Worked steps</span>
                  <ol className="list-decimal space-y-1 pl-5 text-[13px] font-semibold leading-relaxed text-ink-soft">
                    {item.steps.map((s, i) => (
                      <li key={i}>
                        <span className="font-bold text-black">{s.operation}</span> — {s.reason}{' '}
                        <em className="not-italic text-ink-soft/80">⇒ {s.result}</em>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* 4 · reasoning — one quiet panel, small caps labels, only when present */}
              {(item.explanation || item.review_note) && (
                <div className="mx-5 mt-4 space-y-2.5 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
                  {item.explanation && (() => {
                    const parsed = parseExplanation(item.explanation)
                    if (parsed.format === 'worked-steps-v1' && parsed.steps) {
                      return (
                        <div className="text-[13px] font-semibold leading-relaxed text-ink-soft">
                          <span className="mb-0.5 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink-soft/60">Worked steps</span>
                          <ol className="mt-1 list-decimal space-y-1 pl-5">
                            {parsed.steps.map((s, i) => (
                              <li key={i}><span className="font-bold text-black">{s.operation}</span> — {s.reason} <em className="not-italic text-ink-soft/80">⇒ {s.result}</em></li>
                            ))}
                          </ol>
                        </div>
                      )
                    }
                    return (
                      <p className="text-[13px] font-semibold leading-relaxed text-ink-soft">
                        <span className="mb-0.5 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink-soft/60">Reasoning</span>
                        {item.explanation}
                      </p>
                    )
                  })()}
                  {item.review_note && (
                    <p className="border-t border-gray-200/60 pt-2 text-[13px] font-semibold leading-relaxed text-amber-900">
                      <span className="mb-0.5 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-amber-700/70">Review note</span>
                      {item.review_note}
                    </p>
                  )}
                </div>
              )}

              {/* 5 · verification trail — collapsed by default */}
              {itemHistory.length > 0 && (
                <div className="px-5 pt-3">
                  <details className="text-[13px]">
                    <summary className="min-h-[32px] cursor-pointer font-extrabold text-ink-soft">
                      Verification trail ({itemHistory.length})
                    </summary>
                    <ul className="mt-1.5 space-y-1.5">
                      {itemHistory.map((h, i) => (
                        <li key={i} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 font-semibold text-gray-600">
                          {h.verified_state.replace('_', ' ')} · {new Date(h.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {h.note ? ` — ${h.note}` : ''}
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              )}

              {/* 6 · actions — grouped by intent, one primary button */}
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 px-5 py-3">
                <Link
                  href={`/admin/questions/${item.id}/edit`}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-ink-soft hover:bg-gray-100"
                >
                  <PenLine className="h-3.5 w-3.5" aria-hidden />
                  Full edit
                </Link>
                <button
                  disabled={busy}
                  onClick={() => void transition(item, { status: 'in_review' })}
                  className="min-h-[40px] cursor-pointer rounded-xl px-3 py-2 text-xs font-bold text-ink-soft hover:bg-gray-100 disabled:opacity-50"
                >
                  Mark in review
                </button>
                <span className="hidden h-5 w-px bg-gray-200 sm:block" aria-hidden />
                <button
                  disabled={busy}
                  onClick={() => void transition(item, { verified_state: 'source_cited' })}
                  className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-xl border border-amber-300 px-3 py-2 text-xs font-extrabold text-amber-800 hover:bg-amber-50 disabled:opacity-50"
                >
                  <Quote className="h-3.5 w-3.5" aria-hidden />
                  Source-cited
                </button>
                <button
                  disabled={busy}
                  onClick={() => void transition(item, { verified_state: 'human_verified' })}
                  className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-xl border border-emerald-300 px-3 py-2 text-xs font-extrabold text-emerald-800 hover:bg-emerald-50 disabled:opacity-50"
                >
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                  Human-verified
                </button>

                <span className="ml-auto flex items-center gap-2">
                  <button
                    disabled={busy}
                    onClick={() => void transition(item, { status: 'rejected' })}
                    className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-extrabold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <XCircle className="h-3.5 w-3.5" aria-hidden />
                    Reject
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => void transition(item, { status: 'published' })}
                    className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" aria-hidden />
                    {busy ? 'Working…' : 'Publish'}
                  </button>
                </span>
              </div>
            </article>
          )
        })}
        {!loading && items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-14 text-center">
            <Inbox className="mx-auto h-8 w-8 text-gray-300" aria-hidden />
            <p className="mt-3 text-sm font-extrabold text-black">Queue clear</p>
            <p className="mt-1 text-sm font-semibold text-ink-soft">Every question is published or rejected</p>
          </div>
        )}
        {loading && (
          <p className="rounded-2xl border border-gray-100 bg-white p-14 text-center text-sm font-semibold text-ink-soft">
            Loading the queue...
          </p>
        )}
      </div>
    </div>
  )
}
