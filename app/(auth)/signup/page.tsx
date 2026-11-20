'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { MailCheck } from 'lucide-react'
import AuthShell from '@/components/auth/auth-shell'
import { GoogleIcon } from '@/components/auth/google-icon'
import { friendlyAuthError } from '@/lib/auth-errors'
import { track } from '@/lib/analytics'

/** Where the confirmation link continues after the session is established. */
function confirmationNext(): string {
  if (typeof window === 'undefined') return '/home'
  const stored = localStorage.getItem('pending_redirect')
  return stored && stored.startsWith('/') && !stored.startsWith('//') ? stored : '/home'
}

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [resendError, setResendError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const startedRef = useRef(false)
  const supabaseRef = useRef(createClient())

  const markStarted = () => {
    if (startedRef.current) return
    startedRef.current = true
    void track('signup-start')
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) {
      try {
        localStorage.setItem('pending_ref', ref)
      } catch {}
    }
    const redirect = params.get('redirect')
    if (redirect) {
      try {
        localStorage.setItem('pending_redirect', redirect)
      } catch {}
    }
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((n) => Math.max(0, n - 1)), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    markStarted()

    if (!agreed) {
      setError('Please agree to the Terms of Service and Privacy Policy before you create your account')
      return
    }

    setLoading(true)

    // The confirmation link must land on a page that can read the session.
    // Supabase's default email template returns tokens in a URL fragment,
    // which a server route cannot see, so /auth/finish handles the handoff.
    const redirectPath = confirmationNext()

    const supabase = supabaseRef.current
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/finish?next=${encodeURIComponent(redirectPath)}`,
      },
    })

    setLoading(false)

    if (authError) {
      setError(friendlyAuthError(authError.message, 'signup'))
      return
    }

    // Welcome mail is intentionally not sent here. At this point the account
    // exists but is unverified and has no session, so it belongs after the
    // confirmation link is followed (/auth/finish or /api/auth/confirm).
    void track('signup-complete', { method: 'email' })
    setVerificationSent(true)
  }

  const handleGoogleSignup = async () => {
    setError(null)
    markStarted()

    if (!agreed) {
      setError('Please agree to the Terms of Service and Privacy Policy before you continue with Google')
      return
    }

    setGoogleLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(friendlyAuthError(error.message, 'signup'))
      setGoogleLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setResendError(null)
    setResent(false)

    // Resend issues a fresh link, so it needs the same handoff URL as signup.
    const { error } = await supabaseRef.current.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/finish?next=${encodeURIComponent(confirmationNext())}`,
      },
    })

    setResending(false)
    if (error) {
      setResendError(friendlyAuthError(error.message, 'signup'))
      return
    }

    setResent(true)
    setCooldown(60)
  }

  if (verificationSent) {
    return (
      <AuthShell mode="signup">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <MailCheck className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight text-ink">Check your email</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            We sent a verification link to <strong>{email}</strong>, so click it to activate your account
          </p>

          <div className="mt-5">
            <p className="text-[11px] text-gray-500">No email yet? Check your spam folder, or send it again</p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="pressable mt-2 min-h-[44px] w-full rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-bold text-blue-600 hover:border-blue-200 hover:bg-blue-50/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resending
                ? 'We are sending another link'
                : cooldown > 0
                  ? `You can resend in ${cooldown}s`
                  : 'Resend verification email'}
            </button>
            {resent && (
              <p role="status" className="mt-2 text-xs font-semibold text-green-700">
                We sent another link, so check your inbox
              </p>
            )}
            {resendError && (
              <div role="alert" className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                {resendError}
              </div>
            )}
          </div>

          <Link
            href="/login"
            className="pressable mt-6 inline-block min-h-[44px] w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-[0_8px_20px_-10px_rgba(37,99,235,0.8)] hover:bg-blue-700"
          >
            Go to sign in
          </Link>
          <p className="mt-4 text-xs text-gray-500">You can close this tab after you confirm your email</p>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell mode="signup">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Create your account</h1>
      <p className="mt-1.5 text-sm text-ink-soft">You can start with a free account</p>

      <form onSubmit={handleSignup} className="mt-6 space-y-4">
        {error && (
          <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{error}</div>
        )}

        <div>
          <label htmlFor="email" className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => { markStarted(); setEmail(e.target.value) }}
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
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(e) => { markStarted(); setPassword(e.target.value) }}
            placeholder="Use at least 6 characters"
            className="min-h-[44px] w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
          />
        </div>

        {/* Quiet by design: the agreement supports the action, it does not
            compete with the two fields or the primary button. */}
        <label className="flex cursor-pointer items-start gap-2 pt-0.5">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-blue-600"
          />
          <span className="text-[11px] leading-relaxed text-gray-500">
            I agree to the{' '}
            <Link
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="font-semibold text-blue-600 hover:underline"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="font-semibold text-blue-600 hover:underline"
            >
              Privacy Policy
            </Link>
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="pressable min-h-[44px] w-full cursor-pointer rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-[0_8px_20px_-10px_rgba(37,99,235,0.8)] hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400"
        >
          {loading ? 'We are creating your account' : 'Create account'}
        </button>
      </form>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-[11px]">
          <span className="bg-white px-2 text-gray-400">You can also use Google</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignup}
        disabled={googleLoading}
        className="pressable flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-3 text-sm font-bold text-ink-soft hover:border-blue-200 hover:bg-blue-50/40 active:bg-blue-50 disabled:opacity-50"
      >
        <GoogleIcon />
        {googleLoading ? 'We are taking you to Google' : 'Continue with Google'}
      </button>

      <p className="mt-5 text-center text-xs text-ink-soft">
        You can sign in if you already have an account
        <Link href="/login" className="mt-1 block font-bold text-blue-600 hover:text-blue-700">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}
