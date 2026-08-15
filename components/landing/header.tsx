'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import Logo from '@/components/logo'

const NAV_ITEMS = [
  { label: 'Features', href: '/#features' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'Support', href: '/support' },
]

export default function LandingHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const close = () => setIsOpen(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="min-h-[44px]" aria-label="Propeida home">
          <Logo />
        </Link>

        <nav className="hidden md:flex md:items-center md:gap-8">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-[44px] items-center py-2 text-[13px] text-gray-500 transition-colors hover:text-gray-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link
            href="/signup"
            className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-blue-700 min-h-[44px]"
          >
            Start practicing
          </Link>
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            aria-expanded={isOpen}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-gray-100 bg-white px-5 pb-5 md:hidden">
          <nav className="flex flex-col">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className="flex min-h-[44px] items-center border-b border-gray-50 text-[14px] text-gray-600 hover:text-blue-700"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/signup"
              onClick={close}
              className="mt-4 flex min-h-[44px] items-center justify-center rounded-xl bg-blue-600 text-[14px] font-medium text-white hover:bg-blue-700"
            >
              Start practicing
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}