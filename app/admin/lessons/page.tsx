import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import DuplicateLessonButton from './duplicate-button'
import PageHeader from '@/components/admin/page-header'
import { AdminTable, THead, Th, TBody, Td, TableEmpty } from '@/components/admin/table'
import { LessonStatusPill } from '@/components/admin/badge'

export const metadata = { title: 'Lessons' }
export const dynamic = 'force-dynamic'

export default async function AdminLessonsPage() {
  const supabase = createAdminClient()
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, slug, title, status, version, updated_at, subjects!inner(name), lesson_blocks(id)')
    .order('updated_at', { ascending: false })

  const rows = lessons ?? []
  const inProgress = rows.filter((l) => l.status === 'draft' || l.status === 'review').length
  const published = rows.filter((l) => l.status === 'published').length

  return (
    <div>
      <PageHeader
        eyebrow="Content"
        title="Lessons"
        description="Authored content as data. Publishing bumps the version — history is never rewritten"
        actions={
          <div className="flex items-center gap-2 text-xs font-bold text-ink-soft">
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-800">{inProgress} in progress</span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-800">{published} published</span>
          </div>
        }
      />

      <AdminTable>
        <THead>
          <tr>
            <Th>Lesson</Th>
            <Th>Subject</Th>
            <Th>Blocks</Th>
            <Th>Status</Th>
            <Th>v</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </THead>
        <TBody>
          {rows.map((lesson) => {
            const subject = Array.isArray(lesson.subjects) ? lesson.subjects[0] : lesson.subjects
            return (
              <tr key={lesson.id} className="hover:bg-blue-50/30">
                <Td className="max-w-xs truncate font-bold text-black">{lesson.title}</Td>
                <Td>{(subject as { name?: string })?.name ?? '-'}</Td>
                <Td className="tabular-nums">{(lesson.lesson_blocks ?? []).length}</Td>
                <Td>
                  <LessonStatusPill status={lesson.status} />
                </Td>
                <Td className="tabular-nums">v{lesson.version}</Td>
                <Td className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <DuplicateLessonButton lessonId={lesson.id} baseSlug={lesson.slug} />
                    <Link
                      href={`/admin/lessons/${lesson.id}`}
                      className="inline-flex min-h-[36px] items-center rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                    >
                      Edit
                    </Link>
                  </div>
                </Td>
              </tr>
            )
          })}
          {rows.length === 0 && (
            <TableEmpty colSpan={6}>No lessons yet — duplicate an existing lesson to start one</TableEmpty>
          )}
        </TBody>
      </AdminTable>
    </div>
  )
}
