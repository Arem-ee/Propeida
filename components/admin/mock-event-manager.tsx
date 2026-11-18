'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { inputClass, labelClass, FormError } from '@/components/admin/form'
import { useConfirm } from '@/components/admin/confirm'

interface MockEvent {
  id: string
  name: string
  slug: string
  exam_id: string
  starts_at: string
  ends_at: string
  description: string | null
  topic_ids: string[] | null
  question_count: number | null
  created_at: string
  exams: { name: string; slug: string } | { name: string; slug: string }[] | null
}

interface ExamOption { id: string; name: string; slug: string }
interface TopicOption { id: string; subject_id: string; name: string; slug: string }
interface SubjectOption { id: string; name: string; slug: string }

function toDateTimeInput(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatWhen(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

const dividerClass = 'h-px bg-blue-100/70'

export default function MockEventManager({
  exams,
  topics,
  subjects,
  examSubjectMap,
}: {
  exams: ExamOption[]
  topics: TopicOption[]
  subjects: SubjectOption[]
  examSubjectMap: Record<string, string[]>
}) {
  const [events, setEvents] = useState<MockEvent[]>([])
  const [name, setName] = useState('')
  const [examId, setExamId] = useState(exams[0]?.id ?? '')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [description, setDescription] = useState('')
  const [topicIds, setTopicIds] = useState<string[]>([])
  const [questionCount, setQuestionCount] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { confirm, dialog } = useConfirm()

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/mock-events')
    if (res.ok) {
      const data = await res.json()
      setEvents(data.events ?? [])
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const examTopics = useMemo(() => {
    const subjectIds = examSubjectMap[examId] ?? []
    return subjects
      .filter((s) => subjectIds.includes(s.id))
      .map((s) => ({
        subject: s,
        topics: topics.filter((t) => t.subject_id === s.id),
      }))
      .filter((g) => g.topics.length > 0)
  }, [examId, examSubjectMap, subjects, topics])

  const topicNameById = useMemo(() => new Map(topics.map((t) => [t.id, t.name])), [topics])

  const toggleTopic = (id: string) => {
    setTopicIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
  }
  const setAll = (subjectId: string) => {
    const all = examTopics.find((g) => g.subject.id === subjectId)?.topics.map((t) => t.id) ?? []
    setTopicIds((prev) => {
      const set = new Set(prev)
      const allSet = new Set(all)
      const everyIn = all.every((t) => set.has(t))
      if (everyIn) return prev.filter((t) => !allSet.has(t))
      for (const t of all) set.add(t)
      return [...set]
    })
  }

  const reset = () => {
    setEditingId(null); setName(''); setExamId(exams[0]?.id ?? ''); setStartsAt(''); setEndsAt(''); setDescription(''); setTopicIds([]); setQuestionCount(''); setError(null)
  }

  const startEdit = (e: MockEvent) => {
    setEditingId(e.id); setName(e.name); setExamId(e.exam_id)
    setStartsAt(toDateTimeInput(e.starts_at))
    setEndsAt(toDateTimeInput(e.ends_at))
    setDescription(e.description ?? '')
    setTopicIds(Array.isArray(e.topic_ids) ? e.topic_ids : [])
    setQuestionCount(e.question_count === null ? '' : String(e.question_count))
    setError(null)
  }

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      const parsedCount = questionCount.trim() === '' ? null : Number(questionCount)
      if (parsedCount !== null && (!Number.isInteger(parsedCount) || parsedCount < 5 || parsedCount > 500)) {
        throw new Error('Question count must be a whole number between 5 and 500')
      }
      const res = await fetch('/api/admin/mock-events', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId
          ? { id: editingId, name, starts_at: startsAt || null, ends_at: endsAt || null, description, topic_ids: topicIds, question_count: parsedCount }
          : { name, exam_id: examId, starts_at: startsAt || null, ends_at: endsAt || null, description, topic_ids: topicIds, question_count: parsedCount }),
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

  const remove = async (id: string, name: string) => {
    const ok = await confirm({ title: `Delete “${name}”?`, body: 'Scheduled for learners now will not find it again. Completed results stay in the system.', confirmLabel: 'Delete event', tone: 'danger' })
    if (!ok) return
    await fetch(`/api/admin/mock-events?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    await load()
  }

  const examName = (e: MockEvent) => {
    const x = Array.isArray(e.exams) ? e.exams[0] : e.exams
    return x?.name ?? '-'
  }

  const status = (e: MockEvent): 'live' | 'upcoming' | 'ended' => {
    // eslint-disable-next-line react-hooks/purity -- status is derived per render from request-time clock
    const now = Date.now()
    if (now >= new Date(e.ends_at).getTime()) return 'ended'
    if (now >= new Date(e.starts_at).getTime()) return 'live'
    return 'upcoming'
  }

  const focusSummary = (e: MockEvent): string => {
    const parts: string[] = []
    if (Array.isArray(e.topic_ids) && e.topic_ids.length > 0) {
      const names = e.topic_ids.map((id) => topicNameById.get(id) ?? id.slice(0, 8))
      parts.push(names.length === 1 ? `Topic: ${names[0]}` : `Topics: ${names.join(', ')}`)
    }
    if (typeof e.question_count === 'number') parts.push(`${e.question_count} questions`)
    return parts.join(' · ')
  }

  return (
    <div className="space-y-4">
      {dialog}
      {events.map((e) => (
        <div key={e.id} className="rounded-2xl border border-blue-100/70 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-base font-extrabold text-black">{e.name}</p>
              <p className="text-xs font-semibold text-ink-soft">
                {examName(e)} · {formatWhen(e.starts_at)} to {formatWhen(e.ends_at)}
              </p>
              <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">
                {status(e) === 'live' ? 'Live now' : status(e) === 'upcoming' ? 'Upcoming' : 'Ended'}
              </p>
              {focusSummary(e) && <p className="mt-1 text-xs font-bold text-blue-700">{focusSummary(e)}</p>}
              {e.description && <p className="mt-1 text-sm text-ink-soft">{e.description}</p>}
              <p className="mt-1 text-[11px] text-gray-400">/event/{e.slug}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button onClick={() => startEdit(e)} className="min-h-[40px] cursor-pointer rounded-xl border border-gray-200 px-3.5 py-2 text-xs font-bold text-ink-soft hover:bg-gray-50">Edit</button>
              <button onClick={() => void remove(e.id, e.name)} className="min-h-[40px] cursor-pointer rounded-xl border border-red-200 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50">Delete</button>
            </div>
          </div>
        </div>
      ))}

      {events.length === 0 && (
        <p className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center text-sm text-ink-soft">
          No mock events scheduled yet, and the first one you add lands here
        </p>
      )}

      <div className="space-y-3 rounded-2xl border border-blue-200/70 bg-blue-50/40 p-4">
        <p className="text-sm font-extrabold text-black">{editingId ? 'Edit event' : 'Add mock event'}</p>
        <div>
          <label className={labelClass} htmlFor="mock-event-name">Name</label>
          <input id="mock-event-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. JAMB Pro Weekend Mock" className={inputClass} />
        </div>
        {!editingId && (
          <div>
            <label className={labelClass} htmlFor="mock-event-exam">Exam</label>
            <select id="mock-event-exam" value={examId} onChange={(e) => setExamId(e.target.value)} className={inputClass}>
              {exams.map((ex) => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
            </select>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className={labelClass} htmlFor="mock-event-starts">Starts</label>
            <input id="mock-event-starts" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="mock-event-ends">Ends</label>
            <input id="mock-event-ends" type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div className={dividerClass} />

        <div>
          <p className={labelClass}>Focused paper (optional)</p>
          <p className="mt-0.5 text-[11px] font-semibold text-gray-500">Leave every topic unchecked and Pro users get a full exam paper, like an ordinary mock</p>
        </div>
        {examTopics.length === 0 && (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">No topics published for this exam yet</p>
        )}
        {examTopics.map((group) => (
          <div key={group.subject.id} className="rounded-xl border border-blue-100/70 bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-extrabold text-ink">{group.subject.name}</p>
              <button
                type="button"
                onClick={() => setAll(group.subject.id)}
                className="text-[11px] font-bold text-blue-700 hover:underline"
              >
                Toggle all
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
              {group.topics.map((t) => {
                const checked = topicIds.includes(t.id)
                return (
                  <label key={t.id} className="inline-flex cursor-pointer items-center gap-1.5 py-1 text-[13px] font-semibold text-ink-soft hover:text-black">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTopic(t.id)}
                      className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600"
                    />
                    {t.name}
                  </label>
                )
              })}
            </div>
          </div>
        ))}

        <div>
          <label className={labelClass} htmlFor="mock-event-count">Question count <span className="font-normal text-gray-400">(leave blank for exam default)</span></label>
          <input id="mock-event-count" type="number" min={5} max={500} step={1} value={questionCount} onChange={(e) => setQuestionCount(e.target.value)} placeholder="e.g. 20" className={inputClass} />
        </div>

        <div>
          <label className={labelClass} htmlFor="mock-event-desc">Note</label>
          <textarea id="mock-event-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional — one or two sentences learners see on the event page" rows={2} className={inputClass} />
        </div>
        {error && <FormError>{error}</FormError>}
        <div className="flex gap-2.5">
          <button onClick={() => void save()} disabled={saving} className="min-h-[44px] cursor-pointer rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : editingId ? 'Save changes' : 'Create event'}</button>
          {editingId && <button onClick={reset} className="min-h-[44px] cursor-pointer rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-ink-soft hover:bg-gray-50">Cancel</button>}
        </div>
      </div>
    </div>
  )
}
