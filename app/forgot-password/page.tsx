'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { MailCheck } from 'lucide-react'
import AuthShell from '@/components/auth/auth-shell'
import { createClient } from '@/lib/supabase/client'
import { friendlyAuthError } from '@/lib/auth-errors'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabaseRef = useRef(createClient())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // The reset link lands on /auth/finish, which turns the token into a
    // session before sending the user to the new-password page.
    const { error: authError } = await supabaseRef.current.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/finish?next=${encodeURIComponent('/auth/update-password')}`,
    })

    setLoading(false)

    if (authError) {
      setError(friendlyAuthError(authError.message, 'login'))
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <AuthShell mode="recover">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <MailCheck className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight text-ink">Check your email</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            We sent a reset link to <strong>{email}</strong>, so click it to choose a new password
          </p>
          <p className="mt-4 text-xs text-gray-500">The link works once and expires soon</p>
          <Link
            href="/login"
            className="pressable mt-6 inline-block min-h-[44px] w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-[0_8px_20px_-10px_rgba(37,99,235,0.8)] hover:bg-blue-700"
          >
            Back to sign in
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell mode="recover">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Reset your password</h1>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
        Enter the email you use on Propeida, and we will send you a link to choose a new password
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="min-h-[44px] w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="pressable min-h-[44px] w-full cursor-pointer rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-[0_8px_20px_-10px_rgba(37,99,235,0.8)] hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400"
        >
          {loading ? 'We are sending your link' : 'Send reset link'}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-ink-soft">
        You can go back without changing your password
        <Link href="/login" className="mt-1 block font-bold text-blue-600 hover:text-blue-700">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  )
}
