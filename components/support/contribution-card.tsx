'use client'

import { useEffect, useState } from 'react'
import { Heart, Lock, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { track } from '@/lib/analytics'

export const SUPPORT_AMOUNTS = [1500, 3000, 5000, 10000, 20000]
export const RECOMMENDED_AMOUNT = 1500

const MIN_CUSTOM = 100
const MAX_CUSTOM = 1000000

function formatAmount(n: number): string {
  return `₦${n.toLocaleString('en-NG')}`
}

export default function ContributionCard() {
  const [amount, setAmount] = useState<number | null>(RECOMMENDED_AMOUNT)
  const [custom, setCustom] = useState('')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const selectedValue = custom ? Number(custom) : amount

  useEffect(() => {
    void track('support-page-view')
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email ?? '')
    }).catch(() => {})
  }, [])

  const handleSupport = async () => {
    if (loading) return
    setSubmitError(null)
    setEmailError(null)

    if (!selectedValue || selectedValue < MIN_CUSTOM || selectedValue > MAX_CUSTOM) {
      setSubmitError(`Please enter an amount between ${formatAmount(MIN_CUSTOM)} and ${formatAmount(MAX_CUSTOM)}.`)
      return
    }

    const normalizedEmail = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setEmailError('Please enter a valid email so we can confirm your contribution.')
      return
    }

    setLoading(true)
    void track('support-payment-start', { amount: selectedValue })

    try {
      const res = await fetch('/api/paystack/support/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: selectedValue * 100, email: normalizedEmail }),
      })
      const data = await res.json()

      if (!res.ok || !data.authorizationUrl) {
        setSubmitError(data.error ?? 'Could not start the payment. Please try again.')
        return
      }

      window.location.href = data.authorizationUrl
    } catch {
      setSubmitError('Could not reach the payment service. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm">
      <h2 className="text-lg font-extrabold text-gray-900">Choose an amount</h2>
      <p className="mt-1 text-sm text-gray-500">
        Every contribution goes toward content, infrastructure, and keeping the platform running.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {SUPPORT_AMOUNTS.map((value) => (
          <button
            key={value}
            onClick={() => {
              setAmount(value)
              setCustom('')
            }}
            className={`relative rounded-xl border px-4 py-3 text-sm font-bold min-h-[44px] transition-colors cursor-pointer ${
              amount === value && !custom
                ? 'border-blue-600 bg-blue-50/10 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            {formatAmount(value)}
            {value === RECOMMENDED_AMOUNT && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white whitespace-nowrap">
                Recommended
              </span>
            )}
          </button>
        ))}
        <div
          className={`flex items-center rounded-xl border px-3 transition-colors ${
            custom ? 'border-blue-600 bg-blue-50/10' : 'border-gray-200'
          }`}
        >
          <span className="text-sm font-bold text-gray-500">₦</span>
          <input
            type="number"
            min={MIN_CUSTOM}
            max={MAX_CUSTOM}
            placeholder="Custom"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className="w-full min-w-0 bg-transparent px-1.5 py-3 text-sm font-bold text-gray-700 placeholder:text-gray-400 focus:outline-none min-h-[44px]"
          />
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="support-email" className="block text-sm font-bold text-gray-700 mb-1.5">
          Email
        </label>
        <input
          id="support-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setEmailError(null)
          }}
          placeholder="you@example.com"
          className={`w-full rounded-xl border bg-white px-4 py-3 text-sm font-bold text-gray-700 placeholder:text-gray-400 focus:outline-none min-h-[44px] ${
            emailError ? 'border-red-300' : 'border-gray-200 focus:border-blue-600'
          }`}
        />
        {emailError && <p className="mt-1.5 text-xs font-semibold text-red-600">{emailError}</p>}
      </div>

      {submitError && (
        <p className="mt-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-semibold text-red-600">
          {submitError}
        </p>
      )}

      <button
        onClick={handleSupport}
        disabled={loading}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px] cursor-pointer"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4" />}
        {loading ? 'Starting payment...' : 'Support Propeida'}
      </button>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400">
        <Lock className="h-3 w-3" />
        Secure payments processed by Paystack.
      </p>
    </div>
  )
}