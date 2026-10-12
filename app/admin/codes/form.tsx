'use client'

import { useState } from 'react'

export default function NewCodeForm({ subjects }: { subjects: { id: string; name: string }[] }) {
  const [subjectId, setSubjectId] = useState('')
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [definition, setDefinition] = useState('')
  const [example, setExample] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setDone(null)
    try {
      const res = await fetch('/api/admin/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject_id: subjectId, code, name, definition, example }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to add code')
      setDone(`Code "${data.code}" added.`)
      setCode('')
      setName('')
      setDefinition('')
      setExample('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add code')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm min-h-[44px]'

  return (
    <form onSubmit={(e) => void submit(e)} className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
      <h2 className="text-base font-extrabold text-gray-900">Add a code</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Subject</label>
          <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required className={inputClass}>
            <option value="">Select subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Code</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            placeholder="e.g. sign-error"
            className={`${inputClass} font-mono`}
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Drops the negative sign"
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Definition</label>
        <textarea
          value={definition}
          onChange={(e) => setDefinition(e.target.value)}
          required
          rows={2}
          placeholder="What error does this code name, precisely?"
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm resize-y"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Example (optional)</label>
        <input
          value={example}
          onChange={(e) => setExample(e.target.value)}
          placeholder="A concrete instance"
          className={inputClass}
        />
      </div>
      {error && <p className="text-sm font-bold text-red-600">{error}</p>}
      {done && <p className="text-sm font-bold text-green-700">{done}</p>}
      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 min-h-[44px] cursor-pointer"
      >
        {saving ? 'Adding...' : 'Add code'}
      </button>
    </form>
  )
}
