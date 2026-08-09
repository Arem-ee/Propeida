import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PROTECTED_PREFIXES = ['/dashboard', '/results', '/history', '/leaderboard', '/practice', '/account', '/settings', '/admin']
const EXACT_PROTECTED = ['/onboarding']

function isProtectedPath(pathname: string): boolean {
  if (EXACT_PROTECTED.includes(pathname)) return true
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/'))
}

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

  let user
  try {
    // getUser() validates the token against the auth server (and refreshes it
    // when expired) instead of trusting the cookie like getSession() does.
    const result = await supabase.auth.getUser()
    user = result.data.user ?? null
  } catch {
    return response
  }

  const isAuthPage = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup'
  const isUsernamePage = request.nextUrl.pathname === '/auth/set-username'
  const isLandingPage = request.nextUrl.pathname === '/'

  if (!user && (isProtectedPath(request.nextUrl.pathname) || isUsernamePage)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  if (user && (isAuthPage || isLandingPage)) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/',
    '/dashboard', '/dashboard/:path*',
    '/results', '/results/:path*',
    '/history',
    '/leaderboard',
    '/practice', '/practice/:path*',
    '/account', '/account/:path*',
    '/settings',
    '/admin', '/admin/:path*',
    '/auth/set-username',
    '/login', '/signup',
    '/onboarding',
  ],
}
