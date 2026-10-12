'use client'

import { useRouter } from 'next/navigation'
import NewSchoolForm from './form'

export default function NewSchoolFormWrapper() {
  const router = useRouter()
  return <NewSchoolForm onAdded={() => router.refresh()} />
}
