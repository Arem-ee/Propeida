import Link from 'next/link'
import MarketingHeader from '@/components/marketing-header'
import MarketingFooter from '@/components/marketing-footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      <MarketingHeader />
      <main className="mx-auto max-w-3xl px-4 py-20 sm:py-24">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Terms of Service</h1>
        <p className="mt-4 text-sm text-gray-400">Last updated: July 2026</p>

        <div className="mt-10 space-y-8 text-sm text-gray-500 leading-relaxed">
          <section>
            <h2 className="text-base font-extrabold text-gray-900 mb-3">Account</h2>
            <p>
              You must provide a valid email address to create a Propeida account. You are responsible for maintaining the confidentiality of your password and for all activity that occurs under your account. Propeida is not liable for any loss or damage arising from unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-base font-extrabold text-gray-900 mb-3">Free Tier and Pro Upgrade</h2>
            <p>
              Propeida offers a free tier with limited access to practice questions and mock exams. The free tier limits are clearly stated on the pricing page and within the application. The Pro upgrade is a one-time payment of ₦1,500 (fifteen hundred Nigerian Naira) processed through Paystack. Pro access is tied to your account and is non-transferable.
            </p>
          </section>

          <section>
            <h2 className="text-base font-extrabold text-gray-900 mb-3">No Guarantee of Exam Outcomes</h2>
            <p>
              Propeida provides practice and preparation material. It does not guarantee any specific score, grade, percentile, ranking, or admission outcome on JAMB, WAEC, Post-UTME, or any other examination. Performance on the platform does not predict performance on actual exams. Results depend on the individual student, their preparation, and factors outside Propeida&apos;s control.
            </p>
            <p className="mt-3">
              THE PRACTICE MATERIAL IS PROVIDED &ldquo;AS IS&rdquo; WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. IN NO EVENT SHALL PROPEIDA BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY ARISING FROM THE USE OF THE PLATFORM, INCLUDING BUT NOT LIMITED TO EXAM OUTCOMES OR ADMISSION RESULTS.
            </p>
          </section>

          <section>
            <h2 className="text-base font-extrabold text-gray-900 mb-3">Question Bank Source</h2>
            <p>
              The Propeida question bank is compiled from the recollections of past candidates who previously sat the University of Ilorin Post-UTME screening exercise. These questions are not sourced from, provided by, or endorsed by the University of Ilorin, the Joint Admissions and Matriculation Board (JAMB), the West African Examinations Council (WAEC), or any other official examination body.
            </p>
            <p className="mt-3">
              Propeida has no affiliation, partnership, or official relationship with the University of Ilorin, JAMB, WAEC, or any of their respective departments or personnel. The questions are practice material only and do not represent actual examination content that may appear on any official test.
            </p>
          </section>

          <section>
            <h2 className="text-base font-extrabold text-gray-900 mb-3">Acceptable Use</h2>
            <p>
              You agree not to use Propeida for any unlawful purpose or in any way that could damage, disable, or impair the platform. This includes attempting to scrape the question bank, create multiple accounts to bypass free tier limits, or engage in any activity that could constitute exam fraud.
            </p>
          </section>

          <section>
            <h2 className="text-base font-extrabold text-gray-900 mb-3">Refund Policy</h2>
            <p className="text-xs font-bold text-amber-600 mb-3 uppercase tracking-wider">Draft — pending legal review</p>
            <p>
              PUTME Pro grants immediate access to the question bank and mock exam features on successful payment. Because access is instant, we don&apos;t offer refunds for change of mind once access has been granted.
            </p>
            <p className="mt-3">
              You are entitled to a refund if: you were charged more than once for the same purchase, a genuine technical failure on our end prevented you from ever accessing what you paid for, or the service materially didn&apos;t match what was described at the time of purchase. Contact propeida.help@gmail.com if any of these apply.
            </p>
          </section>

          <section>
            <h2 className="text-base font-extrabold text-gray-900 mb-3">Changes to These Terms</h2>
            <p>
              Propeida reserves the right to update these terms at any time. Registered users will be notified of material changes via the email address on their account. Continued use of the platform after a change constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-extrabold text-gray-900 mb-3">Contact</h2>
            <p>
              Questions about these terms can be submitted through the <Link href="/contact" className="font-bold text-blue-600 hover:text-blue-700">contact form</Link> on this site.
            </p>
          </section>
        </div>
      </main>
      <MarketingFooter />
    </div>
  )
}
