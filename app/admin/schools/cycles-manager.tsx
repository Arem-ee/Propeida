'use client'

import { useState, useEffect, useCallback } from 'react'

interface Cycle {
  id: string
  exam_id: string
  year: number
  starts_at: string | null
  ends_at: string | null
  verified: boolean
  source: string | null
  exams: { name: string } | { name: string }[] | null
}

const inputClass = 'w-full rounded-xl border border-gray-200 px-3 py-2 text-sm min-h-[44px]'
const labelClass = 'block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5'

function toDateInput(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export default function CyclesManager({ exams }: { exams: { id: string; name: string; slug: string }[] }) {
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [examId, setExamId] = useState(exams[0]?.id ?? '')
  const [year, setYear] = useState(String(new Date().getFullYear() + 1))
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [verified, setVerified] = useState(false)
  const [source, setSource] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/cycles')
    const data = await res.json()
    if (res.ok) setCycles(data.cycles ?? [])
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const reset = () => {
    setEditingId(null)
    setStartsAt('')
    setEndsAt('')
    setVerified(false)
    setSource('')
    setError(null)
  }

  const startEdit = (c: Cycle) => {
    setEditingId(c.id)
    setStartsAt(toDateInput(c.starts_at))
    setEndsAt(toDateInput(c.ends_at))
    setVerified(c.verified)
    setSource(c.source ?? '')
    setError(null)
  }

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/cycles', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          editingId
            ? { id: editingId, starts_at: startsAt || null, ends_at: endsAt || null, verified, source }
            : { exam_id: examId, year, starts_at: startsAt || null, ends_at: endsAt || null, verified, source },
        ),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Save failed')
      reset()
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!window.confirm('Delete this exam cycle? Countdowns depending on it go quiet.')) return
    await fetch(`/api/admin/cycles?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    await load()
  }

  const examName = (c: Cycle) => {
    const e = Array.isArray(c.exams) ? c.exams[0] : c.exams
    return e?.name ?? '-'
  }

  return (
    <div className="space-y-4">
      {cycles.map((c) => (
        <div key={c.id} className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-base font-extrabold text-gray-900">
                {examName(c)} {c.year}
              </p>
              <p className="text-xs font-semibold text-gray-500">
                {c.verified
                  ? `Verified${c.starts_at ? ` · starts ${toDateInput(c.starts_at)}` : ''}`
                  : 'Unverified — no countdown renders'}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => startEdit(c)}
                className="rounded-xl border border-gray-200 px-3.5 py-2 text-xs font-bold text-gray-600 min-h-[40px] cursor-pointer"
              >
                Edit
              </button>
              <button
                onClick={() => void remove(c.id)}
                className="rounded-xl border border-red-200 px-3.5 py-2 text-xs font-bold text-red-600 min-h-[40px] cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}

      {cycles.length === 0 && (
        <p className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
          No exam cycles yet. Add the first one below.
        </p>
      )}

      <div className="rounded-2xl border-2 border-blue-100 bg-blue-50/40 p-4 space-y-3">
        <p className="text-sm font-extrabold text-gray-900">{editingId ? 'Edit cycle' : 'Add exam cycle'}</p>
        {!editingId && (
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className={labelClass}>Exam</label>
              <select value={examId} onChange={(e) => setExamId(e.target.value)} className={inputClass}>
                {exams.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Year</label>
              <input value={year} onChange={(e) => setYear(e.target.value)} inputMode="numeric" className={inputClass} />
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className={labelClass}>Starts (optional)</label>
            <input type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Ends (optional)</label>
            <input type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className={inputClass} />
          </div>
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 min-h-[48px]">
          <input
            type="checkbox"
            checked={verified}
            onChange={(e) => setVerified(e.target.checked)}
            className="h-5 w-5 rounded border-gray-300 text-blue-600 cursor-pointer"
          />
          <span className="text-sm font-bold text-gray-800">
            Verified <span className="font-semibold text-gray-400">— only checked with an official source. This switch turns countdowns on.</span>
          </span>
        </label>
        <div>
          <label className={labelClass}>Source</label>
          <input
            value={source} onChange={(e) => setSource(e.target.value)}
            placeholder="e.g. JAMB weekly bulletin, 14 Apr 2026"
            className={inputClass}
          />
        </div>
        {error && <p className="text-sm font-bold text-red-600">{error}</p>}
        <div className="flex gap-2.5">
          <button
            onClick={() => void save()}
            disabled={saving}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 min-h-[44px] cursor-pointer"
          >
            {saving ? 'Saving...' : editingId ? 'Save changes' : 'Add cycle'}
          </button>
          {editingId && (
            <button
              onClick={reset}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-600 min-h-[44px] cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
