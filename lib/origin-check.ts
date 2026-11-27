import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * defence-in-depth Origin check for mutations. Next's Server Actions already
 * compare Origin with Host; route handlers do not. Reject a cross-origin POST
 * early. GET and webhooks (signature-verified) are exempt by the caller.
 */
export async function originAllowed(): Promise<boolean> {
  const h = await headers()
  const origin = h.get('origin')
  if (!origin) return true // same-origin navigations / curl clients
  const host = h.get('host')
  if (!host) return true
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

export function originDenied() {
  return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
}
