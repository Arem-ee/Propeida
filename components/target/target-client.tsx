'use client'

import { useState } from 'react'
import { Crosshair } from 'lucide-react'
import { setTargetSchool, type TargetState } from '@/lib/actions/targets'

const MODE_LABELS: Record<string, string> = {
  in_person_cbt: 'In-person CBT',
  online_proctored: 'Online proctored test',
  documentary: 'Documentary screening (no test)',
}

function screeningModeLabel(mode: string): string {
  return MODE_LABELS[mode] ?? mode
}

function num(v: string, max: number): number | null {
  if (v.trim() === '') return null
  const n = Number(v)
  if (!Number.isFinite(n) || n < 0 || n > max) return null
  return n
}

export default function TargetClient({ initial }: { initial: TargetState }) {
  const [schoolId, setSchoolId] = useState(initial.targetSchoolId ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [jamb, setJamb] = useState('')
  const [screening, setScreening] = useState('')
  const [olevel, setOlevel] = useState('')

  const screeningFacts = initial.screening
  const weights =
    screeningFacts &&
    screeningFacts.jambWeight !== null &&
    screeningFacts.screeningWeight !== null &&
    screeningFacts.olevelWeight !== null
      ? {
          jamb: screeningFacts.jambWeight,
          screening: screeningFacts.screeningWeight,
          olevel: screeningFacts.olevelWeight,
        }
      : null

  const jambScore = num(jamb, 400)
  const screeningScore = num(screening, 100)
  const olevelPoints = num(olevel, 20)
  const canEstimate =
    weights !== null && jambScore !== null && screeningScore !== null && olevelPoints !== null
  const aggregate = canEstimate
    ? (jambScore / 400) * weights.jamb +
      (screeningScore / 100) * weights.screening +
      (olevelPoints / 20) * weights.olevel
    : null

  const save = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      await setTargetSchool(schoolId || null)
      setSaved(true)
      if (schoolId !== initial.targetSchoolId) {
        window.location.reload()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save target')
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-[15px] font-extrabold text-black min-h-[52px] tabular-nums'

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-blue-100/70 bg-white p-5 sm:p-6 shadow-[0_2px_12px_-6px_rgba(16,28,51,0.12)]">
        <p className="flex items-center gap-2 font-display text-xl font-medium text-black">
          <Crosshair className="h-5 w-5 text-blue-600" />
          My target school
        </p>
        <div className="mt-3.5 flex flex-col sm:flex-row gap-2.5">
          <select
            value={schoolId}
            onChange={(e) => { setSchoolId(e.target.value); setSaved(false) }}
            className="flex-1 rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-[15px] font-extrabold text-black min-h-[52px] cursor-pointer"
          >
            <option value="">No target yet</option>
            {initial.schools.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <button
            onClick={() => void save()}
            disabled={saving}
            className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-blue-700 min-h-[52px] cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
        {error && <p className="mt-2 text-sm font-bold text-red-600">{error}</p>}
        {saved && <p className="mt-2 text-sm font-extrabold text-emerald-600">Saved.</p>}
      </div>

      {screeningFacts ? (
        <div className="rounded-3xl border-2 border-blue-100 bg-blue-50/50 p-5 sm:p-6">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-blue-700">
            {screeningFacts.year} screening
          </p>
          <h2 className="mt-1 font-display text-2xl font-medium text-black">
            {screeningModeLabel(screeningFacts.mode)}
          </h2>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              ['JAMB', screeningFacts.jambWeight],
              ['Screening', screeningFacts.screeningWeight],
              ['O-level', screeningFacts.olevelWeight],
            ].map(([label, w]) => (
              <div key={label as string} className="rounded-2xl bg-white border border-blue-100 px-3 py-2.5 text-center">
                <p className="font-display text-xl font-semibold text-black">{w === null ? '—' : `${w}%`}</p>
                <p className="text-[11px] font-extrabold text-gray-500">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-ink-soft">
            {screeningFacts.cutoff !== null && <span>Cutoff: {screeningFacts.cutoff}</span>}
            {screeningFacts.sittingsAllowed !== null && <span>O-level sittings: {screeningFacts.sittingsAllowed}</span>}
          </div>
          {screeningFacts.source && (
            <p className="mt-2 text-[11px] font-semibold text-gray-500">Source: {screeningFacts.source}</p>
          )}
        </div>
      ) : (
        schoolId !== '' && (
          <div className="rounded-3xl border-2 border-dashed border-blue-200 bg-white/70 p-5 text-center">
            <p className="text-sm font-semibold text-ink-soft">
              No screening facts on file for this school yet — they land here once verified.
            </p>
          </div>
        )
      )}

      {weights && (
        <div className="rounded-3xl border border-blue-100/70 bg-white p-5 sm:p-6 shadow-[0_2px_12px_-6px_rgba(16,28,51,0.12)]">
          <p className="font-display text-xl font-medium text-black">Aggregate estimator</p>
          <p className="mt-0.5 text-[13px] font-semibold text-ink-soft">
            O-level: sum your 5 best grades (A1 = 4 each, max 20).
          </p>
          <div className="mt-3.5 grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] font-extrabold text-gray-500 mb-1.5">JAMB /400</label>
              <input value={jamb} onChange={(e) => setJamb(e.target.value)} inputMode="decimal" placeholder="240" className={inputClass} />
            </div>
            <div>
              <label className="block text-[11px] font-extrabold text-gray-500 mb-1.5">Screening %</label>
              <input value={screening} onChange={(e) => setScreening(e.target.value)} inputMode="decimal" placeholder="70" className={inputClass} />
            </div>
            <div>
              <label className="block text-[11px] font-extrabold text-gray-500 mb-1.5">O-level /20</label>
              <input value={olevel} onChange={(e) => setOlevel(e.target.value)} inputMode="decimal" placeholder="16" className={inputClass} />
            </div>
          </div>
          <div className={`mt-4 rounded-2xl px-4 py-3.5 text-center ${
            aggregate === null
              ? 'bg-gray-50 text-gray-500'
              : 'bg-blue-50 text-blue-800'
          }`}>
            {aggregate === null ? (
              <p className="text-sm font-bold">Fill all three for your estimate.</p>
            ) : (
              <>
                <p className="font-display text-3xl font-semibold">{aggregate.toFixed(1)}</p>
                <p className="mt-0.5 text-xs font-extrabold">
                  {screeningFacts?.cutoff !== null && screeningFacts?.cutoff !== undefined
                    ? `Last published cutoff: ${screeningFacts.cutoff} — cutoffs move yearly, treat this as a guide.`
                    : 'Estimate only — no published cutoff on file to compare against.'}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
