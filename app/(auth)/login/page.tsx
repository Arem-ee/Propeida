'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { claimReferral } from '@/lib/actions/referral'
import { safeInternalPath } from '@/lib/safe-redirect'
import { friendlyAuthError } from '@/lib/auth-errors'
import { CheckCircle } from 'lucide-react'
import AuthShell from '@/components/auth/auth-shell'
import { GoogleIcon } from '@/components/auth/google-icon'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = safeInternalPath(searchParams.get('redirect'))
  const confirmed = searchParams.get('confirmed') === 'true'
  const errParam = searchParams.get('error')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (authError) {
      setError(friendlyAuthError(authError.message, 'login'))
      return
    }

    try {
      const pendingRef = localStorage.getItem('pending_ref')
      if (pendingRef) {
        await claimReferral(pendingRef)
      }
    } catch {
      // Referral is best-effort; don't block login
    } finally {
      localStorage.removeItem('pending_ref')
    }

    router.push(redirect)
    router.refresh()
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(friendlyAuthError(error.message, 'login'))
      setGoogleLoading(false)
    }
  }

  const linkError =
    errParam === 'verification_failed' ||
    errParam === 'link_expired' ||
    errParam === 'auth_failed' ||
    errParam === 'oauth_failed'
  const showStatus = confirmed || linkError || Boolean(error)

  return (
    <>
      {showStatus && (
        <div className="mt-6 space-y-3">
          {confirmed && (
            <div role="status" className="flex items-start gap-2.5 rounded-xl bg-green-50 px-4 py-3 text-xs font-semibold text-green-700">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              Your email is confirmed, so log in to continue
            </div>
          )}

          {errParam === 'verification_failed' && (
            <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
              We could not verify that link, so it may have expired
            </div>
          )}

          {errParam === 'link_expired' && (
            <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
              That link has expired, so go back to sign up and request a new one
            </div>
          )}

          {(errParam === 'auth_failed' || errParam === 'oauth_failed') && (
            <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
              We could not finish signing you in, so try again
            </div>
          )}

          {error && (
            <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{error}</div>
          )}
        </div>
      )}

      <form onSubmit={handleLogin} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="min-h-[44px] w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="min-h-[44px] w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="pressable min-h-[44px] w-full cursor-pointer rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-[0_8px_20px_-10px_rgba(37,99,235,0.8)] hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400"
        >
          {loading ? 'We are signing you in' : 'Sign in'}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-gray-500">You can also use Google</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
        className="pressable flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-3 text-sm font-bold text-ink-soft hover:border-blue-200 hover:bg-blue-50/40 active:bg-blue-50 disabled:opacity-50"
      >
        <GoogleIcon />
        {googleLoading ? 'We are taking you to Google' : 'Sign in with Google'}
      </button>
    </>
  )
}

export default function LoginPage() {
  return (
    <AuthShell mode="login">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Sign in</h1>
      <p className="mt-1.5 text-sm text-ink-soft">You can use your email and password to continue</p>

      <Suspense fallback={<div className="mt-6 text-sm text-ink-soft">We are loading the sign-in form</div>}>
        <LoginForm />
      </Suspense>

      <p className="mt-6 text-center text-sm text-ink-soft">
        You can create an account if you are new here
        <Link href="/signup" className="mt-1 block font-bold text-blue-600 hover:text-blue-700">
          Create an account
        </Link>
      </p>
    </AuthShell>
  )
}
