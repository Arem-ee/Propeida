import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { safeInternalPath } from '@/lib/safe-redirect'

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
  '/recall',
  '/squad',
  '/diagnostic',
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
    // Verified against the auth server — do not substitute getSession(),
    // which only decodes the cookie locally without checking the signature.
    const result = await supabase.auth.getUser()
    user = result.data.user ?? null
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
    url.pathname = safeInternalPath(redirect)
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
    '/target', '/target/:path*',
    '/account', '/account/:path*',
    '/admin', '/admin/:path*',
    '/auth/set-username',
    '/login', '/signup',
    '/onboarding',
    '/recall',
    '/squad', '/squad/:path*',
    '/diagnostic',
  ],
}
