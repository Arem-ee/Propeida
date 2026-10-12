import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import NewSchoolFormWrapper from './new-school-form-wrapper'

export const metadata = { title: 'Schools' }

export default async function SchoolsPage() {
  const supabase = createAdminClient()
  const { data: schools } = await supabase
    .from('schools')
    .select('id, name, slug, school_screenings(year)')
    .order('name')

  return (
    <div>
      <Link href="/admin/questions" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Questions
      </Link>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Schools</h1>
      <p className="text-sm text-gray-500 mb-8">
        Every screening fact lives under its school, year-tagged. Click through to manage modes, weights, and cutoffs.
      </p>

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">School</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Screenings</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(schools ?? []).map((school) => (
                <tr key={school.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">{school.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {(school.school_screenings ?? []).length} year(s)
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/schools/${school.id}`}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
              {(schools ?? []).length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center text-sm text-gray-500">
                    No schools yet. Add the first one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <NewSchoolFormWrapper />
      </div>
    </div>
  )
}
