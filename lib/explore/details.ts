import { getPublicClient } from './supabase'
import { getCareerOpportunity } from './opportunity'
import type {
  CareerDetail,
  CourseDetail,
  CourseListItem,
  LinkedCareer,
  LinkedCareerMinimal,
  LinkedCourse,
  LinkedCourseWithCareers,
  LinkedUniversity,
  UniversityDetail,
} from './types'

function sortByName<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name))
}

export interface CareerRow {
  id: string
  slug: string
  name: string
  category: string
  short_description: string | null
  description: string | null
  what_you_do: string[]
  work_environments: string[]
  industries: string[]
  common_job_titles: string[]
  skills: string[]
  misconceptions: string[]
  career_progression: string | null
  related_careers: string[]
  published: boolean
  career_courses: {
    course: {
      id: string
      slug: string
      name: string
      description: string | null
      course_universities: {
        university: LinkedUniversity
      }[]
    }
  }[]
}

export async function getCareerBySlug(slug: string): Promise<CareerDetail | null> {
  const supabase = getPublicClient()
  const { data: row, error } = await supabase
    .from('careers')
    .select(
      `id, slug, name, category, short_description, description,
       what_you_do, work_environments, industries, common_job_titles, skills,
       misconceptions, career_progression, related_careers, published,
       career_courses (
         course:course_id (
           id, slug, name, description,
           course_universities!course_universities_course_id_fkey (
             university:university_id (id, slug, name, location, type, website, description)
           )
         )
       )`,
    )
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  if (error || !row) return null
  const career = row as unknown as CareerRow

  const opportunity = getCareerOpportunity(career.slug)

  const courses: LinkedCourse[] = sortByName(
    career.career_courses.map((cc) => ({
      id: cc.course.id,
      slug: cc.course.slug,
      name: cc.course.name,
      description: cc.course.description,
      universities: cc.course.course_universities.map((cu) => cu.university),
    })),
  )

  let relatedCareerItems: LinkedCareer[] = []
  if (career.related_careers.length > 0) {
    const { data: related } = await supabase
      .from('careers')
      .select('id, slug, name, category, short_description')
      .eq('published', true)
      .in('slug', career.related_careers)
    relatedCareerItems = sortByName(related ?? [])
  }

  return {
    id: career.id,
    slug: career.slug,
    name: career.name,
    category: career.category,
    short_description: career.short_description,
    description: career.description,
    what_you_do: career.what_you_do,
    work_environments: career.work_environments,
    industries: career.industries,
    common_job_titles: career.common_job_titles,
    skills: career.skills,
    misconceptions: career.misconceptions,
    career_progression: career.career_progression,
    related_careers: career.related_careers,
    demand_level: opportunity?.demand.level ?? null,
    demand_summary: opportunity?.demand.summary ?? null,
    demand_evidence: opportunity?.demand.evidenceNote ?? null,
    outlook_level: opportunity?.outlook.level ?? null,
    outlook_basis: opportunity?.outlook.basis ?? null,
    outlook_summary: opportunity?.outlook.summary ?? null,
    nigerian_reality: opportunity?.nigerianReality ?? null,
    international_transferability: opportunity?.internationalTransferability.intro ?? null,
    skill_stack: opportunity?.employability.skills ?? null,
    learning_path: opportunity?.learningPath ?? null,
    evidence: opportunity?.evidence ?? null,
    last_reviewed: opportunity?.lastReviewed ?? null,
    courses,
    relatedCareerItems,
  }
}

export interface CourseRow {
  id: string
  slug: string
  name: string
  description: string | null
  published: boolean
  career_courses: {
    career: LinkedCareer
  }[]
  course_universities: {
    university: LinkedUniversity
  }[]
}

export async function getCourseBySlug(slug: string): Promise<CourseDetail | null> {
  const supabase = getPublicClient()
  const { data: row, error } = await supabase
    .from('courses')
    .select(
      `id, slug, name, description, published,
       career_courses (
         career:career_id (id, slug, name, category, short_description)
       ),
       course_universities!course_universities_course_id_fkey (
         university:university_id (id, slug, name, location, type, website, description)
       )`,
    )
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  if (error || !row) return null
  const course = row as unknown as CourseRow

  const careers = sortByName(course.career_courses.map((cc) => cc.career))
  const universities: LinkedUniversity[] = course.course_universities.map((cu) => cu.university)

  let relatedCourses: CourseListItem[] = []
  if (careers.length > 0) {
    const { data: related } = await supabase
      .from('career_courses')
      .select('course:course_id(id, slug, name, description)')
      .in('career_id', careers.map((career) => career.id))
    const seen = new Set<string>([course.id])
    relatedCourses = (related ?? [])
      .map((cc) => (cc as unknown as { course: CourseListItem }).course)
      .filter((item) => {
        if (seen.has(item.id)) return false
        seen.add(item.id)
        return true
      })
      .slice(0, 6)
  }

  return {
    id: course.id,
    slug: course.slug,
    name: course.name,
    description: course.description,
    careers,
    universities,
    relatedCourses: sortByName(relatedCourses),
  }
}

export interface UniversityRow {
  id: string
  slug: string
  name: string
  location: string | null
  type: string | null
  description: string | null
  website: string | null
  published: boolean
  course_universities: {
    course: {
      id: string
      slug: string
      name: string
      description: string | null
      career_courses: {
        career: LinkedCareerMinimal
      }[]
    }
  }[]
}

export async function getUniversityBySlug(slug: string): Promise<UniversityDetail | null> {
  const supabase = getPublicClient()
  const { data: row, error } = await supabase
    .from('schools')
    .select(
      `id, slug, name, location, type, description, website, published,
       course_universities!course_universities_university_id_fkey (
         course:course_id (
           id, slug, name, description,
           career_courses (
             career:career_id (id, slug, name, category)
           )
         )
       )`,
    )
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  if (error || !row) return null
  const university = row as unknown as UniversityRow

  const courses: LinkedCourseWithCareers[] = sortByName(
    university.course_universities.map((cu) => ({
      id: cu.course.id,
      slug: cu.course.slug,
      name: cu.course.name,
      description: cu.course.description,
      careers: sortByName(cu.course.career_courses.map((cc) => cc.career)),
    })),
  )

  return {
    id: university.id,
    slug: university.slug,
    name: university.name,
    location: university.location,
    type: university.type,
    description: university.description,
    website: university.website,
    courses,
  }
}