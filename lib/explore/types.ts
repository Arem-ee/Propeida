export interface CareerListItem {
  id: string
  slug: string
  name: string
  category: string
  short_description: string | null
}

export interface CourseListItem {
  id: string
  slug: string
  name: string
  description: string | null
}

export interface UniversityListItem {
  id: string
  slug: string
  name: string
  location: string | null
  type: string | null
}

export interface LinkedUniversity extends UniversityListItem {
  website: string | null
  description: string | null
}

export interface LinkedCourse {
  id: string
  slug: string
  name: string
  description: string | null
  universities: LinkedUniversity[]
}

export interface LinkedCareer {
  id: string
  slug: string
  name: string
  category: string
  short_description: string | null
}

export interface CareerDetail {
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
  courses: LinkedCourse[]
  relatedCareerItems: LinkedCareer[]
}

export interface CourseDetail {
  id: string
  slug: string
  name: string
  description: string | null
  careers: LinkedCareer[]
  universities: LinkedUniversity[]
  relatedCourses: CourseListItem[]
}

export interface LinkedCareerMinimal {
  id: string
  slug: string
  name: string
  category: string
}

export interface LinkedCourseWithCareers {
  id: string
  slug: string
  name: string
  description: string | null
  careers: LinkedCareerMinimal[]
}

export interface UniversityDetail {
  id: string
  slug: string
  name: string
  location: string | null
  type: string | null
  description: string | null
  website: string | null
  courses: LinkedCourseWithCareers[]
}

export interface ExploreHomeData {
  careers: CareerListItem[]
  courses: CourseListItem[]
  universities: UniversityListItem[]
  counts: { careers: number; courses: number; universities: number }
}

export interface SearchResults {
  careers: CareerListItem[]
  courses: CourseListItem[]
  universities: UniversityListItem[]
}
