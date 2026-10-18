'use client'

import { useState, useEffect } from 'react'

export interface MisconceptionDraft {
  option_key: string
  misconception_code: string
  misconception_name: string
  explanation: string
  repair_note_id: string
}

export interface MisconceptionInitial {
  misconception_code: string
  misconception_name: string
  explanation: string
  repair_note_id: string
}

/**
 * Per-distractor misconception authoring. All four options render; the
 * correct option's block is disabled (a misconception names the error a
 * WRONG option reveals). Disabled inputs are never submitted, so changing
 * the correct answer can never produce a server rejection.
 */
export default function MisconceptionFields({
  correctAnswer,
  subjectId,
  initial = {},
}: {
  correctAnswer: string
  subjectId: string
  initial?: Record<string, MisconceptionInitial>
}) {
  const [codes, setCodes] = useState<{ code: string; name: string }[]>([])

  useEffect(() => {
    if (!subjectId) {
      setCodes([])
      return
    }
    fetch(`/api/admin/codes?subject_id=${encodeURIComponent(subjectId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setCodes(data?.codes ?? []))
      .catch(() => setCodes([]))
  }, [subjectId])
  return (
    <div className="rounded-2xl border border-gray-200 p-5 space-y-5">
      <div>
        <h3 className="text-sm font-extrabold text-gray-900">Misconceptions (optional)</h3>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          For each wrong option, name the error it reveals and how to repair it.
          Leave an option blank to skip it.
        </p>
      </div>

      {['a', 'b', 'c', 'd', 'e'].map((key) => {
        const prev = initial[key]
        const isCorrect = key === correctAnswer
        return (
          <div key={key} className={`rounded-xl border p-4 space-y-3 ${isCorrect ? 'border-gray-100 bg-gray-50 opacity-60' : 'border-gray-100 bg-gray-50/50'}`}>
            <p className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
              Option {key.toUpperCase()}
              {isCorrect && <span className="ml-2 font-semibold normal-case text-gray-500">correct — no misconception needed</span>}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Code</label>
                {codes.length > 0 ? (
                  <select
                    name={`mc_code_${key}`}
                    defaultValue={prev?.misconception_code ?? ''}
                    disabled={isCorrect}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm min-h-[44px] font-mono"
                  >
                    <option value="">Select code</option>
                    {codes.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} — {c.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <>
                    <input
                      name={`mc_code_${key}`}
                      defaultValue={prev?.misconception_code ?? ''}
                      disabled={isCorrect}
                      placeholder="e.g. sign-error"
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm min-h-[44px] font-mono"
                    />
                    <p className="mt-1 text-[11px] text-amber-600">
                      No codes for this subject yet —{' '}
                      <a href="/admin/codes" className="underline font-bold">add them first</a>.
                    </p>
                  </>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Name</label>
                <input
                  name={`mc_name_${key}`}
                  defaultValue={prev?.misconception_name ?? ''}
                  disabled={isCorrect}
                  placeholder="e.g. Drops the negative sign"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm min-h-[44px]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Why it tempts + repair</label>
              <textarea
                name={`mc_explanation_${key}`}
                defaultValue={prev?.explanation ?? ''}
                disabled={isCorrect}
                rows={2}
                placeholder="Why a student picks this, and the one thing that fixes it."
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm resize-y"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Repair note id (optional)</label>
              <input
                name={`mc_repair_${key}`}
                defaultValue={prev?.repair_note_id ?? ''}
                disabled={isCorrect}
                placeholder="e.g. maths-quadratic-roots"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm min-h-[44px]"
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/**
 * Collect non-empty rows from a submitted admin question form. Disabled
 * (correct-option) inputs are never submitted, so they never appear here.
 */
export function collectMisconceptions(form: FormData): MisconceptionDraft[] {
  const rows: MisconceptionDraft[] = []
  for (const key of ['a', 'b', 'c', 'd', 'e']) {
    const code = ((form.get(`mc_code_${key}`) as string | null) ?? '').trim()
    const name = ((form.get(`mc_name_${key}`) as string | null) ?? '').trim()
    const explanation = ((form.get(`mc_explanation_${key}`) as string | null) ?? '').trim()
    const repair = ((form.get(`mc_repair_${key}`) as string | null) ?? '').trim()
    if (!code && !name && !explanation) continue
    rows.push({
      option_key: key,
      misconception_code: code,
      misconception_name: name,
      explanation,
      repair_note_id: repair,
    })
  }
  return rows
}

