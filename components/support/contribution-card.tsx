'use client'

import { useState } from 'react'
import { Heart, Lock } from 'lucide-react'

export const SUPPORT_AMOUNTS = [1000, 2000, 5000, 10000, 20000]

function formatAmount(n: number): string {
  return `₦${n.toLocaleString('en-NG')}`
}

export default function ContributionCard() {
  const [amount, setAmount] = useState<number | null>(2000)
  const [custom, setCustom] = useState('')

  const selectedValue = custom ? Number(custom) : amount

  // Future Paystack integration: the checkout flow will attach here.
  // Keep the payload shape stable so payments can be wired in without redesign.
  const handleSupport = () => {
    if (!selectedValue || selectedValue < 100) return
    void selectedValue
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
            className={`rounded-xl border px-4 py-3 text-sm font-bold min-h-[44px] transition-colors cursor-pointer ${
              amount === value && !custom
                ? 'border-blue-600 bg-blue-50/10 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            {formatAmount(value)}
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
            min={100}
            placeholder="Custom"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className="w-full min-w-0 bg-transparent px-1.5 py-3 text-sm font-bold text-gray-700 placeholder:text-gray-400 focus:outline-none min-h-[44px]"
          />
        </div>
      </div>

      <button
        onClick={handleSupport}
        disabled
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white opacity-60 cursor-not-allowed min-h-[44px]"
      >
        <Heart className="h-4 w-4" />
        Support Propeida
      </button>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400">
        <Lock className="h-3 w-3" />
        Secure payments are coming soon. You can still support us by spreading the word.
      </p>
    </div>
  )
}
