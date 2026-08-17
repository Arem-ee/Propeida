'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CourseForm from '@/components/explore-admin/course-form'

export default function NewCoursePage() {
  const [careers, setCareers] = useState<{ id: string; name: string }[]>([])
  const [universities, setUniversities] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    fetch('/api/admin/explore/refs')
      .then((res) => res.json())
      .then((data) => {
        setCareers(data.careers ?? [])
        setUniversities(data.universities ?? [])
      })
      .catch(() => undefined)
  }, [])

  return (
    <div>
      <Link
        href="/admin/explore/courses"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 min-h-[32px]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Courses
      </Link>
      <h1 className="mb-8 text-2xl font-extrabold text-gray-900">New Course</h1>
      <CourseForm careers={careers} universities={universities} />
    </div>
  )
}