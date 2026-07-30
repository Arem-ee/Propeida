'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Loader2, Clock, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/logo'

const PRODUCTS = [
  {
    key: 'free',
    name: 'Free Practice',
    description: 'Limited practice questions and one mock exam per exam you engage with.',
    displayPrice: 'Free',
    pricePill: null,
    badge: null,
    features: [
      { text: '30 practice questions per exam', included: true },
      { text: '1 mock exam simulation per exam', included: true },
      { text: 'Step-by-step explanations for all questions', included: true },
      { text: 'Performance analytics and tracking', included: false },
      { text: 'School-specific Post-UTME banks', included: false },
    ],
    purchasable: false,
    comingSoon: false,
    cta: 'Get Started Free',
  },
  {
    key: 'putme_pro',
    name: 'PUTME Pro Pass',
    description: 'Unlock the question bank and mock simulations for any university you have added.',
    displayPrice: '₦1,500',
    pricePill: 'One-time payment',
    badge: null,
    features: [
      { text: 'Unlimited questions for any university', included: true },
      { text: 'Unlimited school-specific mock simulations', included: true },
      { text: 'Performance analytics and speed feedback', included: true },
      { text: 'All university Post-UTME banks', included: true },
      { text: 'JAMB practice questions', included: false },
    ],
    purchasable: true,
    comingSoon: false,
    cta: 'Get PUTME Pro',
  },
  {
    key: 'jamb_pro',
    name: 'JAMB Pro Pass',
    description: 'Full access to JAMB past questions, mocks, and analytics.',
    displayPrice: null,
    pricePill: null,
    badge: 'Coming Soon',
    features: [
      { text: 'Unlimited JAMB practice questions', included: true },
      { text: 'Unlimited JAMB CBT mock simulations', included: true },
      { text: 'Performance analytics and speed feedback', included: true },
      { text: 'School-specific Post-UTME banks', included: false },
      { text: 'AI-powered explanations', included: false },
    ],
    purchasable: false,
    comingSoon: true,
    cta: 'Coming Soon',
  },
  {
    key: 'jamb_premium_ai',
    name: 'JAMB Premium AI',
    description: 'Everything in JAMB Pro, plus AI-powered step-by-step explanations.',
    displayPrice: null,
    pricePill: null,
    badge: 'Coming Soon',
    features: [
      { text: 'Unlimited JAMB practice questions', included: true },
      { text: 'Unlimited JAMB CBT mock simulations', included: true },
      { text: 'AI-powered step-by-step explanations', included: true },
      { text: 'Performance analytics and speed feedback', included: true },
      { text: 'School-specific Post-UTME banks', included: false },
    ],
    purchasable: false,
    comingSoon: true,
    cta: 'Coming Soon',
  },
]

export default function MarketingPricing() {
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkoutProduct, setCheckoutProduct] = useState<string>('putme_pro')
  const [isPaying, setIsPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<{ email: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (u?.email) setUser({ email: u.email })
    })
  }, [])

  const handleBuyClick = (productKey: string) => {
    if (productKey === 'free') {
      router.push('/signup')
      return
    }
    if (!user) {
      router.push('/signup?redirect=/#pricing')
      return
    }
    setCheckoutProduct(productKey)
    setShowCheckout(true)
  }

  const handlePayment = async () => {
    setIsPaying(true)
    setError(null)

    try {
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: checkoutProduct }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to initialize payment')
      }

      window.location.href = data.authorizationUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
      setIsPaying(false)
    }
  }

  return (
    <section id="pricing" className="border-t border-gray-100 bg-gray-50/30 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Plain, direct pricing
          </h2>
          <p className="mt-4 text-lg text-gray-500 leading-relaxed">
            Free to start, with simple, affordable one-time upgrades when you are ready for more. No recurring subscriptions.
          </p>
        </div>

        <div className="mx-auto grid max-w-lg grid-cols-1 gap-8 lg:max-w-5xl lg:grid-cols-4">
          {PRODUCTS.map((product, idx) => {
            const isPopular = idx === 1

            return (
              <div
                key={product.key}
                className={`relative flex flex-col justify-between rounded-xl border bg-white p-8 shadow-2xs ${
                  isPopular ? 'border-2 border-blue-600 shadow-sm' : 'border-gray-100'
                }`}
              >
                {product.badge && (
                  <div className="absolute top-0 right-6 -translate-y-1/2 rounded-full bg-gray-400 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {product.badge}
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                    {product.description}
                  </p>

                  <div className="mt-6 flex items-baseline flex-wrap gap-2">
                    {product.comingSoon ? (
                      <span className="text-base font-bold text-gray-400 uppercase tracking-wider">Coming Soon</span>
                    ) : (
                      <>
                        <span className="text-4xl font-extrabold tracking-tight text-gray-900">{product.displayPrice}</span>
                        {product.pricePill && (
                          <span className="rounded-xl bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">
                            {product.pricePill}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  <ul className="mt-8 space-y-4">
                    {product.features.map((feature, fi) => (
                      <li key={fi} className={`flex items-start gap-3 ${feature.included ? '' : 'text-gray-300'}`}>
                        {feature.included ? (
                          <Check className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm font-medium ${feature.included ? 'text-gray-600' : ''}`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  {product.purchasable ? (
                    <button
                      onClick={() => handleBuyClick(product.key)}
                      className="block w-full rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-blue-700 active:bg-blue-800 min-h-[44px] cursor-pointer"
                    >
                      {product.cta}
                    </button>
                  ) : (
                    <button
                      onClick={() => product.key === 'free' ? handleBuyClick('free') : undefined}
                      className={`block w-full rounded-xl px-4 py-3 text-center text-sm font-bold min-h-[44px] ${
                        product.key === 'free'
                          ? 'border border-gray-200 bg-white text-gray-700 transition-colors hover:bg-gray-50 active:bg-gray-100 cursor-pointer'
                          : 'border border-gray-200 bg-gray-50 text-gray-400 cursor-default'
                      }`}
                    >
                      {product.cta}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mx-auto mt-8 max-w-lg rounded-xl border border-gray-100 bg-white p-6 text-center lg:max-w-5xl">
          <p className="text-sm text-gray-500">
            Start with the Free Practice Tier — no credit card required.
          </p>
        </div>
      </div>

      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="relative w-full max-w-md rounded-xl bg-white border border-gray-100 p-6 shadow-xl">
            <button
              onClick={() => { setShowCheckout(false); setError(null) }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-6">
              <Logo size={32} showText={false} />
              <div>
                <h4 className="text-sm font-bold text-gray-900">Pay Propeida</h4>
                <p className="text-xs text-gray-400">Secured by Paystack</p>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  readOnly
                  value={user?.email ?? ''}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm bg-gray-50 text-gray-500 min-h-[44px]"
                />
              </div>

              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 mb-6 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
                <p className="text-xs text-gray-500 leading-normal">
                  You will be redirected to Paystack&apos;s secure checkout page to complete your payment.
                </p>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 mb-4 text-xs font-semibold text-red-700">
                  {error}
                </div>
              )}

              <button
                type="button"
                disabled={isPaying}
                onClick={handlePayment}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white hover:bg-blue-700 active:bg-blue-800 min-h-[44px] cursor-pointer disabled:bg-blue-400"
              >
                {isPaying ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Redirecting to Paystack...
                  </span>
                ) : (
                  'Pay ₦1,500'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
