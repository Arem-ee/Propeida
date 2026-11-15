'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MisconceptionFields, { collectMisconceptions } from '../misconception-fields'
import TopicFields, { collectTopics } from '../topic-fields'
import PageHeader from '@/components/admin/page-header'
import { inputClass, selectClass, textareaClass, labelClass, FormError, FormCard } from '@/components/admin/form'

export default function NewQuestionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exams, setExams] = useState<{ id: string; name: string }[]>([])
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([])
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [subjectId, setSubjectId] = useState('')

  useEffect(() => {
    fetch('/api/admin/refs')
      .then((r) => r.json())
      .then((data) => {
        setExams(data.exams ?? [])
        setSubjects(data.subjects ?? [])
      })
      .catch(() => setError('Could not load exams and subjects — refresh to try again'))
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
        { key: 'e', text: ((form.get('option_e') as string) ?? '').trim() },
      ],
      correct_answer: form.get('correct_answer') as string,
      explanation: form.get('explanation') as string,
      difficulty: form.get('difficulty') as string,
      misconceptions: collectMisconceptions(form),
      topics: collectTopics(form),
      cognitive_level: (form.get('cognitive_level') as string) || null,
    }

    try {
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push('/admin/questions/review')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create question')
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Step 1 · Content"
        title="New question"
        description="A question you write by hand goes straight into review, like everything else that comes in"
      />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <FormCard>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="exam_id">Exam</label>
              <select id="exam_id" name="exam_id" required className={selectClass}>
                <option value="">Select exam</option>
                {exams.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="subject_id">Subject</label>
              <select id="subject_id" name="subject_id" required value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className={selectClass}>
                <option value="">Select subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className={labelClass} htmlFor="question_text">Question Text</label>
            <textarea id="question_text" name="question_text" required rows={3} className={textareaClass} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(['a', 'b', 'c', 'd'] as const).map((key) => (
              <div key={key}>
                <label className={labelClass} htmlFor={`option_${key}`}>Option {key.toUpperCase()}</label>
                <input id={`option_${key}`} name={`option_${key}`} required className={inputClass} />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="option_e">Option E (legacy 5-option questions only)</label>
              <input id="option_e" name="option_e" className={inputClass} />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass} htmlFor="correct_answer">Correct Answer</label>
              <select id="correct_answer" name="correct_answer" required value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} className={selectClass}>
                <option value="">Select answer</option>
                <option value="a">A</option>
                <option value="b">B</option>
                <option value="c">C</option>
                <option value="d">D</option>
                <option value="e">E (legacy only)</option>
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="difficulty">Difficulty</label>
              <select id="difficulty" name="difficulty" required className={selectClass}>
                <option value="">Select difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="cognitive_level">Cognitive level (optional)</label>
              <select id="cognitive_level" name="cognitive_level" className={selectClass}>
                <option value="">Unrated</option>
                <option value="remember">Remember</option>
                <option value="understand">Understand</option>
                <option value="apply">Apply</option>
                <option value="analyze">Analyze</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className={labelClass} htmlFor="explanation">Explanation (optional)</label>
            <textarea id="explanation" name="explanation" rows={2} className={textareaClass} />
          </div>
        </FormCard>

        <MisconceptionFields correctAnswer={correctAnswer} subjectId={subjectId} />

        <TopicFields subjectId={subjectId} initial={[]} />

        {error && <FormError>{error}</FormError>}

        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 min-h-[44px]"
        >
          {loading ? 'Creating...' : 'Create Question'}
        </button>
      </form>
    </div>
  )
}
