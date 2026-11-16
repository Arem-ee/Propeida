'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Loader2, Clock, ShieldCheck } from 'lucide-react'
import Logo from '@/components/logo'

interface BillingOption {
  key: string
  cycle: 'weekly' | 'monthly' | 'yearly'
  price: string
  amountLabel: string
}

interface PlanCard {
  key: string
  name: string
  description: string
  features: { text: string; included: boolean }[]
  options: BillingOption[] | null
  purchasable: boolean
  comingSoon: boolean
  badge: string | null
}

const PLANS: PlanCard[] = [
  {
    key: 'free',
    name: 'Free Practice',
    description: 'You get limited practice questions and one mock exam for each exam you engage with',
    features: [
      { text: 'You get one full practice per exam, with 180 questions for JAMB', included: true },
      { text: 'You get one mock exam simulation per exam', included: true },
      { text: 'You get the first lesson of each subject free', included: true },
      { text: 'You see step-by-step explanations for all questions', included: true },
      { text: 'You get performance analytics and tracking', included: false },
      { text: 'You get school-specific Post-UTME banks', included: false },
    ],
    options: null,
    purchasable: false,
    comingSoon: false,
    badge: null,
  },
  {
    key: 'jamb_pro',
    name: 'JAMB Pro Pass',
    description: 'You get full access to JAMB past questions, mocks, and analytics',
    features: [
      { text: 'You can answer unlimited JAMB practice questions', included: true },
      { text: 'You can take unlimited JAMB CBT mock simulations', included: true },
      { text: 'You see performance analytics and speed feedback', included: true },
      { text: 'You unlock all lessons, reviews, and progress maps', included: true },
      { text: 'You get school-specific Post-UTME banks', included: false },
      { text: 'You get AI-powered explanations (coming soon)', included: false },
    ],
    options: [
      { key: 'jamb_pro_weekly', cycle: 'weekly', price: '₦1,000', amountLabel: '₦1,000' },
      { key: 'jamb_pro', cycle: 'monthly', price: '₦4,000', amountLabel: '₦4,000' },
      { key: 'jamb_pro_yearly', cycle: 'yearly', price: '₦33,600', amountLabel: '₦33,600' },
    ],
    purchasable: true,
    comingSoon: false,
    badge: null,
  },
  {
    key: 'putme_pro',
    name: 'PUTME Pro Pass',
    description: 'You unlock the question bank and mock simulations for any university you add',
    features: [
      { text: 'You can answer unlimited questions for any university', included: true },
      { text: 'You can take unlimited school-specific mock simulations', included: true },
      { text: 'You see performance analytics and speed feedback', included: true },
      { text: 'You unlock all university Post-UTME banks', included: true },
      { text: 'You get JAMB practice questions', included: false },
    ],
    options: [
      { key: 'putme_pro_weekly', cycle: 'weekly', price: '₦400', amountLabel: '₦400' },
      { key: 'putme_pro', cycle: 'monthly', price: '₦1,000', amountLabel: '₦1,000' },
      { key: 'putme_pro_yearly', cycle: 'yearly', price: '₦8,400', amountLabel: '₦8,400' },
    ],
    purchasable: true,
    comingSoon: false,
    badge: null,
  },
  {
    key: 'jamb_premium_ai',
    name: 'JAMB Premium AI',
    description: 'You get everything in JAMB Pro plus AI-powered step-by-step explanations',
    features: [
      { text: 'You can answer unlimited JAMB practice questions', included: true },
      { text: 'You can take unlimited JAMB CBT mock simulations', included: true },
      { text: 'You get AI-powered step-by-step explanations', included: true },
      { text: 'You see performance analytics and speed feedback', included: true },
      { text: 'You get school-specific Post-UTME banks', included: false },
    ],
    options: null,
    purchasable: false,
    comingSoon: true,
    badge: 'Coming Soon',
  },
]

