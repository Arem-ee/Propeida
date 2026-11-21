import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { type EmailOtpType, type User } from '@supabase/supabase-js'
import { maybeSendWelcomeEmail } from '@/lib/emails/send'
import { safeInternalPath } from '@/lib/safe-redirect'
import { logError } from '@/lib/error-log'

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
      logError(`auth/confirm profile attempt ${attempt + 1}/5`, error)
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
  // Redirect back to the exact host the user started from so auth never
  // bounces users to a different domain (e.g. a Vercel deployment URL).
  const baseUrl = new URL(request.url).origin
  const next = safeInternalPath(searchParams.get('next'))

  const errorCode = searchParams.get('error_code')
  const errorDescription = searchParams.get('error_description')
  if (errorCode || errorDescription) {
    const kind = errorCode === 'otp_expired' ? 'link_expired' : 'verification_failed'
    return NextResponse.redirect(new URL(`/login?error=${kind}`, baseUrl))
  }

  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  if (code || (tokenHash && type)) {
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

    let user: User | null = null
    let failure: string | null = null

    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      user = data.user ?? null
      failure = error?.message ?? null
    } else {
      // Custom email templates send token_hash + type instead of a fragment.
      const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash!, type: type! })
      user = data.user ?? null
      failure = error?.message ?? null
    }

    if (!failure) {
      if (user && type !== 'recovery') {
        await waitForProfile(supabase, user.id)
        // Send the welcome only now that the account is verified and the
        // session has been established, never at signup time.
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

    logError('auth/confirm exchange', failure)
  }

  return NextResponse.redirect(new URL('/login?error=verification_failed', baseUrl))
}
