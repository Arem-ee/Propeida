'use client'

import { useState } from 'react'

export default function NewSchoolForm({ onAdded }: { onAdded: () => void }) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || saving) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to add school')
      setName('')
      onAdded()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add school')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="text-base font-extrabold text-gray-900">Add a school</h2>
      <p className="mt-1 text-xs text-gray-500">Type the full name — the URL slug is generated for you.</p>
      <div className="mt-3 flex gap-2.5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. University of Lagos"
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm min-h-[44px]"
        />
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 min-h-[44px] cursor-pointer"
        >
          {saving ? 'Adding...' : 'Add'}
        </button>
      </div>
      {error && <p className="mt-2 text-sm font-bold text-red-600">{error}</p>}
    </form>
  )
}
