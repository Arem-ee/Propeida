export default function AdminLoading() {
  return (
    <div role="status" aria-live="polite" className="animate-pulse">
      <span className="sr-only">Loading</span>
      <div className="h-4 w-28 rounded-full bg-gray-200" />
      <div className="mt-2 h-8 w-56 rounded-lg bg-gray-200" />
      <div className="mt-3 h-4 w-80 max-w-full rounded bg-gray-100" />

      {/* Pipeline skeleton */}
      <div className="mt-8 h-28 rounded-2xl border border-blue-100/70 bg-white" />

      {/* Attention cards skeleton */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl border border-blue-100/70 bg-white p-5">
            <div className="h-3 w-20 rounded-full bg-gray-200" />
            <div className="mt-4 h-9 w-16 rounded-lg bg-gray-200" />
            <div className="mt-4 h-3 w-24 rounded-full bg-gray-100" />
          </div>
        ))}
      </div>

      {/* Setup grid skeleton */}
      <div className="mt-6 h-40 rounded-2xl border border-blue-100/70 bg-white" />
    </div>
  )
}
