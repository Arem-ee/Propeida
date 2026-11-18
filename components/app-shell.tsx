'use client'

import { usePathname } from 'next/navigation'
import Link, { useLinkStatus } from 'next/link'
import {
  Home, BookOpen, BarChart3, Timer, TrendingUp, User, LogOut, Settings, X, Download, Crosshair, Users, ChevronRight, Sparkles, Loader2,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import Logo from '@/components/logo'
import { WinToastList } from '@/components/celebrations/win-toast-list'
import { ReferralClaim } from '@/components/referrals/referral-claim'

const TABS = [
  { href: '/home', label: 'Home', icon: Home, tour: 'home-tab' },
  { href: '/learn', label: 'Learn', icon: BookOpen, tour: 'learn-tab' },
  { href: '/practice', label: 'Practice', icon: BarChart3, tour: 'practice-tab' },
  { href: '/mocks', label: 'Mocks', icon: Timer, tour: 'mocks-tab' },
  { href: '/progress', label: 'Progress', icon: TrendingUp, tour: 'progress-tab' },
]

const ACCOUNT_LINKS = [
  { href: '/account', label: 'Profile', icon: User },
  { href: '/account/upgrade', label: 'Pro plans', icon: Sparkles },
  { href: '/squad', label: 'Study squad', icon: Users },
  { href: '/target', label: 'My target', icon: Crosshair },
  { href: '/account/downloads', label: 'Downloads', icon: Download },
  { href: '/account/settings', label: 'Settings', icon: Settings },
]

const ACCOUNT_ITEMS = [
  { href: '/account', label: 'Profile', caption: 'Your account details', icon: User },
  { href: '/account/upgrade', label: 'Pro plans', caption: 'What Pro opens', icon: Sparkles },
  { href: '/squad', label: 'Study squad', caption: 'Practise with people', icon: Users },
  { href: '/target', label: 'My target', caption: 'The course you want', icon: Crosshair },
  { href: '/account/downloads', label: 'Downloads', caption: 'Your files', icon: Download },
  { href: '/account/settings', label: 'Settings', caption: 'Your preferences', icon: Settings },
]

function SidebarTabLink({
  item,
  active,
}: {
  item: (typeof TABS)[number]
  active: boolean
}) {
  const { pending } = useLinkStatus()
  const Icon = item.icon
  return (
    <Link
      key={item.href}
      data-tour={item.tour}
      href={item.href}
      aria-current={active ? 'page' : undefined}
      aria-busy={pending}
      className={`group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-[15px] font-extrabold min-h-[52px] transition-all pressable ${
        active
          ? 'bg-blue-600 text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.6)]'
          : 'text-ink-soft hover:text-black hover:bg-blue-50/70'
      }`}
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
        active ? 'bg-white/20' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'
      }`}>
        {pending && !active
          ? <Loader2 className="h-[18px] w-[18px] animate-spin" />
          : <Icon className="h-[18px] w-[18px]" />}
      </span>
      {item.label}
      {pending && !active ? (
        <span className="ml-auto h-1.5 w-8 overflow-hidden rounded-full bg-blue-200/60">
          <span className="block h-full w-3 rounded-full bg-blue-600 animate-tab-progress" />
        </span>
      ) : null}
    </Link>
  )
}

function BottomTabLink({
  item,
  active,
}: {
  item: (typeof TABS)[number]
  active: boolean
}) {
  const { pending } = useLinkStatus()
  const Icon = item.icon
  return (
    <Link
      key={item.href}
      data-tour={item.tour}
      href={item.href}
      aria-current={active ? 'page' : undefined}
      aria-busy={pending}
      className={`relative flex flex-col items-center justify-center gap-1 min-w-0 flex-1 px-1 py-1.5 rounded-2xl transition-all pressable min-h-[52px] ${
        active ? 'text-blue-700' : 'text-gray-500 hover:text-gray-600'
      }`}
    >
      {pending && !active
        ? <Loader2 className="h-[22px] w-[22px] animate-spin" />
        : <Icon className="h-[22px] w-[22px] transition-transform duration-200" strokeWidth={active ? 2.5 : 2} />}
      <span className="text-[10px] font-extrabold leading-tight">{item.label}</span>
      {active && (
        <span className="absolute bottom-[3px] h-1 w-8 rounded-full bg-blue-600 animate-pop-in" />
      )}
    </Link>
  )
}

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

  useEffect(() => {
    setAccountOpen(false)
  }, [pathname])

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
            const active = isActive(item.href)
            return (
              <SidebarTabLink key={item.href} item={item} active={active} />
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
            <ChevronRight className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${accountOpen ? 'rotate-90' : ''}`} />
          </button>
        </div>
      </aside>

      {/* Desktop account panel: floats on the right-hand side, away from the sidebar */}
      {accountOpen && (
        <>
          <button
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setAccountOpen(false)}
            className="fixed inset-0 z-40 hidden cursor-default bg-black/15 lg:block"
            aria-label="Close account menu"
          />
          <div
            role="dialog"
            aria-modal="false"
            id="account-menu-desktop"
            aria-label="Account menu"
            className="fixed bottom-4 z-50 hidden w-[340px] max-w-[calc(100vw-17rem-1rem)] rounded-3xl border border-blue-100/80 bg-white p-4 shadow-[0_24px_60px_-24px_rgba(16,28,51,0.35)] animate-pop-in lg:block"
            style={{ left: 'calc(17rem + 0.75rem)' }}
          >
            <div className="flex items-center gap-3 border-b border-blue-100/60 pb-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-display text-base text-white">
                {initial}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[12px] font-extrabold text-black">{email}</span>
                <span className="block text-[11px] font-bold text-ink-soft">Your Propeida account</span>
              </span>
            </div>
            <nav aria-label="Account" className="mt-2 space-y-1">
              {ACCOUNT_ITEMS.map((item) => {
                const Icon = item.icon
                const active = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`group flex items-center gap-3.5 rounded-2xl px-3 py-2.5 transition-colors min-h-[52px] ${
                      active ? 'bg-blue-50/80' : 'hover:bg-blue-50/70'
                    }`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      active ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'
                    }`}>
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-sm font-extrabold ${active ? 'text-blue-800' : 'text-black'}`}>{item.label}</span>
                      <span className="block text-[11px] font-semibold text-ink-soft">{item.caption}</span>
                    </span>
                    <ChevronRight className={`h-4 w-4 shrink-0 ${active ? 'text-blue-500' : 'text-gray-300 group-hover:text-gray-400'}`} />
                  </Link>
                )
              })}
            </nav>
            <button
              onClick={onLogout}
              className="mt-2 flex w-full items-center gap-3.5 rounded-2xl border-t border-blue-100/60 px-3 pb-2 pt-3 text-left cursor-pointer hover:bg-red-50/60"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <LogOut className="h-[18px] w-[18px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-extrabold text-red-600">Sign out</span>
                <span className="block text-[11px] font-semibold text-ink-soft">Sign out of Propeida</span>
              </span>
            </button>
          </div>
        </>
      )}

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
          <div id="account-menu-mobile" className="border-t border-blue-100/60 bg-paper px-4 py-3 animate-pop-in">
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
        <WinToastList />
        <ReferralClaim />
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:py-10">
          {children}
        </div>
      </main>

      {/* Mobile bottom tabs */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-blue-100/60 safe-area-bottom" aria-label="Primary">
        <div className="flex items-center justify-around h-[68px] px-1">
          {TABS.map((item) => {
            const active = isActive(item.href)
            return (
              <BottomTabLink key={item.href} item={item} active={active} />
            )
          })}
        </div>
      </nav>
    </div>
  )
}


