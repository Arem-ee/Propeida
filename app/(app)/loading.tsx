export default function AppLoading() {
  return (
    <div role="status" aria-live="polite" className="animate-pulse">
      <span className="sr-only">Loading</span>
      <div className="h-7 w-48 rounded-xl bg-blue-100/70" />
      <div className="mt-3 h-4 w-72 max-w-full rounded-lg bg-blue-50" />
      <div className="mt-8 space-y-3">
        <div className="h-24 rounded-3xl border border-blue-100/70 bg-white" />
        <div className="h-24 rounded-3xl border border-blue-100/70 bg-white" />
        <div className="h-24 rounded-3xl border border-blue-100/70 bg-white" />
      </div>
    </div>
  )
}
