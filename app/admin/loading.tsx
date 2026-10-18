export default function AdminLoading() {
  return (
    <div role="status" aria-live="polite" className="animate-pulse">
      <span className="sr-only">Loading</span>
      <div className="h-7 w-40 rounded-lg bg-gray-200" />
      <div className="mt-3 h-4 w-64 max-w-full rounded bg-gray-100" />
      <div className="mt-6 h-64 rounded-xl border border-gray-100 bg-gray-50" />
    </div>
  )
}
