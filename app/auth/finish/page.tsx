'use client'

import { Suspense, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { type EmailOtpType } from '@supabase/supabase-js'
import { Loader2 } from 'lucide-react'
import Logo from '@/components/logo'
import { createClient } from '@/lib/supabase/client'

/** Only allow local paths so the `next` param can never become an open redirect. */
function safeNext(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/home'
  return value
}

/** Welcome mail belongs after a verified session, never at signup time. */
function triggerWelcomeEmail() {
  void fetch('/api/auth/welcome', { method: 'POST', keepalive: true }).catch(() => {})
}

function FinishingAuth() {
  const router = useRouter()
  const params = useSearchParams()
  const started = useRef(false)

  useEffect(() => {
    // Strict mode runs effects twice in development; a code/token can only be
    // exchanged once, so guard against a second attempt.
    if (started.current) return
    started.current = true

    const run = async () => {
      const next = safeNext(params.get('next'))
      const hash = new URLSearchParams(window.location.hash.slice(1))
      // Recovery links carry type=recovery. Route them to the new-password
      // page even if an email template drops the `next` param.
      const linkType = (hash.get('type') || params.get('type') || '').toLowerCase()
      const target = linkType === 'recovery' ? '/auth/update-password' : next

      // Supabase reports failures in the query for OAuth and in the fragment
      // for email confirmation links.
      const errorCode = params.get('error_code') || hash.get('error_code')
      const errorDescription = params.get('error_description') || hash.get('error_description')
      if (errorCode || errorDescription) {
        router.replace(`/login?error=${errorCode === 'otp_expired' ? 'link_expired' : 'auth_failed'}`)
        return
      }

      const supabase = createClient()

      // 1. Supabase's default email template returns the session in the URL
      // fragment (implicit flow). Fragments are never sent to the server, and
      // createBrowserClient is hardcoded to PKCE, so it refuses to process
      // them. Bridge the tokens into the SSR client's cookies here.
      const accessToken = hash.get('access_token')
      const refreshToken = hash.get('refresh_token')
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
        if (!error && linkType !== 'recovery') triggerWelcomeEmail()
        router.replace(error ? '/login?error=verification_failed' : target)
        return
      }

      // 2. A custom email template can send token_hash + type instead of a
      // fragment. verifyOtp works server-side too, but doing it here means the
      // flow works without any dashboard template change.
      const tokenHash = params.get('token_hash')
      const type = params.get('type') as EmailOtpType | null
      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
        if (!error && linkType !== 'recovery') triggerWelcomeEmail()
        router.replace(error ? '/login?error=verification_failed' : target)
        return
      }

      // 3. PKCE auth code (Google OAuth, or a custom PKCE email template).
      // createBrowserClient has detectSessionInUrl enabled, so it exchanges
      // the code with the verifier cookie as soon as the client is created.
      if (params.get('code')) {
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search)
          if (linkType !== 'recovery') triggerWelcomeEmail()
          router.replace(target)
          return
        }
      }

      router.replace('/login?error=verification_failed')
    }

    run().catch(() => router.replace('/login?error=verification_failed'))
  }, [params, router])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <Link href="/" className="mb-8 flex min-h-[44px] items-center">
        <Logo />
      </Link>
      <div className="w-full max-w-sm rounded-xl border border-gray-100 bg-white p-6 text-center shadow-xs">
        <Loader2 className="mx-auto h-7 w-7 animate-spin text-blue-600" aria-hidden="true" />
        <h1 className="mt-4 text-xl font-extrabold text-gray-900">One moment…</h1>
        <p className="mt-2 text-sm text-gray-500" role="status">Finishing your sign in…</p>
      </div>
    </main>
  )
}

export default function AuthFinishPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-blue-600" aria-hidden="true" />
        </main>
      }
    >
      <FinishingAuth />
    </Suspense>
  )
}
