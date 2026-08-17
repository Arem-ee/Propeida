import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import UniversityForm from '@/components/explore-admin/university-form'

export default async function EditUniversityPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: university } = await supabase
    .from('schools')
    .select(
      `id, slug, name, location, type, description, website, published,
       course_universities!course_universities_university_id_fkey (course:course_id (id))`,
    )
    .eq('id', id)
    .single()
  if (!university) notFound()

  const { data: allCourses } = await supabase.from('courses').select('id, name').order('name')

  return (
    <div>
      <Link
        href="/admin/explore/universities"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 min-h-[32px]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Universities
      </Link>
      <h1 className="mb-8 text-2xl font-extrabold text-gray-900">Edit University</h1>
      <UniversityForm
        courses={allCourses ?? []}
        initial={{
          id: university.id,
          slug: university.slug,
          name: university.name,
          location: university.location ?? '',
          type: university.type ?? '',
          description: university.description ?? '',
          website: university.website ?? '',
          courses: (university.course_universities ?? []).map(
            (cu) => (cu as unknown as { course: { id: string } }).course.id,
          ),
          published: university.published,
        }}
      />
    </div>
  )
}