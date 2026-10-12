'use client'

/**
 * Display + feedback preferences. Local-first (no account needed, works
 * offline); a learner's comfort settings must never depend on sync.
 */

export type FontScale = 'standard' | 'large'
export type Theme = 'default' | 'cream' | 'sunlight'

const KEYS = {
  font: 'propeida-font',
  theme: 'propeida-theme',
  sound: 'propeida-sound',
  haptics: 'propeida-haptics',
} as const

function read<T extends string>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key)
    return (v as T) ?? fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // private mode etc: preferences simply don't persist
  }
}

export function getPreferences(): { font: FontScale; theme: Theme; sound: boolean; haptics: boolean } {
  if (typeof window === 'undefined') {
    return { font: 'standard', theme: 'default', sound: true, haptics: true }
  }
  return {
    font: read<FontScale>(KEYS.font, 'standard'),
    theme: read<Theme>(KEYS.theme, 'default'),
    sound: read(KEYS.sound, 'on') === 'on',
    haptics: read(KEYS.haptics, 'on') === 'on',
  }
}

export function setPreference(key: 'font' | 'theme' | 'sound' | 'haptics', value: string) {
  write(KEYS[key], value)
  applyPreferences()
}

/** Apply to the live document. Called on boot and on every change. */
export function applyPreferences() {
  if (typeof document === 'undefined') return
  const prefs = getPreferences()
  document.documentElement.dataset.font = prefs.font
  document.body.dataset.theme = prefs.theme
}
