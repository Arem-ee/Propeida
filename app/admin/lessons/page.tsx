import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import DuplicateLessonButton from './duplicate-button'

export const metadata = { title: 'Lessons' }

const STATUS_STYLE: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-500',
  review: 'bg-amber-100 text-amber-700',
  published: 'bg-emerald-100 text-emerald-700',
  retired: 'bg-red-100 text-red-600',
}

export default async function AdminLessonsPage() {
  const supabase = createAdminClient()
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, slug, title, status, version, updated_at, subjects!inner(name), lesson_blocks(id)')
    .order('updated_at', { ascending: false })

  return (
    <div>
      <Link href="/admin/questions" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Questions
      </Link>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Lessons</h1>
      <p className="text-sm text-gray-500 mb-8">
        Authored content as data. Publishing bumps the version — history is never rewritten.
      </p>

      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Lesson</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Subject</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Blocks</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">v</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(lessons ?? []).map((lesson) => {
              const subject = Array.isArray(lesson.subjects) ? lesson.subjects[0] : lesson.subjects
              return (
                <tr key={lesson.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-bold text-gray-900 max-w-xs truncate">{lesson.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{(subject as { name?: string })?.name ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{(lesson.lesson_blocks ?? []).length}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_STYLE[lesson.status] ?? STATUS_STYLE.draft}`}>
                      {lesson.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">v{lesson.version}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <DuplicateLessonButton lessonId={lesson.id} baseSlug={lesson.slug} />
                      <Link
                        href={`/admin/lessons/${lesson.id}`}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                      >
                        Edit
                      </Link>
                    </div>
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
