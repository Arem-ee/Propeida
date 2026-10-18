'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Home, BookOpen, BarChart3, Timer, TrendingUp, User, LogOut, Settings, X, Download, Crosshair,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import Logo from '@/components/logo'

const TABS = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/learn', label: 'Learn', icon: BookOpen },
  { href: '/practice', label: 'Practice', icon: BarChart3 },
  { href: '/mocks', label: 'Mocks', icon: Timer },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
]

const ACCOUNT_LINKS = [
  { href: '/account', label: 'Profile', icon: User },
  { href: '/target', label: 'My target', icon: Crosshair },
  { href: '/account/downloads', label: 'Downloads', icon: Download },
  { href: '/account/settings', label: 'Settings', icon: Settings },
]

export default function AppShell({ children, email, isAdmin, onLogout }: {
  children: React.ReactNode
  email: string | null
  isAdmin: boolean
  onLogout: () => void
}) {
  const pathname = usePathname()
  const [accountOpen, setAccountOpen] = useState(false)

  useEffect(() => {
    if (!accountOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAccountOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [accountOpen])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')
  const initial = (email?.[0] ?? '?').toUpperCase()

  return (
    <div className="min-h-screen flex">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-xl focus:bg-blue-600 focus:px-4 focus:py-3 focus:text-sm focus:font-extrabold focus:text-white focus:shadow-lg"
      >
        Skip to content
      </a>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-68 lg:fixed lg:inset-y-0 border-r border-blue-100/60 bg-white/80 backdrop-blur z-40">
        <div className="flex items-center px-6 h-20 shrink-0">
          <Link href="/home" aria-label="Propeida home">
            <Logo />
          </Link>
        </div>

        <nav className="flex-1 px-4 py-3 space-y-1.5 overflow-y-auto" aria-label="Primary">
          {TABS.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-[15px] font-extrabold min-h-[52px] transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.6)]'
                    : 'text-ink-soft hover:text-black hover:bg-blue-50/70'
                }`}
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                  active ? 'bg-white/20' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'
                }`}>
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-blue-100/60 px-4 py-4">
          {isAdmin && (
            <Link
              href="/admin/questions"
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-ink-soft hover:text-black hover:bg-blue-50/70 min-h-[40px]"
            >
              <Settings className="h-4 w-4 text-gray-500" />
              Admin
            </Link>
          )}
          <button
            onClick={() => setAccountOpen((v) => !v)}
            className="flex w-full items-center gap-3 rounded-2xl bg-cream px-3.5 py-2.5 text-left cursor-pointer"
            aria-expanded={accountOpen}
            aria-controls="account-menu-desktop"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 font-display text-[15px] text-white">
              {initial}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-extrabold text-black">{email}</span>
              <span className="block text-[11px] font-bold text-ink-soft">Account</span>
            </span>
          </button>
          {accountOpen && (
            <div id="account-menu-desktop" className="mt-1.5 space-y-0.5 rounded-2xl border border-blue-100/70 bg-white p-1.5">
              {ACCOUNT_LINKS.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-ink-soft hover:text-black hover:bg-blue-50/70 min-h-[44px]"
                  >
                    <Icon className="h-4 w-4 text-gray-500" />
                    {item.label}
                  </Link>
                )
              })}
              <button
                onClick={onLogout}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-extrabold text-red-600 hover:bg-red-50 min-h-[44px] cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-paper/90 backdrop-blur border-b border-blue-100/60">
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/home" aria-label="Propeida home">
            <Logo size={28} />
          </Link>
          <button
            onClick={() => setAccountOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-display text-base text-white cursor-pointer"
            aria-label="Account menu"
            aria-expanded={accountOpen}
            aria-controls="account-menu-mobile"
          >
            {initial}
          </button>
        </div>
        {accountOpen && (
          <div id="account-menu-mobile" className="border-t border-blue-100/60 bg-paper px-4 py-3">
            <p className="truncate px-1 text-xs font-extrabold text-black">{email}</p>
            <div className="mt-1 space-y-0.5">
              {ACCOUNT_LINKS.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-ink-soft min-h-[48px]"
                  >
                    <Icon className="h-5 w-5 text-gray-500" />
                    {item.label}
                  </Link>
                )
              })}
              {isAdmin && (
                <Link
                  href="/admin/questions"
                  onClick={() => setAccountOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-ink-soft min-h-[48px]"
                >
                  <Settings className="h-5 w-5 text-gray-500" />
                  Admin
                </Link>
              )}
              <button
                onClick={onLogout}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-extrabold text-red-600 min-h-[48px] cursor-pointer"
              >
                <LogOut className="h-5 w-5" />
                Sign out
              </button>
              <button
                onClick={() => setAccountOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl px-3 py-2 text-xs font-bold text-gray-500 min-h-[40px] cursor-pointer"
              >
                <X className="h-4 w-4" />
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      <main id="main-content" tabIndex={-1} className="flex-1 lg:ml-68 pt-16 lg:pt-0 pb-24 lg:pb-0 focus:outline-none">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:py-10">
          {children}
        </div>
      </main>

      {/* Mobile bottom tabs */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-blue-100/60 safe-area-bottom" aria-label="Primary">
        <div className="flex items-center justify-around h-[68px] px-1">
          {TABS.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`relative flex flex-col items-center justify-center gap-1 min-w-0 flex-1 px-1 py-1.5 rounded-2xl transition-colors min-h-[52px] ${
                  active ? 'text-blue-700' : 'text-gray-500 hover:text-gray-600'
                }`}
              >
                <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.5 : 2} />
                <span className="text-[10px] font-extrabold leading-tight">{item.label}</span>
                {active && (
                  <span className="absolute bottom-[3px] h-1 w-8 rounded-full bg-blue-600" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
