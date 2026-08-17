import Link from 'next/link'
import { Plus, GraduationCap } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import PublishToggle from '@/components/explore/publish-toggle'

export default async function AdminExploreCoursesPage() {
  const supabase = createAdminClient()
  const { data: items } = await supabase
    .from('courses')
    .select('id, slug, name, published, updated_at')
    .order('name')
    .limit(300)

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Courses</h1>
          <p className="mt-1 text-sm text-gray-500">{(items ?? []).length} courses</p>
        </div>
        <Link
          href="/admin/explore/courses/new"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 min-h-[44px]"
        >
          <Plus className="h-4 w-4" />
          New Course
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">Name</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">Status</th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(items ?? []).map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <GraduationCap className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                      <p className="font-mono text-xs text-gray-400">{item.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <PublishToggle
                    entity="courses"
                    id={item.id}
                    initialPublished={item.published}
                    onToggle={() => undefined}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/explore/courses/${item.id}/edit`}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 min-h-[32px] inline-flex items-center"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}