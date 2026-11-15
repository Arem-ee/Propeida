'use client'

import { useEffect, useRef } from 'react'

/**
 * Confetti: a proper spray for big moments only.
 *
 * Two cannons at the bottom corners fire inward and upward with
 * varied spread, a light wind, and gravity — like a celebration
 * eruption, not a one-shot burst. Fires on onboarding completion,
 * practice session completion, and other milestone close-outs.
 *
 * Respects prefers-reduced-motion. No external assets. Self-cleaning.
 */
interface ConfettiProps {
  enabled: boolean
  count?: number
  colors?: string[]
  duration?: number
  onEnd?: () => void
}

const DEFAULT_COLORS = ['#fbbf24', '#f472b6', '#34d399', '#60a5fa', '#fde047', '#a78bfa', '#fb923c']

export function Confetti({
  enabled,
  count = 90,
  colors = DEFAULT_COLORS,
  duration = 1700,
  onEnd,
}: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) return
    const canvas = canvasRef.current
    if (!canvas) return
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onEnd?.()
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) { onEnd?.(); return }

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height

    type Particle = {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      color: string
      rotation: number
      vr: number
      life: number
      shape: 'rect' | 'circle'
    }

    const particles: Particle[] = []
    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)] ?? '#fbbf24'

    // Two cannons, angled inward and up. Each particle samples a
    // velocity within ±22° of the cannon's aim line.
    const cannons: { origin: { x: number; y: number }; baseAngle: number; speed: [number, number] }[] = [
      { origin: { x: -10, y: height * 0.92 }, baseAngle: -52, speed: [7, 15] },
      { origin: { x: width + 10, y: height * 0.92 }, baseAngle: -128, speed: [7, 15] },
      { origin: { x: width * 0.5, y: height + 10 }, baseAngle: -90, speed: [9, 18] },
    ]

    for (const cannon of cannons) {
      const per = Math.floor(count / cannons.length)
      for (let i = 0; i < per; i++) {
        const spreadDeg = (Math.random() - 0.5) * 44
        const angle = ((cannon.baseAngle + spreadDeg) * Math.PI) / 180
        const speed = cannon.speed[0] + Math.random() * (cannon.speed[1] - cannon.speed[0])
        particles.push({
          x: cannon.origin.x,
          y: cannon.origin.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 4 + Math.random() * 7,
          color: pick(colors),
          rotation: Math.random() * 360,
          vr: (Math.random() - 0.5) * 24,
          life: 1,
          shape: Math.random() < 0.35 ? 'circle' : 'rect',
        })
      }
    }

    const start = performance.now()
    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)

      ctx.clearRect(0, 0, width, height)

      // Light wind drift, stronger later in the spray
      const wind = Math.sin(progress * Math.PI) * 0.06

      for (const p of particles) {
        p.x += p.vx + wind * 10
        p.y += p.vy
        p.vy += 0.22 // gravity
        p.vx *= 0.995
        p.rotation += p.vr
        p.life = 1 - progress

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.fillStyle = p.color
        if (p.shape === 'circle') {
          ctx.beginPath()
          ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65)
        }
        ctx.restore()
      }

      if (progress < 1) {
        animRef.current = requestAnimationFrame(tick)
      } else {
        ctx.clearRect(0, 0, width, height)
        onEnd?.()
      }
    }

    animRef.current = requestAnimationFrame(tick)

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      ctx.clearRect(0, 0, width, height)
    }
  }, [enabled, count, colors, duration, onEnd])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[60] pointer-events-none"
      aria-hidden="true"
    />
  )
}
