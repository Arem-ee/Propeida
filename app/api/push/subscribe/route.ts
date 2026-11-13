import { createClient } from '@/lib/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { endpoint, keys } = await req.json()
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: 'Missing subscription fields' }, { status: 400 })
  }

  // The push service URL is stored and later handed to web-push, so an
  // attacker-supplied endpoint would become a server-side POST target.
  // Restrict to the browser push services in use.
  let endpointUrl: URL
  try {
    endpointUrl = new URL(endpoint)
  } catch {
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 })
  }
  const host = endpointUrl.hostname.toLowerCase()
  const allowedHostSuffixes = [
    'fcm.googleapis.com',       // Chrome / Android push
    'push.services.mozilla.com', // Firefox push (update.push.services.mozilla.com)
    'web.push.apple.com',       // Safari push
    'notify.windows.com',       // Edge / WNS (*.notify.windows.com)
  ]
  const hostAllowed =
    endpointUrl.protocol === 'https:' &&
    allowedHostSuffixes.some((s) => host === s || host.endsWith(`.${s}`))
  if (!hostAllowed) {
    return NextResponse.json({ error: 'Unsupported push endpoint' }, { status: 400 })
  }

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: user.id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
    { onConflict: 'user_id,endpoint', ignoreDuplicates: false }
  )

  if (error) {
    console.error('[push/subscribe] upsert error:', error)
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
