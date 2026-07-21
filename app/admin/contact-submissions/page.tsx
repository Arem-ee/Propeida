import { createAdminClient } from '@/lib/supabase/admin'
import { Mail } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminContactSubmissionsPage() {
  const supabase = createAdminClient()

  const { data: submissions } = await supabase
    .from('contact_submissions')
    .select('id, email, message, created_at')
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
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Message</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {submissions.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">{s.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-md truncate">{s.message}</td>
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
