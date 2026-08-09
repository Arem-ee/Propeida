import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { maybeSendWelcomeEmail } from '@/lib/emails/send'

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
      let redirectPath: string
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single()

        redirectPath = profile && /^user_[a-f0-9]{8}$/.test(profile.username)
          ? '/auth/set-username'
          : '/dashboard'

        if (profile && /^user_[a-f0-9]{8}$/.test(profile.username)) {
          await maybeSendWelcomeEmail(user.id)
        }
      } else {
        redirectPath = '/dashboard'
      }

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

  return NextResponse.redirect(new URL('/login?error=oauth_failed', baseUrl))
}