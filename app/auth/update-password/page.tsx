'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import AuthShell from '@/components/auth/auth-shell'
import { createClient } from '@/lib/supabase/client'
import { friendlyAuthError } from '@/lib/auth-errors'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const supabaseRef = useRef(createClient())
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // A reset link establishes a recovery session through /auth/finish.
    // Without one there is nothing to update, so send the user back to
    // request a fresh link instead of showing an empty form.
    supabaseRef.current.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace('/forgot-password')
        return
      }
      setReady(true)
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Those passwords do not match, so check them and try again')
      return
    }

    setLoading(true)
    const { error: authError } = await supabaseRef.current.auth.updateUser({ password })
    setLoading(false)

    if (authError) {
      setError(friendlyAuthError(authError.message, 'login'))
      return
    }

    router.replace('/home')
  }

  if (!ready) {
    return (
      <AuthShell mode="recover">
        <div className="text-center">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-blue-600" aria-hidden="true" />
          <h1 className="mt-4 font-display text-xl font-semibold text-ink">Checking your link…</h1>
          <p className="mt-2 text-sm text-ink-soft" role="status">One moment while we get your account ready</p>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell mode="recover">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Choose a new password</h1>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
        Use at least 6 characters, then you can go straight back to your lessons
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{error}</div>
        )}

        <div>
          <label htmlFor="password" className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
            New password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Use at least 6 characters"
            className="min-h-[44px] w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div>
          <label htmlFor="confirm" className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
            Confirm new password
          </label>
          <input
            id="confirm"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Type your new password again"
            className="min-h-[44px] w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="pressable min-h-[44px] w-full cursor-pointer rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-[0_8px_20px_-10px_rgba(37,99,235,0.8)] hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400"
        >
          {loading ? 'We are updating your password' : 'Update password'}
        </button>
      </form>
    </AuthShell>
  )
}
