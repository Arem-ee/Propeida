'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, ArrowRight, MessageCircle } from 'lucide-react'
import Logo from '@/components/logo'
import { siteConfig } from '@/lib/site-config'

export default function MarketingHeader() {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { label: 'Practice', href: '/practice' },
    { label: 'Exams', href: '/#exams' },
    { label: 'Leaderboard', href: '/leaderboard' },
    { label: 'Support', href: '/support' },
    { label: 'Partner with Propeida', href: '/partner' },
  ]

  const close = () => setIsOpen(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="min-h-[44px]">
          <Logo />
        </Link>

        <nav className="hidden lg:flex lg:items-center lg:gap-7">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-500 transition-colors hover:text-blue-600 py-2 px-1 min-h-[44px] flex items-center"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={siteConfig.whatsapp.channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-green-600 py-2 px-1 min-h-[44px] flex items-center"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </nav>

        <div className="hidden md:flex md:items-center md:gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 active:bg-blue-800 min-h-[44px]"
          >
            Start Practicing Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center justify-center rounded-xl p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 min-h-[44px] min-w-[44px]"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-b border-gray-100 bg-white px-4 pt-2 pb-4 md:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className="w-full rounded-xl px-3 py-3 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors min-h-[44px]"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={siteConfig.whatsapp.channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
              className="w-full rounded-xl px-3 py-3 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-green-600 transition-colors min-h-[44px] flex items-center gap-2"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp Channel
            </a>
            <div className="mt-4 border-t border-gray-100 pt-4">
              <Link
                href="/signup"
                onClick={close}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-base font-semibold text-white hover:bg-blue-700 transition-colors min-h-[44px]"
              >
                Start Practicing Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}