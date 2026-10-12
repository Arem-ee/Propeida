'use client'

import { getPreferences } from './settings'

let audioCtx: AudioContext | null = null

function chime() {
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return
    audioCtx ??= new Ctor()
    if (audioCtx.state === 'suspended') void audioCtx.resume()
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(660, audioCtx.currentTime)
    osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12)
    gain.gain.setValueAtTime(0.0001, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4)
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.start()
    osc.stop(audioCtx.currentTime + 0.45)
  } catch {
    // audio is garnish; silence is always acceptable
  }
}

/**
 * Completion celebration: one short chime + one soft haptic, only at
 * session close-out, honoring user prefs and reduced-motion. Never during
 * questions. No assets, no downloads, works offline.
 */
export function celebrate() {
  if (typeof window === 'undefined') return
  const prefs = getPreferences()
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  try {
    if (prefs.haptics && 'vibrate' in navigator) navigator.vibrate(18)
  } catch {
    // ignore
  }
  if (prefs.sound) chime()
}
