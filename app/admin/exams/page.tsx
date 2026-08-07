import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, School } from 'lucide-react'

export default async function AdminExamsPage() {
  const supabase = await createClient()

  const { data: exams } = await supabase
    .from('exams')
    .select('id, name, slug, subject_selection_mode, school_id, schools(name)')
    .order('name')

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Exams</h1>
        <Link
          href="/admin/exams/new"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 min-h-[44px]"
        >
          <Plus className="h-4 w-4" />
          New Exam
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Slug</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Subjects</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(exams ?? []).map((exam) => {
              const school = Array.isArray(exam.schools) ? exam.schools[0] : exam.schools
              return (
                <tr key={exam.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{exam.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">{exam.slug}</td>
                  <td className="px-4 py-3 text-sm">
                    {exam.school_id ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                        <School className="h-3 w-3" />
                        {(school as { name?: string })?.name ?? 'School'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                        National
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{exam.subject_selection_mode}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/exams/${exam.id}/edit`}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
