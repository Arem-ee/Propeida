import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import CareerForm from '@/components/explore-admin/career-form'

export default async function EditCareerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: career } = await supabase
    .from('careers')
    .select(
      `id, slug, name, category, short_description, description, career_progression,
       what_you_do, work_environments, industries, common_job_titles, skills,
       misconceptions, related_careers, published,
       career_courses (course:course_id (id))`,
    )
    .eq('id', id)
    .single()
  if (!career) notFound()

  const { data: allCourses } = await supabase.from('courses').select('id, name').order('name')

  return (
    <div>
      <Link
        href="/admin/explore/careers"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 min-h-[32px]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Careers
      </Link>
      <h1 className="mb-8 text-2xl font-extrabold text-gray-900">Edit Career</h1>
      <CareerForm
        courses={allCourses ?? []}
        initial={{
          id: career.id,
          slug: career.slug,
          name: career.name,
          category: career.category,
          short_description: career.short_description ?? '',
          description: career.description ?? '',
          career_progression: career.career_progression ?? '',
          what_you_do: career.what_you_do ?? [],
          work_environments: career.work_environments ?? [],
          industries: career.industries ?? [],
          common_job_titles: career.common_job_titles ?? [],
          skills: career.skills ?? [],
          misconceptions: career.misconceptions ?? [],
          related_careers: career.related_careers ?? [],
          courses: (career.career_courses ?? []).map(
            (cc) => (cc as unknown as { course: { id: string } }).course.id,
          ),
          published: career.published,
        }}
      />
    </div>
  )
}