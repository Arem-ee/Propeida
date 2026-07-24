import Link from 'next/link'
import MarketingHeader from '@/components/marketing-header'
import MarketingFooter from '@/components/marketing-footer'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      <MarketingHeader />
      <main className="mx-auto max-w-3xl px-4 py-20 sm:py-24">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">About Propeida</h1>

        <div className="mt-8 space-y-6 text-base text-gray-500 leading-relaxed">
          <p>
            Propeida is a Computer-Based Test (CBT) mock exam simulator built for Nigerian students preparing for JAMB, Post-UTME, and WAEC. It replaces paper booklets and PDFs with a timed digital exam environment that works on the phones and networks students actually use.
          </p>
          <p>
            Most exam prep platforms copy the same approach: collect a subscription fee every month, load a question bank behind a login screen, and call it a product. Propeida does two things differently. First, the Pro upgrade is a single payment of ₦1,500, not a recurring subscription. Second, the platform is built specifically for the browser mix and network quality that matters in Nigeria, not Silicon Valley: it runs on Chrome, Samsung Internet, Opera, and Safari, and loads quickly on 3G connections with minimal data usage.
          </p>
          <p>
            The question bank draws from the recollections of past candidates who have taken the University of Ilorin Post-UTME. These are not official questions and Propeida has no affiliation with the University of Ilorin, JAMB, or any examination body. The platform provides practice and preparation material. It does not guarantee any specific exam score or admission outcome.
          </p>
          <p>
            Propeida was started to give students a realistic practice environment without the expensive monthly fees that make most prep tools inaccessible to the students who need them most.
          </p>
        </div>

        <div className="mt-10 rounded-xl border border-gray-100 bg-gray-50/30 p-6">
          <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">Still have questions?</h2>
          <p className="mt-2 text-sm text-gray-500">
            Visit the <Link href="/faq" className="font-bold text-blue-600 hover:text-blue-700">FAQ page</Link> for common answers, or use the <Link href="/contact" className="font-bold text-blue-600 hover:text-blue-700">contact form</Link> to reach the team.
          </p>
        </div>
      </main>
      <MarketingFooter />
    </div>
  )
}
