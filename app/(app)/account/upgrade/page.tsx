import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'
import MarketingPricing from '@/components/marketing-pricing'
import { createClient } from '@/lib/supabase/server'
import { getProStatus } from '@/lib/entitlements'

export const metadata = { title: 'Pro plans' }

export default async function UpgradePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const pro = user ? await getProStatus(user.id) : null

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/account"
          aria-label="Back to your account"
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-500 transition-colors hover:border-blue-300 hover:text-blue-600 min-h-[44px]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-semibold leading-tight text-black sm:text-3xl">
            Pro plans
          </h1>
          <p className="mt-0.5 text-sm font-semibold text-ink-soft">
            You start free, and Pro opens every lesson, unlimited practice, and every mock
          </p>
        </div>
      </div>

      {pro && (pro.hasJambPro || pro.hasPutmePro) ? (
        <div className="rounded-3xl border-2 border-emerald-100 bg-emerald-50/60 p-5 shadow-[0_2px_16px_-10px_rgba(6,95,70,0.35)] sm:p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            <h2 className="font-display text-lg font-semibold text-emerald-900">Your plan</h2>
          </div>
          <p className="mt-1.5 text-sm font-semibold text-emerald-900/80">
            {pro.hasJambPro && pro.hasPutmePro
              ? 'Both plans are active on your account'
              : pro.hasJambPro
                ? 'Your JAMB Pro is active, and PUTME Pro is a separate plan'
                : 'Your PUTME Pro is active, and JAMB Pro is a separate plan'}
          </p>
        </div>
      ) : null}

      <div className="mt-6 -mx-4 sm:-mx-6 lg:-mx-8">
        <MarketingPricing
          variant="dashboard"
          authEmail={user?.email ?? null}
          hasJambPro={pro?.hasJambPro ?? false}
          hasPutmePro={pro?.hasPutmePro ?? false}
        />
      </div>
    </div>
  )
}
