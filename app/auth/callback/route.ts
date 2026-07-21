import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

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
      let redirectUrl: URL
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single()

        redirectUrl = profile && /^user_[a-f0-9]{8}$/.test(profile.username)
          ? new URL('/auth/set-username', origin)
          : new URL('/onboarding', origin)
      } else {
        redirectUrl = new URL('/dashboard', origin)
      }

      const response = NextResponse.redirect(redirectUrl)
      for (const cookie of tempRes.cookies.getAll()) {
        response.cookies.set(cookie.name, cookie.value)
      }
      return response
    }
  }

  return NextResponse.redirect(new URL('/login?error=oauth_failed', origin))
}