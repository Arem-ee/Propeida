import Link from 'next/link'
import { MessageCircle, Mail } from 'lucide-react'
import Logo from '@/components/logo'
import { siteConfig } from '@/lib/site-config'

const linkClass = 'text-sm text-slate-400 hover:text-white min-h-[44px] py-1 block'
const colTitleClass = 'mb-4 text-xs font-bold uppercase tracking-wider text-slate-400'

export default function MarketingFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12 lg:py-14 border-b border-white/10">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 min-h-[44px]" aria-label="Propeida home">
              <Logo size={40} showText={false} />
              <span className="font-display text-xl font-semibold tracking-tight text-white">Propeida</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              You get real CBT practice, you learn the topic, you practise the question, and you walk in ready
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white min-h-[44px]"
              >
                <Mail className="h-4 w-4" />
                {siteConfig.contact.email}
              </a>
              <a
                href={siteConfig.whatsapp.channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-green-500/10 px-3 py-2 text-xs font-bold text-green-300 min-h-[44px]"
              >
                <MessageCircle className="h-4 w-4 shrink-0" />
                WhatsApp channel
              </a>
            </div>
          </div>

          <nav aria-label="Product">
            <h4 className={colTitleClass}>Product</h4>
            <ul className="space-y-3">
              <li><Link href="/learn" className={linkClass}>Learn</Link></li>
              <li><Link href="/practice" className={linkClass}>Practice</Link></li>
              <li><Link href="/mocks" className={linkClass}>Mock exams</Link></li>
              <li><Link href="/progress" className={linkClass}>Your progress</Link></li>
              <li><Link href="/login" className={linkClass}>Sign in</Link></li>
              <li><Link href="/signup" className={linkClass}>Create an account</Link></li>
            </ul>
          </nav>

          <nav aria-label="Exams and resources">
            <h4 className={colTitleClass}>Exams &amp; resources</h4>
            <ul className="space-y-3">
              <li><Link href="/learn" className={linkClass}>JAMB (UTME)</Link></li>
              <li><Link href="/unilorin-putme" className={linkClass}>UNILORIN Post-UTME (PUTME)</Link></li>
              <li><Link href="/post-utme-past-questions" className={linkClass}>Past questions</Link></li>
              <li><Link href="/features" className={linkClass}>Features</Link></li>
              <li><Link href="/pricing" className={linkClass}>Pricing</Link></li>
              <li><Link href="/faq" className={linkClass}>FAQ</Link></li>
            </ul>
          </nav>

          <nav aria-label="Company">
            <h4 className={colTitleClass}>Company</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className={linkClass}>About us</Link></li>
              <li><Link href="/contact" className={linkClass}>Contact</Link></li>
              <li><Link href="/#map-story" className={linkClass}>Why Propeida</Link></li>
              <li><Link href="/#exams" className={linkClass}>Exams we cover</Link></li>
              <li><Link href="/blog" className={linkClass}>Guides</Link></li>
              <li><a href={siteConfig.whatsapp.channelUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>WhatsApp channel</a></li>
            </ul>
          </nav>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
          <p className="text-xs text-slate-500">&copy; 2026 Propeida. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link href="/privacy" className="text-xs font-semibold text-slate-400 hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs font-semibold text-slate-400 hover:text-white">
              Terms of Use
            </Link>
            <Link href="/contact" className="text-xs font-semibold text-slate-400 hover:text-white">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
