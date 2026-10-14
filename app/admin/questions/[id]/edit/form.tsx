'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import MisconceptionFields, { collectMisconceptions, type MisconceptionInitial } from '../../misconception-fields'
import TopicFields, { collectTopics } from '../../topic-fields'

interface Question {
  id: string
  exam_id: string
  subject_id: string
  question_text: string
  options: { key: string; text: string }[]
  correct_answer: string
  explanation: string | null
  difficulty: string
  cognitive_level: string | null
  status: string
  verified_state: string
  review_note: string | null
}

function optionsRecord(options: { key: string; text: string }[]): Record<string, string> {
  const out: Record<string, string> = {}
  for (const opt of options) out[opt.key] = opt.text
  return out
}

export default function EditQuestionForm({
  question,
  exams,
  subjects,
  initialMisconceptions,
  initialTopics,
  history,
}: {
  question: Question
  exams: { id: string; name: string }[]
  subjects: { id: string; name: string }[]
  initialMisconceptions: Record<string, MisconceptionInitial>
  initialTopics: { topic_id: string; role: string }[]
  history: { verified_state: string; note: string | null; created_at: string }[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [correctAnswer, setCorrectAnswer] = useState(question.correct_answer)
  const [subjectId, setSubjectId] = useState(question.subject_id)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = new FormData(e.currentTarget)
    const body = {
      id: question.id,
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
      misconceptions: collectMisconceptions(form),
      topics: collectTopics(form),
      cognitive_level: (form.get('cognitive_level') as string) || null,
      status: form.get('status') as string,
      verified_state: form.get('verified_state') as string,
      review_note: (form.get('review_note') as string) || null,
    }

    try {
      const res = await fetch('/api/admin/questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push('/admin/questions')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update question')
      setLoading(false)
    }
  }

  return (
    <div>
      <Link href="/admin/questions" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Questions
      </Link>

      <h1 className="text-2xl font-extrabold text-gray-900 mb-8">Edit Question</h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Exam</label>
            <select name="exam_id" defaultValue={question.exam_id} required className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm min-h-[44px]">
              {exams.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Subject</label>
            <select name="subject_id" value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm min-h-[44px]">
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Question Text</label>
          <textarea name="question_text" defaultValue={question.question_text} required rows={3} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm resize-y" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Option A</label>
            <input name="option_a" defaultValue={optionsRecord(question.options).a} required className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm min-h-[44px]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Option B</label>
            <input name="option_b" defaultValue={optionsRecord(question.options).b} required className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm min-h-[44px]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Option C</label>
            <input name="option_c" defaultValue={optionsRecord(question.options).c} required className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm min-h-[44px]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Option D</label>
            <input name="option_d" defaultValue={optionsRecord(question.options).d} required className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm min-h-[44px]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Correct Answer</label>
            <select name="correct_answer" value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} required className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm min-h-[44px]">
              <option value="a">A</option>
              <option value="b">B</option>
              <option value="c">C</option>
              <option value="d">D</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Difficulty</label>
            <select name="difficulty" defaultValue={question.difficulty} required className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm min-h-[44px]">
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Cognitive level (optional)</label>
            <select name="cognitive_level" defaultValue={question.cognitive_level ?? ''} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm min-h-[44px]">
              <option value="">Unrated</option>
              <option value="remember">Remember</option>
              <option value="understand">Understand</option>
              <option value="apply">Apply</option>
              <option value="analyze">Analyze</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Explanation (optional)</label>
          <textarea name="explanation" defaultValue={question.explanation ?? ''} rows={2} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm resize-y" />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
          <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-3">Editorial state</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
              <select name="status" defaultValue={question.status ?? 'draft'} required className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm min-h-[44px]">
                <option value="draft">Draft</option>
                <option value="in_review">In review</option>
                <option value="published">Published</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Verification</label>
              <select name="verified_state" defaultValue={question.verified_state ?? 'unverified'} required className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm min-h-[44px]">
                <option value="unverified">Unverified 🔴</option>
                <option value="source_cited">Source-cited 🔶</option>
                <option value="human_verified">Human-verified ✅</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Review note (optional)</label>
            <textarea name="review_note" defaultValue={question.review_note ?? ''} rows={2} placeholder="What did you check? Source page, answer-key cross-check…" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm resize-y" />
          </div>
          <p className="mt-2 text-xs font-semibold text-gray-400">Publishing requires a verification state — unverified items stay out of learner sessions.</p>
          {history.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {history.map((h, i) => (
                <li key={i} className="rounded-lg bg-white border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600">
                  {h.verified_state.replace('_', ' ')} · {new Date(h.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {h.note ? ` — ${h.note}` : ''}
                </li>
              ))}
            </ul>
          )}
        </div>

        <MisconceptionFields correctAnswer={correctAnswer} subjectId={subjectId} initial={initialMisconceptions} />

        <TopicFields subjectId={subjectId} initial={initialTopics} />

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
