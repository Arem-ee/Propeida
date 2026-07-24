'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Check, X, Loader2, RefreshCw, ArrowRight } from 'lucide-react'

const POLL_INTERVAL = 3000
const MAX_POLL_MS = 60000

function CallbackContent() {
  const searchParams = useSearchParams()
  const reference = searchParams.get('reference')
  const [status, setStatus] = useState<'verifying' | 'success' | 'processing' | 'failed'>('verifying')
  const [error, setError] = useState<string | null>(null)

  const poll = useCallback(async () => {
    if (!reference) {
      setStatus('failed')
      setError('No payment reference found')
      return
    }

    setStatus('verifying')
    setError(null)

    const startTime = Date.now()
    let stopped = false

    const tick = async () => {
      if (stopped) return

      try {
        const res = await fetch(`/api/paystack/verify?reference=${reference}`)
        const data = await res.json()

        if (data.status === 'success') {
          setStatus('success')
          return
        }

        if (data.status === 'failed') {
          setStatus('failed')
          setError(data.error ?? 'Transaction could not be completed')
          return
        }
      } catch {}

      if (Date.now() - startTime >= MAX_POLL_MS) {
        setStatus('processing')
        setError(null)
        return
      }

      setTimeout(tick, POLL_INTERVAL)
    }

    tick()

    return () => { stopped = true }
  }, [reference])

  useEffect(() => {
    const cleanup = poll()
    return () => { cleanup.then((fn) => fn?.()) }
  }, [poll])

  return (
    <div className="w-full max-w-sm rounded-xl border border-gray-100 bg-white p-6 text-center shadow-xs">
      {status === 'verifying' && (
        <div>
          <Loader2 className="mx-auto h-10 w-10 text-blue-600 animate-spin mb-4" />
          <h1 className="text-lg font-extrabold text-gray-900">Verifying payment...</h1>
          <p className="mt-2 text-sm text-gray-500">
            Confirming your transaction with Paystack. This should only take a moment.
          </p>
        </div>
      )}

      {status === 'success' && (
        <div>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 border border-green-100 mb-4">
            <Check className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-extrabold text-gray-900">Payment successful!</h1>
          <p className="mt-2 text-sm text-gray-500">
            Your Pro account is now active. You have unlimited access to all features.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 min-h-[44px]"
          >
            Go to dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {status === 'processing' && (
        <div>
          <Loader2 className="mx-auto h-10 w-10 text-amber-500 mb-4" />
          <h1 className="text-lg font-extrabold text-gray-900">Still confirming your payment</h1>
          <p className="mt-2 text-sm text-gray-500 leading-relaxed">
            The confirmation from Paystack is taking longer than usual. Your payment was received, and your Pro access
            will be activated automatically once the confirmation arrives. You do not need to pay again.
          </p>
          <p className="mt-3 text-xs text-gray-400 leading-relaxed">
            If you go to the dashboard now, your account will update to Pro once the confirmation is complete.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={poll}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 min-h-[44px] cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              Check again
            </button>
            <Link
              href="/dashboard"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 min-h-[44px]"
            >
              Go to dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {status === 'failed' && (
        <div>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-100 mb-4">
            <X className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-extrabold text-gray-900">Payment was not completed</h1>
          <p className="mt-2 text-sm text-gray-500">
            {error ?? 'Your payment could not be completed. No charge has been made.'}
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/#pricing"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 min-h-[44px]"
            >
              Try again
            </Link>
            <button
              onClick={poll}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 min-h-[44px] cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              Check again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PaymentCallbackPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-gray-50">
      <Link href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-gray-900 mb-8 min-h-[44px]">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-base">P</span>
        Propeida
      </Link>

      <Suspense fallback={
        <div className="w-full max-w-sm rounded-xl border border-gray-100 bg-white p-6 text-center shadow-xs">
          <Loader2 className="mx-auto h-10 w-10 text-blue-600 animate-spin mb-4" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      }>
        <CallbackContent />
      </Suspense>
    </div>
  )
}
