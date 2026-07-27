'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Check, X, Loader2 } from 'lucide-react'
import Logo from '@/components/logo'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const supabaseRef = useRef(createClient())

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

    const { data, error: _err } = await supabaseRef.current
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

    if (usernameStatus === 'taken') {
      setError(`Username "${username}" is already taken. Try "${suggestion}" instead.`)
      return
    }

    if (username.length < 2) {
      setError('Username must be at least 2 characters.')
      return
    }

    setLoading(true)

    const redirectPath = typeof window !== 'undefined' ? localStorage.getItem('pending_redirect') || '/login?confirmed=true' : '/login?confirmed=true'

    const supabase = supabaseRef.current
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(redirectPath)}`,
      },
    })

    setLoading(false)

    if (authError) {
      setError(authError.message)
      return
    }

    setVerificationSent(true)
  }

  if (verificationSent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <Link href="/" className="mb-8 min-h-[44px] flex items-center">
          <Logo />
        </Link>

        <div className="w-full max-w-sm rounded-xl border border-gray-100 bg-white p-6 shadow-xs text-center">
          <h1 className="text-xl font-extrabold text-gray-900">Check your email</h1>
          <p className="mt-2 text-sm text-gray-500">
            We sent a verification link to <strong>{email}</strong>. Click the link to activate your account.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 min-h-[44px]"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Link href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-gray-900 mb-8 min-h-[44px]">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-base">P</span>
        Propeida
      </Link>

      <div className="w-full max-w-sm rounded-xl border border-gray-100 bg-white p-6 shadow-xs">
        <h1 className="text-xl font-extrabold text-gray-900">Create your account</h1>
        <p className="mt-1 text-sm text-gray-500">Start practicing with a free account.</p>

        <form onSubmit={handleSignup} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{error}</div>
          )}

          <div>
            <label htmlFor="username" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
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
                className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-10 text-sm focus:border-blue-600 focus:outline-none min-h-[44px]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameStatus === 'checking' && <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />}
                {usernameStatus === 'available' && <Check className="h-4 w-4 text-green-500" />}
                {usernameStatus === 'taken' && <X className="h-4 w-4 text-red-500" />}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-gray-400 leading-relaxed">
              This will be shown publicly on the leaderboard — use your real name or a nickname, whichever you&apos;re comfortable with.
            </p>
            {usernameStatus === 'taken' && suggestion && (
              <p className="mt-1 text-xs text-red-600">
                Taken. Try <button type="button" onClick={() => { setUsername(suggestion); checkUsername(suggestion) }} className="font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer">{suggestion}</button> instead.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none min-h-[44px]"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none min-h-[44px]"
            />
          </div>

          <button
            type="submit"
            disabled={loading || usernameStatus === 'checking'}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 min-h-[44px] cursor-pointer"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-gray-400">or sign up with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={async () => {
            const supabase = createClient()
            await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: { redirectTo: `${window.location.origin}/auth/callback` },
            })
          }}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 active:bg-gray-100 min-h-[44px] cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign up with Google
        </button>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}