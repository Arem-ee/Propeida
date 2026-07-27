'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''

export default function PwaInit() {
  const done = useRef(false)

  useEffect(() => {
    if (done.current) return
    done.current = true

    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js').catch(() => {})

    if (!VAPID_PUBLIC_KEY) return

    // Try to subscribe existing users silently (no prompt)
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        if (sub) return

        // Only subscribe if permission already granted
        if (Notification.permission === 'granted') {
          reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          }).then((newSub) => {
            const supabase = createClient()
            supabase.auth.getUser().then(({ data: { user } }) => {
              if (!user) return
              fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSub.toJSON()),
              }).catch(() => {})
            })
          }).catch(() => {})
        }
      })
    }).catch(() => {})
  }, [])

  return null
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from(rawData.split('').map((c) => c.charCodeAt(0)))
}
