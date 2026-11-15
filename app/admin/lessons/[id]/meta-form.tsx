'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { inputClass, selectClass, textareaClass, labelClass, FormError, FormNotice } from '@/components/admin/form'

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

  return (
    <div className="space-y-4 rounded-2xl border border-blue-100/70 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-extrabold text-black">Lesson</h2>
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-extrabold text-ink-soft">v{lesson.version}</span>
      </div>
      <div>
        <label className={labelClass} htmlFor="lesson-title">Title</label>
        <input id="lesson-title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="lesson-objective">Objective</label>
        <textarea id="lesson-objective" value={objective} onChange={(e) => setObjective(e.target.value)} rows={2} className={textareaClass} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass} htmlFor="lesson-minutes">Minutes</label>
          <input id="lesson-minutes" value={minutes} onChange={(e) => setMinutes(e.target.value)} inputMode="numeric" placeholder="10" className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="lesson-status">Status</label>
          <select id="lesson-status" value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}{s === 'published' ? ' (bumps version)' : ''}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="lesson-topic">Topic</label>
          <select id="lesson-topic" value={topicId} onChange={(e) => setTopicId(e.target.value)} className={selectClass}>
            <option value="">None</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>
      {error && <FormError>{error}</FormError>}
      {saved && <FormNotice>Saved</FormNotice>}
      <button
        onClick={() => void save()}
        disabled={saving}
        className="cursor-pointer rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 min-h-[44px]"
      >
        {saving ? 'Saving...' : 'Save lesson'}
      </button>
    </div>
  )
}
