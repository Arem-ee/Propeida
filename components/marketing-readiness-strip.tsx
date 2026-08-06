import Link from 'next/link'
import { MessageCircle, ArrowRight } from 'lucide-react'
import { siteConfig } from '@/lib/site-config'

export default function MarketingReadinessStrip() {
  return (
    <section className="border-t border-gray-100 bg-blue-600">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-12 text-center sm:px-6 lg:flex-row lg:px-8 lg:text-left">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            JAMB is coming. Start practicing now — it&apos;s free.
          </h2>
          <p className="mt-2 text-blue-100">
            The questions are checked. The simulator is ready. Preparation should never wait for money.
          </p>
        </div>
        <Link
          href="/signup"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-bold text-blue-700 hover:bg-blue-50 min-h-[44px]"
        >
          Start Practicing Free
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </section>
  )
}

export function MarketingWhatsAppCta() {
  return (
    <section className="border-t border-gray-100 bg-gray-50/30">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:px-8">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl">
            {siteConfig.whatsapp.channelCopy}
          </h2>
          <p className="mt-1.5 text-sm text-gray-500">
            The official place to follow Propeida&apos;s progress, upcoming exam coverage, and important platform news.
          </p>
        </div>
        <a
          href={siteConfig.whatsapp.channelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-green-500 px-6 py-3.5 text-base font-bold text-white hover:bg-green-600 min-h-[44px]"
        >
          <MessageCircle className="h-5 w-5" />
          Join the WhatsApp Channel
        </a>
      </div>
    </section>
  )
}