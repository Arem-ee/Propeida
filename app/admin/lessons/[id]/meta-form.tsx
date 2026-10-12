'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const STATUSES = ['draft', 'review', 'published', 'retired'] as const

export default function LessonMetaForm({
  lesson,
  topics,
}: {
  lesson: {
    id: string
    title: string
    objective: string | null
    estimated_minutes: number | null
    status: string
    version: number
    topic_id: string | null
  }
  topics: { id: string; name: string }[]
}) {
  const router = useRouter()
  const [title, setTitle] = useState(lesson.title)
  const [objective, setObjective] = useState(lesson.objective ?? '')
  const [minutes, setMinutes] = useState(lesson.estimated_minutes?.toString() ?? '')
  const [status, setStatus] = useState(lesson.status)
  const [topicId, setTopicId] = useState(lesson.topic_id ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const save = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const res = await fetch(`/api/admin/lessons/${lesson.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          objective,
          estimated_minutes: minutes.trim() === '' ? null : Number(minutes),
          status,
          topic_id: topicId || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Save failed')
      setSaved(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm min-h-[44px]'

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-extrabold text-gray-900">Lesson</h2>
        <span className="text-xs font-bold text-gray-400">v{lesson.version}</span>
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Objective</label>
        <textarea value={objective} onChange={(e) => setObjective(e.target.value)} rows={2} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm resize-y" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Minutes</label>
          <input value={minutes} onChange={(e) => setMinutes(e.target.value)} inputMode="numeric" placeholder="10" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}{s === 'published' ? ' (bumps version)' : ''}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Topic</label>
          <select value={topicId} onChange={(e) => setTopicId(e.target.value)} className={inputClass}>
            <option value="">None</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>
      {error && <p className="text-sm font-bold text-red-600">{error}</p>}
      {saved && <p className="text-sm font-bold text-green-700">Saved.</p>}
      <button
        onClick={() => void save()}
        disabled={saving}
        className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 min-h-[44px] cursor-pointer"
      >
        {saving ? 'Saving...' : 'Save lesson'}
      </button>
      <div>
        <Link href="/admin/lessons" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" /> All lessons
        </Link>
      </div>
    </div>
  )
}
