'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function EditExamForm({
  exam,
  schools,
  allSubjects,
  linkedSubjectIds: initialLinked,
  mockQuestionCount: initialQCount,
  mockTimeLimit: initialTimeLimit,
}: {
  exam: Record<string, unknown>
  schools: { id: string; name: string }[]
  allSubjects: { id: string; name: string }[]
  linkedSubjectIds: Set<string>
  mockQuestionCount: number | null
  mockTimeLimit: number | null
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(Array.from(initialLinked))

  const toggleSubject = (id: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = new FormData(e.currentTarget)
    const body = {
      id: exam.id,
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
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push('/admin/exams')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update exam')
      setLoading(false)
    }
  }

  return (
    <div>
      <Link href="/admin/exams" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Exams
      </Link>

      <h1 className="text-2xl font-extrabold text-gray-900 mb-8">Edit Exam</h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Name</label>
            <input name="name" defaultValue={exam.name as string} required className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm min-h-[44px]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Slug</label>
            <input name="slug" defaultValue={exam.slug as string} required className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm min-h-[44px]" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
          <textarea name="description" defaultValue={(exam.description as string) ?? ''} rows={2} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm resize-y" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">School (leave blank for national)</label>
            <select name="school_id" defaultValue={(exam.school_id as string) ?? ''} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm min-h-[44px]">
              <option value="">National (no school)</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Subject Selection</label>
            <select name="subject_selection_mode" defaultValue={exam.subject_selection_mode as string} required className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm min-h-[44px]">
              <option value="user_selects">User selects</option>
              <option value="fixed">Fixed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mock Question Count</label>
            <input name="question_count" type="number" defaultValue={initialQCount ?? ''} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm min-h-[44px]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Time Limit (seconds)</label>
            <input name="time_limit_seconds" type="number" defaultValue={initialTimeLimit ?? ''} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm min-h-[44px]" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Linked Subjects</label>
          <div className="flex flex-wrap gap-2">
            {allSubjects.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleSubject(s.id)}
                className={`rounded-xl border px-3.5 py-2 text-sm font-semibold transition-all min-h-[44px] cursor-pointer ${
                  selectedSubjects.includes(s.id)
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 min-h-[44px] cursor-pointer"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
