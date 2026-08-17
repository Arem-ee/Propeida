'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import UniversityForm from '@/components/explore-admin/university-form'

export default function NewUniversityPage() {
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    fetch('/api/admin/explore/refs')
      .then((res) => res.json())
      .then((data) => setCourses(data.courses ?? []))
      .catch(() => setCourses([]))
  }, [])

  return (
    <div>
      <Link
        href="/admin/explore/universities"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 min-h-[32px]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Universities
      </Link>
      <h1 className="mb-8 text-2xl font-extrabold text-gray-900">New University</h1>
      <UniversityForm courses={courses} />
    </div>
  )
}