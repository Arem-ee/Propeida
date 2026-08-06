import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import Logo from '@/components/logo'
import { siteConfig } from '@/lib/site-config'

export default function MarketingFooter() {
  const linkClass = 'text-sm text-gray-500 hover:text-blue-600 min-h-[44px] py-1 block'

  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Logo />
            <p className="mt-4 text-sm text-gray-500 leading-relaxed">
              Every Nigerian candidate deserves a real chance. Free, verified exam preparation for JAMB and Post-UTME.
            </p>
            <a
              href={siteConfig.whatsapp.channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-xs font-bold text-green-700"
            >
              <MessageCircle className="h-4 w-4" />
              {siteConfig.whatsapp.dailyQuestionCopy}
            </a>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Students</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/practice" className={linkClass}>Practice</Link>
              </li>
              <li>
                <Link href="/#exams" className={linkClass}>Exams</Link>
              </li>
              <li>
                <Link href="/leaderboard" className={linkClass}>Leaderboard</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Partners</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/partner" className={linkClass}>Schools</Link>
              </li>
              <li>
                <Link href="/partner" className={linkClass}>Tutorial Centers</Link>
              </li>
              <li>
                <Link href="/sponsor" className={linkClass}>Sponsors</Link>
              </li>
              <li>
                <Link href="/funding" className={linkClass}>Funding</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Community</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href={siteConfig.whatsapp.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  WhatsApp Channel
                </a>
              </li>
              <li>
                <Link href="/contact" className={linkClass}>Contact</Link>
              </li>
              <li>
                <Link href="/terms" className={linkClass}>Terms of Service</Link>
              </li>
              <li>
                <Link href="/privacy" className={linkClass}>Privacy Policy</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            &copy; 2026 Propeida. All rights reserved.
          </p>
          <p className="text-xs font-semibold text-gray-500">
            Free for students. Funded by people who believe in prepared students.
          </p>
        </div>
      </div>
    </footer>
  )
}