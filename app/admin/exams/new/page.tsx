'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/admin/page-header'
import { inputClass, selectClass, textareaClass, labelClass, FormError, FormCard } from '@/components/admin/form'

export default function NewExamPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([])
  const [allSubjects, setAllSubjects] = useState<{ id: string; name: string }[]>([])
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/admin/refs')
      .then((r) => r.json())
      .then((data) => {
        setSchools(data.schools ?? [])
        setAllSubjects(data.subjects ?? [])
      })
      .catch(() => setError('Could not load schools and subjects — refresh to try again'))
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = new FormData(e.currentTarget)
    const body = {
      name: form.get('name') as string,
      slug: form.get('slug') as string,
      description: form.get('description') as string,
      school_id: form.get('school_id') as string || null,
      subject_selection_mode: form.get('subject_selection_mode') as string,
      subject_ids: selectedSubjects,
      question_count: parseInt(form.get('question_count') as string) || null,
      time_limit_seconds: parseInt(form.get('time_limit_seconds') as string) || null,
    }

    try {
      const res = await fetch('/api/admin/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push('/admin/exams')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create exam')
      setLoading(false)
    }
  }

  const toggleSubject = (id: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="Setup · Exams"
        title="New exam"
        description="Define the exam the way learners will experience it — name, slug, subjects, and mock defaults"
      />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <FormCard>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="name">Name</label>
              <input id="name" name="name" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="slug">Slug</label>
              <input id="slug" name="slug" required placeholder="e.g. unilorin-post-utme" className={inputClass} />
            </div>
          </div>

          <div className="mt-4">
            <label className={labelClass} htmlFor="description">Description</label>
            <textarea id="description" name="description" rows={2} className={textareaClass} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="school_id">School (leave blank for national)</label>
              <select id="school_id" name="school_id" className={selectClass}>
                <option value="">National (no school)</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="subject_selection_mode">Subject Selection</label>
              <select id="subject_selection_mode" name="subject_selection_mode" required className={selectClass}>
                <option value="user_selects">User selects</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="question_count">Mock Question Count</label>
              <input id="question_count" name="question_count" type="number" className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="time_limit_seconds">Time Limit (seconds)</label>
              <input id="time_limit_seconds" name="time_limit_seconds" type="number" className={inputClass} />
            </div>
          </div>
        </FormCard>

        <FormCard>
          <p className={labelClass}>Linked Subjects</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {allSubjects.map((s) => {
              const on = selectedSubjects.includes(s.id)
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSubject(s.id)}
                  aria-pressed={on}
                  className={`min-h-[44px] cursor-pointer rounded-xl border px-3.5 py-2 text-sm font-semibold transition-all ${
                    on
                      ? 'border-blue-600 bg-blue-600 text-white shadow-[0_6px_16px_-8px_rgba(37,99,235,0.7)]'
                      : 'border-gray-200 bg-white text-ink-soft hover:bg-gray-50'
                  }`}
                >
                  {s.name}
                </button>
              )
            })}
          </div>
        </FormCard>

        {error && <FormError>{error}</FormError>}

        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 min-h-[44px]"
        >
          {loading ? 'Creating...' : 'Create Exam'}
        </button>
      </form>
    </div>
  )
}
