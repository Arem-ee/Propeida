'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewQuestionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exams, setExams] = useState<{ id: string; name: string }[]>([])
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    fetch('/api/admin/refs')
      .then((r) => r.json())
      .then((data) => {
        setExams(data.exams ?? [])
        setSubjects(data.subjects ?? [])
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = new FormData(e.currentTarget)
    const body = {
      exam_id: form.get('exam_id') as string,
      subject_id: form.get('subject_id') as string,
      question_text: form.get('question_text') as string,
      options: [
        { key: 'a', text: form.get('option_a') as string },
        { key: 'b', text: form.get('option_b') as string },
        { key: 'c', text: form.get('option_c') as string },
        { key: 'd', text: form.get('option_d') as string },
      ],
      correct_answer: form.get('correct_answer') as string,
      explanation: form.get('explanation') as string,
      difficulty: form.get('difficulty') as string,
    }

    try {
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push('/admin/questions')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create question')
      setLoading(false)
    }
  }

  return (
    <div>
      <Link href="/admin/questions" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Questions
      </Link>

      <h1 className="text-2xl font-extrabold text-gray-900 mb-8">New Question</h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Exam</label>
            <select name="exam_id" required className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm min-h-[44px]">
              <option value="">Select exam</option>
              {exams.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Subject</label>
            <select name="subject_id" required className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm min-h-[44px]">
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Question Text</label>
          <textarea name="question_text" required rows={3} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm resize-y" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Option A</label>
            <input name="option_a" required className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm min-h-[44px]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Option B</label>
            <input name="option_b" required className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm min-h-[44px]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Option C</label>
            <input name="option_c" required className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm min-h-[44px]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Option D</label>
            <input name="option_d" required className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm min-h-[44px]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Correct Answer</label>
            <select name="correct_answer" required className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm min-h-[44px]">
              <option value="">Select answer</option>
              <option value="a">A</option>
              <option value="b">B</option>
              <option value="c">C</option>
              <option value="d">D</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Difficulty</label>
            <select name="difficulty" required className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm min-h-[44px]">
              <option value="">Select difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Explanation (optional)</label>
          <textarea name="explanation" rows={2} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm resize-y" />
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
          {loading ? 'Creating...' : 'Create Question'}
        </button>
      </form>
    </div>
  )
}
