import Link from 'next/link'
import Logo from '@/components/logo'
import { siteConfig } from '@/lib/site-config'

const COLUMNS = [
  {
    heading: 'Product',
    links: [
      { label: 'Practice', href: '/practice' },
      { label: 'Explore careers', href: '/explore/careers' },
      { label: 'Features', href: '/#features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'About', href: '/about' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Contact', href: '/contact' },
      { label: 'Support Propeida', href: '/support' },
      { label: 'FAQ', href: '/#faq' },
      { label: 'WhatsApp channel', href: siteConfig.whatsapp.channelUrl, external: true },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Terms', href: '/terms' },
      { label: 'Privacy', href: '/privacy' },
    ],
  },
]

export default function LandingFooter() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-6xl px-5 pb-12 pt-16 sm:px-8 sm:pb-16 sm:pt-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link href="/" aria-label="Propeida home">
              <Logo />
            </Link>
            <p className="mt-5 max-w-xs text-[13.5px] leading-relaxed text-gray-500">
              Real questions, real practice, no shortcuts. Built for Nigerian candidates preparing for JAMB and
              Post-UTME.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading} className="md:col-span-2 lg:col-span-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                {col.heading}
              </p>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="text-[13.5px] text-gray-600 transition-colors hover:text-blue-600"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-gray-100 pt-7">
          <p className="text-[11.5px] text-gray-400">
            © {new Date().getFullYear()} Propeida. Built for Nigerian candidates.
          </p>
        </div>
      </div>
    </footer>
  )
}