'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Upload, Trash2, X, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Question {
  id: string
  question_text: string
  difficulty: string
  exams: { name: string } | { name: string }[] | null
  subjects: { name: string } | { name: string }[] | null
}

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const loadQuestions = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('questions')
      .select('id, question_text, difficulty, exams!questions_exam_id_fkey(name), subjects(name)')
      .order('created_at', { ascending: false })
    setQuestions(data ?? [])
  }, [])

  useEffect(() => { loadQuestions() }, [loadQuestions])

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selected.size === questions.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(questions.map((q) => q.id)))
    }
  }

  const handleDeleteSelected = async () => {
    setDeleting(true)
    try {
      const res = await fetch('/api/admin/questions/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected) }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Delete failed')
      }
      setSelected(new Set())
      setShowConfirm(false)
      await loadQuestions()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Questions</h1>
        <div className="flex gap-3">
          {selected.size > 0 && (
            <button
              onClick={() => setShowConfirm(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 min-h-[44px] cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected ({selected.size})
            </button>
          )}
          <Link
            href="/admin/questions/upload"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 min-h-[44px]"
          >
            <Upload className="h-4 w-4" />
            CSV Upload
          </Link>
          <Link
            href="/admin/questions/new"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 min-h-[44px]"
          >
            <Plus className="h-4 w-4" />
            New Question
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={questions.length > 0 && selected.size === questions.length}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Question</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Exam</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Subject</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Difficulty</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {questions.map((q) => {
              const exam = Array.isArray(q.exams) ? q.exams[0] : q.exams
              const subject = Array.isArray(q.subjects) ? q.subjects[0] : q.subjects
              return (
                <tr key={q.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(q.id)}
                      onChange={() => toggleSelect(q.id)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-md truncate">{q.question_text}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{(exam as { name?: string })?.name ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{(subject as { name?: string })?.name ?? '-'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                      {q.difficulty as string}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/questions/${q.id}/edit`}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
            {questions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                  No questions found. Create your first question.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="relative w-full max-w-md rounded-xl bg-white border border-gray-100 p-6 shadow-xl">
            <button
              onClick={() => !deleting && setShowConfirm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-xl bg-red-100 p-2.5">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete {selected.size} question(s)?</h3>
                <p className="text-sm text-gray-500 mt-1">This action cannot be undone. Some of this content took real manual verification work.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={deleting}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 min-h-[44px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:bg-red-300 min-h-[44px] cursor-pointer"
              >
                {deleting ? 'Deleting...' : `Delete ${selected.size}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
