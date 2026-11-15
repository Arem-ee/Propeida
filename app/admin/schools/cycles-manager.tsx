'use client'

import { useState, useEffect, useCallback } from 'react'
import { inputClass, labelClass, FormError } from '@/components/admin/form'
import { useConfirm } from '@/components/admin/confirm'

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
  const { confirm, dialog } = useConfirm()

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
    const ok = await confirm({
      title: 'Delete this exam cycle?',
      body: 'Countdowns that depend on it go quiet',
      confirmLabel: 'Delete cycle',
      tone: 'danger',
    })
    if (!ok) return
    await fetch(`/api/admin/cycles?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    await load()
  }

  const examName = (c: Cycle) => {
    const e = Array.isArray(c.exams) ? c.exams[0] : c.exams
    return e?.name ?? '-'
  }

  return (
    <div className="space-y-4">
      {dialog}
      {cycles.map((c) => (
        <div key={c.id} className="rounded-2xl border border-blue-100/70 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-base font-extrabold text-black">
                {examName(c)} {c.year}
              </p>
              <p className="text-xs font-semibold text-ink-soft">
                {c.verified
                  ? `Verified${c.starts_at ? ` · starts ${toDateInput(c.starts_at)}` : ''}`
                  : 'Unverified — no countdown renders'}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => startEdit(c)}
                className="min-h-[40px] cursor-pointer rounded-xl border border-gray-200 px-3.5 py-2 text-xs font-bold text-ink-soft hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                onClick={() => void remove(c.id)}
                className="min-h-[40px] cursor-pointer rounded-xl border border-red-200 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}

      {cycles.length === 0 && (
        <p className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center text-sm text-ink-soft">
          No exam cycles are here yet, so add the first one below
        </p>
      )}

      <div className="space-y-3 rounded-2xl border border-blue-200/70 bg-blue-50/40 p-4">
        <p className="text-sm font-extrabold text-black">{editingId ? 'Edit cycle' : 'Add exam cycle'}</p>
        {!editingId && (
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className={labelClass} htmlFor="cycle-exam">Exam</label>
              <select id="cycle-exam" value={examId} onChange={(e) => setExamId(e.target.value)} className={inputClass}>
                {exams.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="cycle-year">Year</label>
              <input id="cycle-year" value={year} onChange={(e) => setYear(e.target.value)} inputMode="numeric" className={inputClass} />
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className={labelClass} htmlFor="cycle-starts">Starts (optional)</label>
            <input id="cycle-starts" type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="cycle-ends">Ends (optional)</label>
            <input id="cycle-ends" type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className={inputClass} />
          </div>
        </div>
        <label className="flex min-h-[48px] cursor-pointer items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5">
          <input
            type="checkbox"
            checked={verified}
            onChange={(e) => setVerified(e.target.checked)}
            className="h-5 w-5 cursor-pointer rounded border-gray-300 text-blue-600"
          />
          <span className="text-sm font-bold text-gray-800">
            Verified <span className="font-semibold text-ink-soft">— someone checked this against an official source, and this switch turns countdowns on</span>
          </span>
        </label>
        <div>
          <label className={labelClass} htmlFor="cycle-source">Source</label>
          <input
            id="cycle-source"
            value={source} onChange={(e) => setSource(e.target.value)}
            placeholder="e.g. JAMB weekly bulletin, 14 Apr 2026"
            className={inputClass}
          />
        </div>
        {error && <FormError>{error}</FormError>}
        <div className="flex gap-2.5">
          <button
            onClick={() => void save()}
            disabled={saving}
            className="min-h-[44px] cursor-pointer rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : editingId ? 'Save changes' : 'Add cycle'}
          </button>
          {editingId && (
            <button
              onClick={reset}
              className="min-h-[44px] cursor-pointer rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-ink-soft hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
