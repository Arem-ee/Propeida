import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import LessonMetaForm from './meta-form'
import BlockEditor from '../block-editor'
import PageHeader from '@/components/admin/page-header'

export const metadata = { title: 'Edit lesson' }
export const dynamic = 'force-dynamic'

export default async function EditLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: lesson } = await supabase
    .from('lessons')
    .select('id, slug, title, objective, estimated_minutes, status, version, topic_id, subject_id')
    .eq('id', id)
    .single()
  if (!lesson) notFound()

  const [{ data: blocks }, { data: topics }, { data: siblings }] = await Promise.all([
    supabase
      .from('lesson_blocks')
      .select('id, block_type, content')
      .eq('lesson_id', id)
      .order('position'),
    supabase
      .from('topics')
      .select('id, name')
      .eq('subject_id', lesson.subject_id)
      .order('sort_order'),
    supabase
      .from('lessons')
      .select('id, title, status')
      .eq('subject_id', lesson.subject_id)
      .neq('id', id)
      .order('title'),
  ])

  return (
    <div>
      <PageHeader
        eyebrow="Content · Lesson"
        title={lesson.title}
        description="Blocks render top to bottom exactly as learners see them. Save each block as you go"
      />
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[380px_1fr]">
        <LessonMetaForm
          lesson={{
            id: lesson.id,
            title: lesson.title,
            objective: lesson.objective,
            estimated_minutes: lesson.estimated_minutes,
            status: lesson.status,
            version: lesson.version,
            topic_id: lesson.topic_id,
          }}
          topics={(topics ?? []).map((t) => ({ id: t.id, name: t.name }))}
        />
        <BlockEditor
          lessonId={lesson.id}
          lessonStatus={lesson.status}
          moveTargets={(siblings ?? []).map((s) => ({ id: s.id, title: s.title, status: s.status }))}
          initial={(blocks ?? []).map((b) => ({
            id: b.id,
            block_type: b.block_type,
            content: (b.content ?? {}) as Record<string, unknown>,
          }))}
        />
      </div>
    </div>
  )
}
