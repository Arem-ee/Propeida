'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export interface Screening {
  id: string
  year: number
  mode: string
  jamb_weight: number | null
  screening_weight: number | null
  olevel_weight: number | null
  cutoff: number | null
  sittings_allowed: number | null
  source: string | null
}

const MODES = [
  { value: 'in_person_cbt', label: 'In-person CBT' },
  { value: 'online_proctored', label: 'Online proctored test' },
  { value: 'documentary', label: 'Documentary screening (no test)' },
]

const inputClass = 'w-full rounded-xl border border-gray-200 px-3 py-2 text-sm min-h-[44px]'
const labelClass = 'block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5'

function emptyForm() {
  return {
    year: String(new Date().getFullYear()),
    mode: 'in_person_cbt',
    jamb_weight: '50',
    screening_weight: '30',
    olevel_weight: '20',
    cutoff: '',
    sittings_allowed: '2',
    source: '',
  }
}

export default function ScreeningsManager({
  schoolId,
  initial,
}: {
  schoolId: string
  initial: Screening[]
}) {
  const router = useRouter()
  const [rows, setRows] = useState<Screening[]>(initial)
  const [form, setForm] = useState(emptyForm())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (k: string, v: string) => setForm((prev) => ({ ...prev, [k]: v }))

  const reload = async () => {
    const res = await fetch(`/api/admin/screenings?school_id=${encodeURIComponent(schoolId)}`)
    const data = await res.json()
    if (res.ok) setRows(data.screenings ?? [])
    router.refresh()
  }

  const startEdit = (row: Screening) => {
    setEditingId(row.id)
    setForm({
      year: String(row.year),
      mode: row.mode,
      jamb_weight: row.jamb_weight === null ? '' : String(row.jamb_weight),
      screening_weight: row.screening_weight === null ? '' : String(row.screening_weight),
      olevel_weight: row.olevel_weight === null ? '' : String(row.olevel_weight),
      cutoff: row.cutoff === null ? '' : String(row.cutoff),
      sittings_allowed: row.sittings_allowed === null ? '' : String(row.sittings_allowed),
      source: row.source ?? '',
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm())
    setError(null)
  }

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      const payload = editingId
        ? { id: editingId, ...form }
        : { school_id: schoolId, ...form }
      const res = await fetch('/api/admin/screenings', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Save failed')
      cancelEdit()
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string, year: number) => {
    if (!window.confirm(`Delete the ${year} screening facts?`)) return
    await fetch(`/api/admin/screenings?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    await reload()
  }

  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <div key={row.id} className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-base font-extrabold text-gray-900">{row.year}</p>
              <p className="text-xs font-semibold text-gray-500">
                {MODES.find((m) => m.value === row.mode)?.label ?? row.mode}
                {' · '}
                {[row.jamb_weight, row.screening_weight, row.olevel_weight]
                  .map((w) => (w === null ? '—' : `${w}%`))
                  .join(' / ')}
                {row.cutoff !== null && ` · cutoff ${row.cutoff}`}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => startEdit(row)}
                className="rounded-xl border border-gray-200 px-3.5 py-2 text-xs font-bold text-gray-600 min-h-[40px] cursor-pointer"
              >
                Edit
              </button>
              <button
                onClick={() => void remove(row.id, row.year)}
                className="rounded-xl border border-red-200 px-3.5 py-2 text-xs font-bold text-red-600 min-h-[40px] cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}

      {rows.length === 0 && (
        <p className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
          No screening facts yet. Add the first year below — unknowns stay blank, never guessed.
        </p>
      )}

      <div className="rounded-2xl border-2 border-blue-100 bg-blue-50/40 p-4 space-y-3">
        <p className="text-sm font-extrabold text-gray-900">{editingId ? 'Edit screening' : 'Add screening year'}</p>
        <div className="grid grid-cols-3 gap-2.5">
          <div>
            <label className={labelClass}>Year</label>
            <input
              value={form.year} onChange={(e) => set('year', e.target.value)}
              inputMode="numeric" placeholder="2025"
              className={inputClass} disabled={!!editingId}
            />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Mode</label>
            <select value={form.mode} onChange={(e) => set('mode', e.target.value)} className={inputClass}>
              {MODES.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {([
            ['jamb_weight', 'JAMB %'],
            ['screening_weight', 'Screening %'],
            ['olevel_weight', 'O-level %'],
          ] as const).map(([key, label]) => (
            <div key={key}>
              <label className={labelClass}>{label}</label>
              <input
                value={form[key]} onChange={(e) => set(key, e.target.value)}
                inputMode="numeric" placeholder="—"
                className={inputClass}
              />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className={labelClass}>Cutoff</label>
            <input
              value={form.cutoff} onChange={(e) => set('cutoff', e.target.value)}
              inputMode="numeric" placeholder="—"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>O-level sittings</label>
            <input
              value={form.sittings_allowed} onChange={(e) => set('sittings_allowed', e.target.value)}
              inputMode="numeric" placeholder="—"
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Source (notice URL or name)</label>
          <input
            value={form.source} onChange={(e) => set('source', e.target.value)}
            placeholder="e.g. unilorin.edu.ng 2025 screening notice"
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
            {saving ? 'Saving...' : editingId ? 'Save changes' : 'Add year'}
          </button>
          {editingId && (
            <button
              onClick={cancelEdit}
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
