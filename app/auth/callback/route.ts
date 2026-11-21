import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { maybeSendWelcomeEmail } from '@/lib/emails/send'
import { safeInternalPath } from '@/lib/safe-redirect'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  // Redirect back to the exact host the user started from so auth never
  // bounces users to a different domain (e.g. a Vercel deployment URL).
  const baseUrl = new URL(request.url).origin
  const next = safeInternalPath(searchParams.get('next'))

  const errorCode = searchParams.get('error_code')
  const errorDescription = searchParams.get('error_description')
  if (errorCode || errorDescription) {
    return NextResponse.redirect(new URL('/login?error=oauth_failed', baseUrl))
  }

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

    // Use the user returned by the exchange. A second getUser() would read
    // request.cookies (which still holds the pre-exchange state) and miss the
    // session we just wrote to tempRes.
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const user = data.user
      if (user) {
        // Placeholder user_* usernames no longer block the app: the user goes
        // straight to the dashboard and is prompted to choose a username there.
        await maybeSendWelcomeEmail(user.id)
      }

      const response = NextResponse.redirect(new URL(next, baseUrl))
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

    console.error('[auth/callback] code exchange failed:', error.message)
  }

  return NextResponse.redirect(new URL('/login?error=oauth_failed', baseUrl))
}
