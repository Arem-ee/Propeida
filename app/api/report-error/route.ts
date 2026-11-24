import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { checkRateLimit, getClientIp, rateLimitKey } from '@/lib/rate-limit'
import { reportError } from '@/lib/error-report'

/** Client error boundaries report here. No tokens, emails or ids are accepted. */
export async function POST(request: Request) {
  const headersList = await headers()
  const ip = getClientIp((name) => headersList.get(name))
  const { allowed } = await checkRateLimit(rateLimitKey(ip, 'client-error'), 5, 60000)
  if (!allowed) return NextResponse.json({ ok: false }, { status: 429 })

  let body: { scope?: unknown; message?: unknown; path?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const scope = typeof body.scope === 'string' ? body.scope.slice(0, 40) : 'client'
  const message = typeof body.message === 'string' ? body.message.slice(0, 500) : 'unknown client error'
  const path = typeof body.path === 'string' ? body.path.slice(0, 120) : undefined

  await reportError(`client/${scope}`, new Error(message), path)

  return NextResponse.json({ ok: true })
}
