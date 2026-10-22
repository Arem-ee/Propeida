import Link from 'next/link'
import { MessageCircle, Mail } from 'lucide-react'
import Logo from '@/components/logo'
import { siteConfig } from '@/lib/site-config'

const linkClass = 'text-sm text-gray-500 hover:text-blue-600 min-h-[44px] py-1 block'
const colTitleClass = 'text-xs font-bold text-gray-500 uppercase tracking-wider mb-4'

function SoonBadge() {
  return (
    <span className="ml-1.5 inline-block rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 align-baseline text-[10px] font-bold uppercase tracking-wide text-blue-600">
      Soon
    </span>
  )
}

export default function MarketingFooter() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Logo />
            <p className="mt-4 text-sm text-gray-500 leading-relaxed">
              Real CBT practice for every ambitious student. Learn the topic, practise the question, walk in ready.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 min-h-[44px]"
              >
                <Mail className="h-4 w-4" />
                {siteConfig.contact.email}
              </a>
              <a
                href={siteConfig.whatsapp.channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-xs font-bold text-green-700 min-h-[44px]"
              >
                <MessageCircle className="h-4 w-4 shrink-0" />
                WhatsApp channel
              </a>
            </div>
          </div>

          <div>
            <h4 className={colTitleClass}>Product</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/learn" className={linkClass}>Learn</Link>
              </li>
              <li>
                <Link href="/practice" className={linkClass}>Practice</Link>
              </li>
              <li>
                <Link href="/mocks" className={linkClass}>Mock exams</Link>
              </li>
              <li>
                <Link href="/progress" className={linkClass}>Your progress</Link>
              </li>
              <li>
                <Link href="/login" className={linkClass}>Sign in</Link>
              </li>
              <li>
                <Link href="/signup" className={linkClass}>Create an account</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className={colTitleClass}>Exams &amp; resources</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/unilorin-putme" className={linkClass}>UNILORIN Post-UTME (PUTME)</Link>
              </li>
              <li>
                <Link href="/post-utme-past-questions" className={linkClass}>Past questions</Link>
              </li>
              <li>
                <Link href="/features" className={linkClass}>Features</Link>
              </li>
              <li>
                <Link href="/pricing" className={linkClass}>
                  Pricing
                  <SoonBadge />
                </Link>
              </li>
              <li>
                <Link href="/faq" className={linkClass}>FAQ</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className={colTitleClass}>Company</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className={linkClass}>About us</Link>
              </li>
              <li>
                <Link href="/contact" className={linkClass}>Contact</Link>
              </li>
              <li>
                <Link href="/#map-story" className={linkClass}>Why Propeida</Link>
              </li>
              <li>
                <Link href="/#exams" className={linkClass}>Exams we cover</Link>
              </li>
              <li>
                <Link href="/#blog" className={linkClass}>Guides</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; 2026 Propeida. Built for every ambitious student.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link href="/privacy" className="text-xs font-semibold text-gray-500 hover:text-blue-600">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs font-semibold text-gray-500 hover:text-blue-600">
              Terms of Use
            </Link>
            <Link href="/contact" className="text-xs font-semibold text-gray-500 hover:text-blue-600">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
