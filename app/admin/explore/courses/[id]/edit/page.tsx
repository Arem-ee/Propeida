import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import CourseForm from '@/components/explore-admin/course-form'

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: course } = await supabase
    .from('courses')
    .select(
      `id, slug, name, description, published,
       career_courses (career:career_id (id)),
       course_universities!course_universities_course_id_fkey (university:university_id (id))`,
    )
    .eq('id', id)
    .single()
  if (!course) notFound()

  const [careersRes, universitiesRes] = await Promise.all([
    supabase.from('careers').select('id, name').order('name'),
    supabase.from('schools').select('id, name').order('name'),
  ])

  return (
    <div>
      <Link
        href="/admin/explore/courses"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 min-h-[32px]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Courses
      </Link>
      <h1 className="mb-8 text-2xl font-extrabold text-gray-900">Edit Course</h1>
      <CourseForm
        careers={careersRes.data ?? []}
        universities={universitiesRes.data ?? []}
        initial={{
          id: course.id,
          slug: course.slug,
          name: course.name,
          description: course.description ?? '',
          careers: (course.career_courses ?? []).map(
            (cc) => (cc as unknown as { career: { id: string } }).career.id,
          ),
          universities: (course.course_universities ?? []).map(
            (cu) => (cu as unknown as { university: { id: string } }).university.id,
          ),
          published: course.published,
        }}
      />
    </div>
  )
}