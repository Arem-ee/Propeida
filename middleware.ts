import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PROTECTED_PREFIXES = [
  '/home',
  '/learn',
  '/practice',
  '/mocks',
  '/progress',
  '/results',
  '/account',
  '/target',
  '/admin',
]
const EXACT_PROTECTED = ['/onboarding']

function isProtectedPath(pathname: string): boolean {
  if (EXACT_PROTECTED.includes(pathname)) return true
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/'))
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next()

  const pathname = request.nextUrl.pathname
  const needsAuth = isProtectedPath(pathname) || pathname === '/auth/set-username'
  const hasAuthCookie = request.cookies
    .getAll()
    .some(({ name }) => name.startsWith('sb-') && name.includes('auth-token'))

  // No session cookie: protected routes bounce immediately and anonymous
  // visitors never pay for a Supabase client on the edge.
  if (!hasAuthCookie) {
    if (needsAuth) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
    return response
  }

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
    // Local cookie decode — no network round-trip per navigation. Token
    // refresh happens client-side (dashboard layout) and on auth routes.
    const result = await supabase.auth.getSession()
    user = result.data.session?.user ?? null
  } catch {
    return response
  }

  const isAuthPage = pathname === '/login' || pathname === '/signup'

  if (!user && needsAuth) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    // Honor a safe internal destination (e.g. /login?redirect=/learn);
    // otherwise signed-in users land in the app, not the marketing page.
    const redirect = request.nextUrl.searchParams.get('redirect')
    url.pathname = redirect && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/home'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/',
    '/home',
    '/learn', '/learn/:path*',
    '/practice', '/practice/:path*',
    '/results', '/results/:path*',
    '/mocks', '/mocks/:path*',
    '/progress',
    '/account', '/account/:path*',
    '/admin', '/admin/:path*',
    '/auth/set-username',
    '/login', '/signup',
    '/onboarding',
  ],
}