export default function MarketingPricing({
  variant = 'marketing',
  authEmail = null,
  hasJambPro = false,
  hasPutmePro = false,
}: {
  variant?: 'marketing' | 'dashboard'
  authEmail?: string | null
  hasJambPro?: boolean
  hasPutmePro?: boolean
}) {
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkoutProduct, setCheckoutProduct] = useState<string>('jamb_pro')
  const [checkoutAmount, setCheckoutAmount] = useState<string>('₦4,000')
  const [cycles, setCycles] = useState<Record<string, 'weekly' | 'monthly' | 'yearly'>>({})
  const [isPaying, setIsPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const plans = variant === 'dashboard' ? PLANS.filter((p) => !p.comingSoon) : PLANS
  const isOwned = (planKey: string) =>
    (planKey === 'jamb_pro' && hasJambPro) || (planKey === 'putme_pro' && hasPutmePro)

  const handleBuyClick = (productKey: string, amountLabel: string) => {
    if (productKey === 'free') {
      router.push(authEmail ? '/home' : '/signup')
      return
    }
    if (!authEmail) {
      router.push('/signup?redirect=/#pricing')
      return
    }
    setCheckoutProduct(productKey)
    setCheckoutAmount(amountLabel)
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
      setError(err instanceof Error ? err.message : 'Your payment did not go through')
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
            You start free, and Pro opens every lesson, unlimited practice, and every mock
          </p>
          {authEmail && (hasJambPro || hasPutmePro) && (
            <p className="mt-3 text-sm font-semibold text-blue-700">
              {hasJambPro && hasPutmePro
                ? 'Both plans are active on your account'
                : hasJambPro
                  ? 'Your JAMB Pro is active, and PUTME Pro is a separate plan'
                  : 'Your PUTME Pro is active, and JAMB Pro is a separate plan'}
            </p>
          )}
        </div>

        <div className={`mx-auto grid max-w-lg grid-cols-1 gap-8 ${variant === 'dashboard' ? 'lg:max-w-3xl lg:grid-cols-2' : 'lg:max-w-5xl lg:grid-cols-2'}`}>
          {plans.map((plan, idx) => {
            const isPopular = idx === 1
            const cycle = cycles[plan.key] ?? 'monthly'
            const option = plan.options?.find((o) => o.cycle === cycle) ?? plan.options?.[0] ?? null
            const owned = isOwned(plan.key)

            return (
              <div
                key={plan.key}
                className={`relative flex flex-col justify-between rounded-xl border bg-white p-8 shadow-2xs ${
                  isPopular ? 'border-2 border-blue-600 shadow-sm' : 'border-gray-100'
                }`}
              >
                {plan.badge && (
                  <div className="absolute top-0 right-6 -translate-y-1/2 rounded-full bg-gray-400 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    {owned && (
                      <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        Your plan
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="mt-6">
                    {plan.comingSoon ? (
                      <span className="text-base font-bold text-gray-500 uppercase tracking-wider">Coming Soon</span>
                    ) : plan.key === 'free' ? (
                      <span className="text-4xl font-extrabold tracking-tight text-gray-900">Free</span>
                    ) : (
                      <>
                        {plan.options && (
                          <div className="mb-4 flex w-fit rounded-full bg-gray-100 p-1">
                            {plan.options.map((o) => (
                              <button
                                key={o.key}
                                type="button"
                                onClick={() => setCycles((c) => ({ ...c, [plan.key]: o.cycle }))}
                                aria-pressed={option?.key === o.key}
                                className={`rounded-full px-4 py-2 text-xs font-extrabold min-h-[40px] cursor-pointer transition-all ${
                                  option?.key === o.key
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                              >
                                {o.cycle === 'weekly' ? 'Weekly' : o.cycle === 'monthly' ? 'Monthly' : 'Yearly'}
                              </button>
                            ))}
                          </div>
                        )}
                        <div className="flex items-baseline flex-wrap gap-2">
                          <span className="text-4xl font-extrabold tracking-tight text-gray-900">{option?.price}</span>
                          <span className="rounded-xl bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">
                            {option?.cycle === 'yearly' ? 'per year · save 30%' : option?.cycle === 'weekly' ? 'per week' : 'per month'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <ul className="mt-8 space-y-4">
                    {plan.features.map((feature, fi) => (
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
                  {plan.purchasable ? (
                    <button
                      onClick={() => handleBuyClick(option!.key, option!.amountLabel)}
                      className="block w-full rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-blue-700 active:bg-blue-800 min-h-[44px] cursor-pointer"
                    >
                      {owned ? 'Renew or switch' : plan.name.includes('PUTME') ? 'Get PUTME Pro' : 'Get JAMB Pro'}
                    </button>
                  ) : (
                    <button
                      onClick={() => plan.key === 'free' ? handleBuyClick('free', 'Free') : undefined}
                      className={`block w-full rounded-xl px-4 py-3 text-center text-sm font-bold min-h-[44px] ${
                        plan.key === 'free'
                          ? 'border border-gray-200 bg-white text-gray-700 transition-colors hover:bg-gray-50 active:bg-gray-100 cursor-pointer'
                          : 'border border-gray-200 bg-gray-50 text-gray-500 cursor-default'
                      }`}
                    >
                      {plan.key === 'free' ? 'Get Started Free' : 'Coming Soon'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mx-auto mt-8 max-w-lg rounded-xl border border-gray-100 bg-white p-6 text-center lg:max-w-5xl">
          <p className="text-sm text-gray-500">
            You start free without a card, and you pay weekly, monthly, or yearly for Pro, then pay again when you want to renew
          </p>
        </div>
      </div>

      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="relative w-full max-w-md rounded-xl bg-white border border-gray-100 p-6 shadow-xl">
            <button
              onClick={() => { setShowCheckout(false); setError(null) }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-6">
              <Logo size={32} showText={false} />
              <div>
                <h4 className="text-sm font-bold text-gray-900">Pay Propeida</h4>
                <p className="text-xs text-gray-500">Secured by Paystack</p>
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
                  value={authEmail ?? ''}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm bg-gray-50 text-gray-500 min-h-[44px]"
                />
              </div>

              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 mb-6 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
                <p className="text-xs text-gray-500 leading-normal">
                  Paystack opens its secure checkout next so you can finish your payment
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
                    Opening Paystack
                  </span>
                ) : (
                  `Pay ${checkoutAmount}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
