import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

const MAX_EVENT_DATA_LENGTH = 4000

export async function POST(req: Request) {
  let body: { event_name?: unknown; data?: unknown; path?: unknown }
  try {
    body = await req.json()
  } catch {
    return Response.json({ ok: false })
  }

  const eventName = typeof body.event_name === 'string' ? body.event_name.slice(0, 80) : null
  if (!eventName) return Response.json({ ok: false })

  const headersList = await headers()
  const urlPath =
    typeof body.path === 'string' && body.path.length > 0 && body.path.length <= 512
      ? body.path
      : headersList.get('x-pathname')?.slice(0, 512) ?? '/'

  let eventData: Record<string, unknown> = {}
  if (body.data && typeof body.data === 'object') {
    try {
      eventData = JSON.parse(
        JSON.stringify(body.data).slice(0, MAX_EVENT_DATA_LENGTH),
      ) as Record<string, unknown>
    } catch {
      eventData = {}
    }
  }

  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('analytics_events').insert({
      event_name: eventName,
      event_data: eventData,
      user_id: user?.id ?? null,
      url_path: urlPath,
    })

    if (error) {
      return Response.json({ ok: false })
    }
  } catch {
    return Response.json({ ok: false })
  }

  return Response.json({ ok: true })
}