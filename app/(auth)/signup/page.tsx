'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Check, X, Loader2, MailCheck } from 'lucide-react'
import AuthShell from '@/components/auth/auth-shell'
import { GoogleIcon } from '@/components/auth/google-icon'
import { friendlyAuthError } from '@/lib/auth-errors'
import { track } from '@/lib/analytics'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
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

  const checkUsername = async (value: string) => {
    if (value.length < 2) {
      setUsernameStatus('idle')
      setSuggestion(null)
      return
    }

    setUsernameStatus('checking')

    const { data } = await supabaseRef.current
      .from('profiles')
      .select('username')
      .ilike('username', value)
      .maybeSingle()

    if (data) {
      setUsernameStatus('taken')
      let counter = 1
      let alt = `${value}${counter}`
      while (true) {
        const { data: exists } = await supabaseRef.current
          .from('profiles')
          .select('username')
          .ilike('username', alt)
          .maybeSingle()
        if (!exists) break
        counter++
        alt = `${value}${counter}`
      }
      setSuggestion(alt)
    } else {
      setUsernameStatus('available')
      setSuggestion(null)
    }
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    markStarted()
    const value = e.target.value.replace(/[^a-zA-Z0-9_-]/g, '')
    setUsername(value)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (value.length < 2) {
      setUsernameStatus('idle')
      setSuggestion(null)
      return
    }

    debounceRef.current = setTimeout(() => checkUsername(value), 400)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    markStarted()

    if (usernameStatus === 'taken') {
      setError(`Username "${username}" is already taken, so try "${suggestion}" instead`)
      return
    }

    if (username.length < 2) {
      setError('Username must be at least 2 characters')
      return
    }

    if (!agreed) {
      setError('Please agree to the Terms of Service and Privacy Policy before you create your account')
      return
    }

    setLoading(true)

    const redirectPath = typeof window !== 'undefined' ? localStorage.getItem('pending_redirect') || '/login?confirmed=true' : '/login?confirmed=true'

    const supabase = supabaseRef.current
    const { data: signUpData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: `${window.location.origin}/api/auth/confirm?next=${encodeURIComponent(redirectPath)}`,
      },
    })

    setLoading(false)

    if (authError) {
      setError(friendlyAuthError(authError.message, 'signup'))
      return
    }

    if (signUpData?.user?.id) {
      void fetch('/api/auth/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: signUpData.user.id }),
        keepalive: true,
      }).catch(() => {})
    }

    void track('signup-complete', { method: 'email' })
    setVerificationSent(true)
  }

  const handleGoogleSignup = async () => {
    setError(null)

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
          <label htmlFor="username" className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
            Username
          </label>
          <div className="relative">
            <input
              id="username"
              type="text"
              required
              minLength={2}
              value={username}
              onChange={handleUsernameChange}
              placeholder="YourPublicName"
              className="min-h-[44px] w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm text-ink placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              {usernameStatus === 'checking' && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
              {usernameStatus === 'available' && <Check className="h-4 w-4 text-green-500" />}
              {usernameStatus === 'taken' && <X className="h-4 w-4 text-red-500" />}
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
            This shows on your profile, so pick the name you want people to see
          </p>
          {usernameStatus === 'taken' && suggestion && (
            <p className="mt-1 text-xs text-red-600">
              That name is taken, so try <button type="button" onClick={() => { setUsername(suggestion); checkUsername(suggestion) }} className="cursor-pointer font-bold text-blue-600 underline hover:text-blue-700">{suggestion}</button> instead
            </p>
          )}
        </div>

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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Use at least 6 characters"
            className="min-h-[44px] w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-blue-600"
          />
          <span className="text-xs font-semibold leading-relaxed text-ink-soft">
            I agree to the{' '}
            <Link
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="font-bold text-blue-600 underline hover:text-blue-700"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="font-bold text-blue-600 underline hover:text-blue-700"
            >
              Privacy Policy
            </Link>
          </span>
        </label>

        <button
          type="submit"
          disabled={loading || usernameStatus === 'checking'}
          className="pressable min-h-[44px] w-full cursor-pointer rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-[0_8px_20px_-10px_rgba(37,99,235,0.8)] hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400"
        >
          {loading ? 'We are creating your account' : 'Create account'}
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
        onClick={handleGoogleSignup}
        disabled={googleLoading}
        className="pressable flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-3 text-sm font-bold text-ink-soft hover:border-blue-200 hover:bg-blue-50/40 active:bg-blue-50 disabled:opacity-50"
      >
        <GoogleIcon />
        {googleLoading ? 'We are taking you to Google' : 'Continue with Google'}
      </button>

      <p className="mt-6 text-center text-sm text-ink-soft">
        You can sign in if you already have an account
        <Link href="/login" className="mt-1 block font-bold text-blue-600 hover:text-blue-700">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}
