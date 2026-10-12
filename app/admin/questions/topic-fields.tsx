'use client'

import { useState, useEffect } from 'react'

export interface TopicDraft {
  topic_id: string
  role: string
}

const ROLES = ['diagnostic', 'practice', 'review', 'mock'] as const

/**
 * Topic tagging for a question. Loads the selected subject's topics and
 * collects (topic, role) pairs. Silent when the subject has no topics —
 * tagging is authoring depth, never a blocker.
 */
export default function TopicFields({
  subjectId,
  initial,
}: {
  subjectId: string
  initial: { topic_id: string; role: string }[]
}) {
  const [topics, setTopics] = useState<{ id: string; name: string }[]>([])
  const [checked, setChecked] = useState<Set<string>>(
    () => new Set(initial.map((m) => m.topic_id)),
  )
  const [roles, setRoles] = useState<Record<string, string>>(() =>
    Object.fromEntries(initial.map((m) => [m.topic_id, m.role])),
  )

  useEffect(() => {
    setChecked(new Set(initial.map((m) => m.topic_id)))
    setRoles(Object.fromEntries(initial.map((m) => [m.topic_id, m.role])))
  }, [initial])

  useEffect(() => {
    if (!subjectId) {
      setTopics([])
      return
    }
    fetch(`/api/admin/topics?subject_id=${encodeURIComponent(subjectId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setTopics(data?.topics ?? []))
      .catch(() => setTopics([]))
  }, [subjectId])

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (topics.length === 0) return null

  return (
    <div className="rounded-2xl border border-gray-200 p-5 space-y-4">
      <div>
        <h3 className="text-sm font-extrabold text-gray-900">Topics (optional)</h3>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          Map this question to curriculum topics. Role defaults to practice.
        </p>
      </div>
      {topics.map((topic) => {
        const on = checked.has(topic.id)
        return (
          <div key={topic.id} className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={on}
              onChange={() => toggle(topic.id)}
              name="topic_ids"
              value={topic.id}
              className="h-5 w-5 rounded border-gray-300 text-blue-600 cursor-pointer"
            />
            <span className="flex-1 text-sm font-bold text-gray-800">{topic.name}</span>
            <select
              name={`topic_role_${topic.id}`}
              value={roles[topic.id] ?? 'practice'}
              onChange={(e) => setRoles((prev) => ({ ...prev, [topic.id]: e.target.value }))}
              disabled={!on}
              className="rounded-xl border border-gray-200 px-2 py-2 text-xs font-bold text-gray-600 min-h-[44px] disabled:opacity-40"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        )
      })}
    </div>
  )
}

/** Collect checked mappings from a submitted admin question form. */
export function collectTopics(form: FormData): TopicDraft[] {
  const ids = form.getAll('topic_ids') as string[]
  return ids.map((id) => ({
    topic_id: id,
    role: (form.get(`topic_role_${id}`) as string) || 'practice',
  }))
}
