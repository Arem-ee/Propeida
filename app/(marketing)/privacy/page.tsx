import type { Metadata } from 'next'
import MarketingHeader from '@/components/marketing-header'
import MarketingFooter from '@/components/marketing-footer'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      <MarketingHeader />
      <main className="mx-auto max-w-3xl px-4 py-20 sm:py-24">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Privacy Policy</h1>
        <p className="mt-4 text-sm text-gray-400">Last updated: July 2026</p>

        <div className="mt-10 space-y-8 text-sm text-gray-500 leading-relaxed">
          <section>
            <h2 className="text-base font-extrabold text-gray-900 mb-3">What data Propeida collects</h2>
            <p>
              When you create an account, Propeida stores your email address and a randomly generated username. No real name, phone number, or address is required to use the platform.
            </p>
            <p className="mt-3">
              While using the platform, Propeida records your answers to practice questions and mock exams, your session timings, your score and accuracy data, and your daily question responses. This data is used solely to calculate your performance statistics, update your streak, and determine your leaderboard ranking.
            </p>
          </section>

          <section>
            <h2 className="text-base font-extrabold text-gray-900 mb-3">How data is stored</h2>
            <p>
              All user data is stored in a Supabase PostgreSQL database hosted on Google Cloud Platform infrastructure. Passwords are handled entirely by Supabase Auth and are never stored or readable by Propeida. Communication with the database is encrypted in transit.
            </p>
          </section>

          <section>
            <h2 className="text-base font-extrabold text-gray-900 mb-3">Payment data</h2>
            <p>
              Payments are processed entirely by Paystack, a PCI-DSS compliant payment processor. Propeida does not collect, store, or transmit credit or debit card numbers. When you make a payment, Propeida stores only the transaction reference, the amount paid, and the payment status returned by Paystack. All card details are handled by Paystack on their secure infrastructure.
            </p>
          </section>

          <section>
            <h2 className="text-base font-extrabold text-gray-900 mb-3">Data sharing</h2>
            <p>
              Propeida does not sell, rent, or share your personal data with third parties. Your practice data and performance statistics are visible to you on your dashboard. Your username, score, and school affiliation are visible on the public leaderboard. No email addresses or other contact information are shown on the leaderboard or anywhere else publicly.
            </p>
          </section>

          <section>
            <h2 className="text-base font-extrabold text-gray-900 mb-3">Data retention and deletion</h2>
            <p>
              Your data is retained for as long as your account remains active. If you wish to delete your account and all associated data, contact the team using the contact form on this site. Account deletion removes your profile, session history, results, streak, and leaderboard entries. Payment records are retained for financial record-keeping purposes.
            </p>
          </section>

          <section>
            <h2 className="text-base font-extrabold text-gray-900 mb-3">Cookies and local storage</h2>
            <p>
              Propeida uses Supabase Auth cookies to maintain your login session. No tracking cookies, analytics cookies, or third-party cookies are used. The platform uses local storage only to store a referral code reference if you sign up through a referral link.
            </p>
          </section>

          <section>
            <h2 className="text-base font-extrabold text-gray-900 mb-3">Changes to this policy</h2>
            <p>
              If this policy changes, registered users will be notified via the email address on their account. Continued use of the platform after a change constitutes acceptance of the updated policy.
            </p>
          </section>
        </div>
      </main>
      <MarketingFooter />
    </div>
  )
}
