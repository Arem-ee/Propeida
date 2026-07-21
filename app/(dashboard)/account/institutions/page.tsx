'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Check, Plus, X, School, ArrowLeft } from 'lucide-react'
import { getUserExamAccess, addUserExamAccess, removeUserExamAccess } from '@/lib/actions/leaderboard'

interface SchoolExam {
  id: string
  name: string
  slug: string
  examId: string
  examName: string
  examSlug: string
  added: boolean
}

export default function InstitutionsPage() {
  const [schools, setSchools] = useState<SchoolExam[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getUserExamAccess()
      setSchools(data ?? [])
    } catch {
      setMessage('Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const toggle = async (examId: string, added: boolean) => {
    try {
      if (added) {
        await removeUserExamAccess(examId)
      } else {
        await addUserExamAccess(examId)
      }
      setSchools((prev) => prev.map((s) => s.examId === examId ? { ...s, added: !added } : s))
      setMessage(added ? 'Institution removed' : 'Institution added')
    } catch {
      setMessage('Failed to update')
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/account" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 min-h-[36px]">
        <ArrowLeft className="h-4 w-4" /> Back to Account
      </Link>

      <h1 className="text-2xl font-extrabold text-gray-900 mb-2">My Institutions</h1>
      <p className="text-sm text-gray-500 mb-6">
        Add your target institutions to unlock their Post-UTME practice and mock exams. Only schools with configured exams appear below.
      </p>

      {message && (
        <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700 mb-6 flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-blue-500 hover:text-blue-700 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : schools.length === 0 ? (
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-8 text-center">
          <School className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-500">No institutions available yet</p>
          <p className="text-xs text-gray-400 mt-1">Institutions will appear here once their exams are configured.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {schools.map((school) => (
            <div key={school.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                  <School className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{school.name}</p>
                  <p className="text-xs text-gray-400">{school.examName}</p>
                </div>
              </div>
              <button
                onClick={() => toggle(school.examId, school.added)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold min-h-[44px] cursor-pointer ${
                  school.added
                    ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {school.added ? (
                  <><Check className="h-4 w-4" /> Added</>
                ) : (
                  <><Plus className="h-4 w-4" /> Add</>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
