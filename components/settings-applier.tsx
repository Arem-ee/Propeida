'use client'

import { useEffect } from 'react'
import { applyPreferences } from '@/lib/settings'

/** Boots display preferences before first paint of app routes. */
export default function SettingsApplier() {
  useEffect(() => {
    applyPreferences()
  }, [])
  return null
}
