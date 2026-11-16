import { Mascot } from '@/components/mascot'

/**
 * Skeleton matching the app's repeating content shape (heading + intro,
 * a primary card, and a list), so transitions swap in without a jump and
 * the learner sees exactly where things will land before they land.
 */
export default function AppLoading() {
  return (
    <div role="status" aria-live="polite" className="mx-auto max-w-2xl">
      <span className="sr-only">Loading</span>

      {/* Heading + intro */}
      <div className="animate-pulse">
        <div className="h-9 w-56 rounded-2xl bg-gray-200" />
        <div className="mt-3 h-4 w-72 rounded-full bg-gray-100" />
      </div>

      {/* Primary card skeleton */}
      <div className="mt-6 rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_2px_16px_-8px_rgba(16,28,51,0.15)] animate-pulse">
        <div className="h-6 w-40 max-w-full rounded-full bg-blue-50" />
        <div className="mt-4 h-5 w-3/4 rounded-lg bg-gray-200" />
        <div className="mt-2 h-4 w-full rounded-lg bg-gray-100" />
        <div className="mt-2 h-4 w-2/3 rounded-lg bg-gray-100" />
        <div className="mt-4 h-10 w-28 rounded-2xl bg-blue-100/70" />
      </div>

      {/* List skeleton */}
      <div className="mt-4 space-y-2.5">
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-4 animate-pulse">
            <div className="h-9 w-9 rounded-xl bg-blue-50/80" />
            <div className="min-w-0 flex-1">
              <div className="h-4 w-40 max-w-full rounded-full bg-gray-200" />
              <div className="mt-2 h-3 w-56 max-w-full rounded-full bg-gray-100" />
            </div>
            <div className="h-4 w-14 rounded-full bg-gray-100" />
          </div>
        ))}
      </div>

      {/* Living mascot accent, bottom right */}
      <div className="pointer-events-none mt-6 flex items-center justify-end gap-3">
        <Mascot expression="thinking" size="sm" priority />
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className="loading-dot"
              style={{ animationDelay: `${dot * 160}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
