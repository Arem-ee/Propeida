'use client'

import { useEffect } from 'react'
import { track } from '@/lib/analytics'

export default function PageTrack({ event }: { event: string }) {
  useEffect(() => {
    void track(event)
  }, [event])

  return null
}
