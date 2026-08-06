'use client'

import { useEffect } from 'react'

const ANALYTICS_ENABLED =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED ?? 'true') === 'true'
    : true

function getPath(): string {
  if (typeof window === 'undefined') return ''
  return window.location.pathname + window.location.search
}

export async function track(eventName: string, data: Record<string, unknown> = {}): Promise<void> {
  if (!ANALYTICS_ENABLED) return
  try {
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_name: eventName, data, path: getPath() }),
      keepalive: true,
    })
  } catch {
    // analytics must never break the page
  }
}

export function trackOnce(eventName: string, data: Record<string, unknown> = {}): () => void {
  let fired = false
  return () => {
    if (fired) return
    fired = true
    void track(eventName, data)
  }
}

const WHATSAPP_DOMAINS = ['wa.me', 'whatsapp.com', 'whatsapp.link']

export function useGlobalAnalytics() {
  useEffect(() => {
    if (!ANALYTICS_ENABLED) return

    const handler = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest?.('a') as HTMLAnchorElement | null
      if (!anchor?.href) return
      let host: string
      try {
        host = new URL(anchor.href).hostname
      } catch {
        return
      }
      if (WHATSAPP_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`))) {
        void track('whatsapp-click', { via: 'any-link' })
      }
    }

    document.addEventListener('click', handler, true)
    return () => document.removeEventListener('click', handler, true)
  }, [])
}
