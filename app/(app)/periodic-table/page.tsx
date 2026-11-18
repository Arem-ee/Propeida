import type { Metadata } from 'next'
import PeriodicTable from '@/components/chemistry/periodic-table'
import { Sparkles, BookOpen, ArrowRight, FlaskConical } from 'lucide-react'
import Link from 'next/link'
import { getPeriodicTableEligibility } from '@/lib/periodic-table-access'

export const metadata: Metadata = {
  title: 'Periodic Table of Elements - Chemistry Reference',
  description: 'Interactive IUPAC Periodic Table with electron configurations, relative atomic masses, and First 20 Elements focus for JAMB and Post-UTME candidates.',
}

export default async function PeriodicTablePage() {
  const { canSee } = await getPeriodicTableEligibility()

  if (!canSee) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <FlaskConical className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="mt-5 font-heading text-2xl font-bold tracking-tight text-slate-900">
          Chemistry reference
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          The Periodic Table is available to learners studying Chemistry (and to admins). Add Chemistry to your subjects on your account page to unlock it here.
        </p>
        <Link
          href="/account"
          className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-blue-700"
        >
          <span>Choose your subjects</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl pb-16">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-1">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Chemistry Reference Tool</span>
        </div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Periodic Table of Elements
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-2xl leading-relaxed">
          Standard IUPAC data with atomic numbers, masses, electron configurations, and oxidation states. Toggle between the <strong>First 20 Elements (JAMB/WAEC focus)</strong> and the <strong>Full 118 Elements</strong>.
        </p>
      </div>

      {/* Main Interactive Table Component */}
      <PeriodicTable
        initialFocus="first-20"
        caption="Tap any element to view its complete electron shell structure, spdf configuration, and common valencies."
        className="mb-8"
      />

      {/* High-Yield JAMB Periodic Trends Cheat Sheet */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-4 w-4 text-amber-500" />
          <h2 className="font-heading text-lg font-bold text-slate-900">
            High-Yield Exam Rules: Periodic Trends
          </h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Every year, JAMB and WAEC test these four fundamental trends across periods and down groups:
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5">
            <span className="block font-heading text-sm font-bold text-blue-900">
              Atomic Radius
            </span>
            <p className="mt-1 text-xs text-blue-800 leading-relaxed">
              <strong>Decreases</strong> across a period (greater nuclear charge pulls electrons closer).<br/>
              <strong>Increases</strong> down a group (extra electron shells added).
            </p>
          </div>

          <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3.5">
            <span className="block font-heading text-sm font-bold text-rose-900">
              Ionization Energy
            </span>
            <p className="mt-1 text-xs text-rose-800 leading-relaxed">
              <strong>Increases</strong> across a period.<br/>
              <strong>Decreases</strong> down a group (outer electrons are shielded and farther from the nucleus).
            </p>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5">
            <span className="block font-heading text-sm font-bold text-emerald-900">
              Electronegativity
            </span>
            <p className="mt-1 text-xs text-emerald-800 leading-relaxed">
              <strong>Increases</strong> across a period toward Fluorine (most electronegative: 3.98).<br/>
              <strong>Decreases</strong> down a group.
            </p>
          </div>

          <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-3.5">
            <span className="block font-heading text-sm font-bold text-purple-900">
              Metallic Character
            </span>
            <p className="mt-1 text-xs text-purple-800 leading-relaxed">
              <strong>Decreases</strong> across a period (elements become nonmetals).<br/>
              <strong>Increases</strong> down a group (elements lose valence electrons more easily).
            </p>
          </div>
        </div>

        {/* Practice CTA */}
        <div className="mt-5 flex flex-col gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between border border-slate-200/60">
          <div>
            <span className="block font-heading text-sm font-bold text-slate-800">
              Ready to test your Periodic Table knowledge?
            </span>
            <span className="text-xs text-slate-500">
              Practise real past UTME questions on Periodic Trends, Electronic Configuration, and Chemical Families.
            </span>
          </div>
          <Link
            href="/practice"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700"
          >
            <span>Start Practice</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
