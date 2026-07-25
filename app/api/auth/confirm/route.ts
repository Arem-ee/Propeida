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
  const next = searchParams.get('next') ?? '/login?confirmed=true'
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? new URL(request.url).origin

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string }[]) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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

      if (next !== '/login?confirmed=true') {
        if (!next.startsWith('/')) {
          return NextResponse.redirect(new URL('/login?confirmed=true', baseUrl))
        }
        return NextResponse.redirect(new URL(next, baseUrl))
      }

      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/login?confirmed=true', baseUrl))
    }
  }

  return NextResponse.redirect(new URL('/login?error=verification_failed', baseUrl))
}