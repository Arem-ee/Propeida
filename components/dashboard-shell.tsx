'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Home, BarChart3, Trophy, History, User, GraduationCap, School,
  LogOut, Menu, X, ChevronDown, Settings, Gift, Heart, Mail, BookOpen, CreditCard,
} from 'lucide-react'
import { useState } from 'react'
import { useHub } from '@/components/dashboard-hub-provider'
import Logo from '@/components/logo'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/practice', label: 'Practice', icon: BarChart3 },
  { href: '/dashboard/notes', label: 'Revision Notes', icon: BookOpen },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/history', label: 'History', icon: History },
  { href: '/account', label: 'Account', icon: User },
]

const ACCOUNT_SUB_ITEMS = [
  { href: '/account', label: 'Profile', icon: User },
  { href: '/account/institutions', label: 'Institutions', icon: School },
  { href: '/account/referrals', label: 'Refer & Earn', icon: Gift },
  { href: '/account/upgrade', label: 'Upgrade', icon: CreditCard },
  { href: '/support', label: 'Support Propeida', icon: Heart },
  { href: '/dashboard/support', label: 'Contact & Support', icon: Mail },
]

export default function DashboardShell({ children, email, isAdmin, onLogout }: {
  children: React.ReactNode
  email: string | null
  isAdmin: boolean
  onLogout: () => void
}) {
  const pathname = usePathname()
  const { hub, setHub } = useHub()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [accountExpanded, setAccountExpanded] = useState(false)

  const hubBase = hub === 'universities' ? '?hub=universities' : ''

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || (pathname === '/' && !pathname.startsWith('/account'))
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 border-r border-gray-100 bg-white z-40">
        <div className="flex items-center gap-2 px-6 h-16 border-b border-gray-100 shrink-0">
          <Link href="/dashboard">
            <Logo />
          </Link>
        </div>

        <div className="px-4 pt-4 pb-2">
          <div className="flex rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setHub('jamb')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold min-h-[36px] cursor-pointer transition-colors ${
                hub === 'jamb' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5" />
              JAMB
            </button>
            <button
              onClick={() => setHub('universities')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold min-h-[36px] cursor-pointer transition-colors ${
                hub === 'universities' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <School className="h-3.5 w-3.5" />
              Universities
            </button>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.filter((i) => i.href !== '/account').map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href === '/dashboard' ? `/dashboard${hubBase}` : `${item.href}${hubBase}`}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold min-h-[44px] transition-colors ${
                  active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                {item.label}
              </Link>
            )
          })}

          <div className="pt-4">
            <button
              onClick={() => setAccountExpanded(!accountExpanded)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold min-h-[44px] transition-colors ${
                pathname.startsWith('/account') ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <User className={`h-5 w-5 ${pathname.startsWith('/account') ? 'text-blue-600' : 'text-gray-400'}`} />
              Account
              <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${accountExpanded ? 'rotate-180' : ''}`} />
            </button>
            {accountExpanded && (
              <div className="ml-8 mt-0.5 space-y-0.5">
                {ACCOUNT_SUB_ITEMS.map((item) => {
                  const Icon = item.icon
                  const active = pathname === item.href || (item.href !== '/account' && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold min-h-[40px] transition-colors ${
                        active ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </nav>

        <div className="border-t border-gray-100 px-4 py-3 space-y-2">
          {isAdmin && (
            <Link
              href="/admin/questions"
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-50 min-h-[40px]"
            >
              <Settings className="h-4 w-4 text-gray-400" />
              Admin
            </Link>
          )}
          <div className="flex items-center gap-3 px-3">
            <span className="text-xs text-gray-400 truncate flex-1">{email}</span>
            <button
              onClick={onLogout}
              className="inline-flex items-center justify-center rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/dashboard" className="min-h-[44px] flex items-center">
            <Logo size={28} />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-xl p-2 text-gray-500 hover:bg-gray-100 min-h-[44px] min-w-[44px] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <div className="px-4 pb-3">
          <div className="flex rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => { setHub('jamb'); setMobileMenuOpen(false) }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold min-h-[36px] cursor-pointer transition-colors ${
                hub === 'jamb' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500'
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5" />
              JAMB
            </button>
            <button
              onClick={() => { setHub('universities'); setMobileMenuOpen(false) }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold min-h-[36px] cursor-pointer transition-colors ${
                hub === 'universities' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500'
              }`}
            >
              <School className="h-3.5 w-3.5" />
              Universities
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="fixed inset-0 top-[113px] bg-white z-40 overflow-y-auto pb-24">
            <nav className="px-4 py-2 space-y-0.5">
              {NAV_ITEMS.filter((i) => i.href !== '/account').map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href === '/dashboard' ? `/dashboard${hubBase}` : `${item.href}${hubBase}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold min-h-[44px] transition-colors ${
                      active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                    {item.label}
                  </Link>
                )
              })}

              <div className="border-t border-gray-100 pt-3 mt-3">
                <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Account</p>
                {ACCOUNT_SUB_ITEMS.map((item) => {
                  const Icon = item.icon
                  const active = pathname === item.href || (item.href !== '/account' && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold min-h-[44px] transition-colors ${
                        active ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                      {item.label}
                    </Link>
                  )
                })}
              </div>

              {isAdmin && (
                <Link
                  href="/admin/questions"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-50 min-h-[44px]"
                >
                  <Settings className="h-5 w-5 text-gray-400" />
                  Admin
                </Link>
              )}

              <button
                onClick={() => { onLogout(); setMobileMenuOpen(false) }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-red-600 hover:bg-red-50 min-h-[44px] cursor-pointer"
              >
                <LogOut className="h-5 w-5" />
                Sign out
              </button>
            </nav>
          </div>
        )}
      </div>

      <main className="flex-1 lg:ml-64 pt-[113px] lg:pt-0 pb-20 lg:pb-0">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
          {children}
        </div>
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href === '/dashboard' ? `/dashboard${hubBase}` : `${item.href}${hubBase}`}
                className={`flex flex-col items-center justify-center gap-0.5 min-w-0 px-2 py-1 rounded-xl transition-colors min-h-[44px] ${
                  active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-bold leading-tight">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
