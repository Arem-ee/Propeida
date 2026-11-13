import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getProStatus } from '@/lib/entitlements'
import { getDueRecallCards } from '@/lib/actions/recall'
import RecallPlayer from '@/components/learn/recall-player'
import UpgradeCard from '@/components/paywall/upgrade-card'

export const metadata = { title: 'Quick recall' }

export default async function RecallPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const pro = user ? await getProStatus(user.id) : { isPro: false, labels: [], source: null, expiresAt: null }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/home"
        className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-ink-soft hover:text-blue-700 min-h-[36px]"
      >
        <ArrowLeft className="h-4 w-4" /> Home
      </Link>

      <div className="mb-6">
        <h1 className="font-display text-[32px] font-semibold leading-tight text-black sm:text-4xl">
          Quick recall
        </h1>
        <p className="mt-1.5 text-[15px] font-semibold text-ink-soft">
          One fact at a time. Say it in your head, then flip.
        </p>
      </div>

      {!pro.isPro ? (
        <UpgradeCard
          title="Quick recall is Pro"
          body="It keeps one-fact knowledge in your head until exam day."
          bullets={['A short round every time you learn.', 'Due cards come back on their own.']}
        />
      ) : (
        <RecallBody />
      )}
    </div>
  )
}

async function RecallBody() {
  const cards = await getDueRecallCards(10).catch(() => [])
  if (cards.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-emerald-200 bg-emerald-50/60 p-8 text-center animate-pop-in">
        <h2 className="font-display text-2xl font-medium text-black">Nothing due for recall.</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm font-semibold text-ink-soft">
          Learn a lesson or finish some practice. Your recall round comes back here.
        </p>
        <Link
          href="/learn"
          className="mt-6 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-7 py-3.5 text-[15px] font-extrabold text-white hover:bg-blue-700 min-h-[52px] pressable"
        >
          Browse lessons
        </Link>
      </div>
    )
  }
  return <RecallPlayer cards={cards} />
}
