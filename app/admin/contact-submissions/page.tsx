import { createAdminClient } from '@/lib/supabase/admin'
import { Mail } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminContactSubmissionsPage() {
  const supabase = createAdminClient()

  const { data: submissions } = await supabase
    .from('contact_submissions')
    .select('id, email, full_name, phone, organization_type, student_count, requested_university, requested_course, message, created_at')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Contact Submissions</h1>
        <span className="text-xs font-semibold text-gray-400 bg-gray-100 rounded-full px-3 py-1">
          {(submissions ?? []).length} total
        </span>
      </div>

      {!submissions || submissions.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-gray-400 mb-4">
            <Mail className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-gray-500">No submissions yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Email / Phone</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Organization</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Type / Students</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Requested University</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Message</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {submissions.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                    {s.full_name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                    <div>{s.email}</div>
                    {s.phone ? <div className="text-xs text-gray-400">{s.phone}</div> : null}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-700 whitespace-nowrap">
                    {s.organization_type ? s.organization_type.replaceAll('_', ' ') : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                    {s.student_count != null
                      ? `${s.student_count} student${s.student_count === 1 ? '' : 's'}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                    {s.requested_university ?? '—'}
                    {s.requested_course ? (
                      <div className="text-xs font-normal text-gray-400">{s.requested_course}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-md truncate">{s.message ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-sm text-gray-400 whitespace-nowrap">
                    {new Date(s.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}