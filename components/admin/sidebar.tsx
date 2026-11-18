'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ArrowLeftToLine, Atom } from 'lucide-react'
import Logo from '@/components/logo'
import { ADMIN_NAV } from './nav'

interface AdminSidebarProps {
  reviewCount: number
  contactCount: number
  email: string | null
}

function badgeFor(item: { badgeKey?: 'review' | 'contact' }, counts: { review: number; contact: number }) {
  if (item.badgeKey === 'review') return counts.review
  if (item.badgeKey === 'contact') return counts.contact
  return 0
}

function NavContents({
  pathname,
  counts,
  email,
  onNavigate,
}: {
  pathname: string
  counts: { review: number; contact: number }
  email: string | null
  onNavigate?: () => void
}) {
  const allItems = ADMIN_NAV.flatMap((group) => group.items)
  const activeHref = allItems
    .filter((item) => item.href !== '/admin' && (pathname === item.href || pathname.startsWith(item.href + '/')))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href ?? (pathname === '/admin' ? '/admin' : '')

  return (
    <div className="flex h-full flex-col">
      <nav className="flex-1 overflow-y-auto px-4 py-5" aria-label="Admin sections">
        {ADMIN_NAV.map((group) => (
          <div key={group.label} className="mb-6 last:mb-0">
            <p className="px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-ink-soft/60">
              {group.label}
            </p>
            <ul className="mt-1.5 space-y-1">
              {group.items.map((item) => {
                const active = item.href === activeHref
                const badge = badgeFor(item, counts)
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      className={`group flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-[13px] font-extrabold transition-colors ${
                        active
                          ? 'bg-blue-600 text-white shadow-[0_6px_16px_-8px_rgba(37,99,235,0.7)]'
                          : 'text-ink-soft hover:bg-blue-50 hover:text-black'
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-white' : 'text-ink-soft/70 group-hover:text-blue-700'}`} aria-hidden />
                      <span className="flex-1">{item.label}</span>
                      {badge > 0 && (
                        <span
                          className={`inline-flex min-w-[26px] items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-extrabold tabular-nums ${
                            active ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {badge > 99 ? '99+' : badge}
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-blue-100/70 px-4 py-4">
        {email && (
          <p className="mb-2 truncate px-3 text-[11px] font-semibold text-ink-soft/80" title={email}>
            {email}
          </p>
        )}
        <Link
          href="/periodic-table"
          className="mb-1 flex min-h-[44px] items-center gap-2 rounded-xl px-3 text-[13px] font-extrabold text-blue-700 hover:bg-blue-50"
        >
          <Atom className="h-4 w-4" aria-hidden />
          Periodic Table
        </Link>
        <Link
          href="/home"
          className="flex min-h-[44px] items-center gap-2 rounded-xl px-3 text-[13px] font-extrabold text-blue-700 hover:bg-blue-50"
        >
          <ArrowLeftToLine className="h-4 w-4" aria-hidden />
          Back to the app
        </Link>
      </div>
    </div>
  )
}

export default function AdminSidebar({ reviewCount, contactCount, email }: AdminSidebarProps) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const counts = { review: reviewCount, contact: contactCount }

  // Close the drawer whenever the route changes
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  // Escape closes the drawer
  useEffect(() => {
    if (!drawerOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [drawerOpen])

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] border-r border-blue-100/70 bg-white lg:block">
        <div className="flex h-16 items-center gap-2.5 border-b border-blue-100/70 px-5">
          <Link href="/admin" aria-label="Admin dashboard" className="flex items-center gap-2.5">
            <Logo />
            <span className="mt-0.5 rounded-md bg-gray-900 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white">
              Admin
            </span>
          </Link>
        </div>
        <div className="h-[calc(100%-4rem)]">
          <NavContents pathname={pathname} counts={counts} email={email} />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-blue-100/70 bg-white/90 px-4 backdrop-blur lg:hidden">
        <Link href="/admin" aria-label="Admin dashboard" className="flex items-center gap-2">
          <Logo />
          <span className="mt-0.5 rounded-md bg-gray-900 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white">
            Admin
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open admin menu"
          aria-expanded={drawerOpen}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-gray-200 text-ink-soft"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
          <button
            type="button"
            aria-label="Close admin menu"
            className="absolute inset-0 cursor-default bg-black/45"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Admin navigation"
            className="absolute inset-y-0 left-0 flex w-[300px] max-w-[85vw] flex-col bg-white shadow-2xl"
          >
            <div className="flex h-16 items-center justify-between border-b border-blue-100/70 px-5">
              <Logo />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-ink-soft hover:bg-gray-100"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <NavContents pathname={pathname} counts={counts} email={email} onNavigate={() => setDrawerOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
