import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/', request.url))

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  try {
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      await supabase.auth.signOut()
    }
  } catch (err) {
    // signOut may fail after the server session is gone but before the SSR
    // client writes its cookie deletions. Report it without logging tokens.
    console.error('[logout] sign out failed:', err instanceof Error ? err.message : 'unknown error')
  }

  // Never leave a valid session cookie behind on a logout response, even if
  // the auth call failed. Clearing by name is harmless when signOut already
  // did it.
  for (const cookie of request.cookies.getAll()) {
    if (/^sb-.*-auth-token/.test(cookie.name)) {
      response.cookies.set(cookie.name, '', { path: '/', maxAge: 0 })
    }
  }

  return response
}
