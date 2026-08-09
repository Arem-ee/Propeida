import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

async function waitForProfile(supabase: ReturnType<typeof createServerClient>, userId: string) {
  const delays = [300, 600, 1200, 2400]
  for (let attempt = 0; attempt <= 4; attempt++) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (data) return

    if (error && error.code !== 'PGRST116') {
      console.error(`[auth/confirm] Profile check attempt ${attempt + 1}/5 unexpected error:`, error)
      return
    }

    if (attempt < 4) {
      await new Promise((r) => setTimeout(r, delays[attempt]))
    }
  }

  console.warn('[auth/confirm] Profile not visible after 5 attempts, redirecting anyway')
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  // Redirect back to the exact host the user started from so auth never
  // bounces users to a different domain (e.g. a Vercel deployment URL).
  const baseUrl = new URL(request.url).origin

  if (code) {
    const tempRes = NextResponse.next()

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
              tempRes.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await waitForProfile(supabase, user.id)
      }

      const redirectPath = '/dashboard'
      const response = NextResponse.redirect(new URL(redirectPath, baseUrl))
      for (const cookie of tempRes.cookies.getAll()) {
        // Preserve attributes (maxAge, path, sameSite, ...) — dropping them
        // turns the session cookies into session-only cookies that are lost
        // when the browser closes.
        response.cookies.set(cookie.name, cookie.value, {
          domain: cookie.domain,
          expires: cookie.expires,
          httpOnly: cookie.httpOnly,
          maxAge: cookie.maxAge,
          path: cookie.path,
          sameSite: cookie.sameSite,
          secure: cookie.secure,
        })
      }
      return response
    }
  }

  return NextResponse.redirect(new URL('/login?error=verification_failed', baseUrl))
}