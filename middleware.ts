import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup'
  const isUsernamePage = request.nextUrl.pathname === '/auth/set-username'
  const isProtected = request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/results') ||
    request.nextUrl.pathname.startsWith('/history') ||
    request.nextUrl.pathname.startsWith('/leaderboard') ||
    request.nextUrl.pathname.startsWith('/practice') ||
    request.nextUrl.pathname.startsWith('/account') ||
    request.nextUrl.pathname.startsWith('/settings') ||
    request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname === '/onboarding' ||
    request.nextUrl.pathname === '/support'

  if (!user && (isProtected || isUsernamePage)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/results/:path*', '/history', '/leaderboard', '/practice/:path*', '/settings', '/admin/:path*', '/auth/set-username', '/login', '/signup', '/onboarding', '/support'],
}
