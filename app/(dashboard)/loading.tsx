export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse" aria-label="Loading your dashboard">
      <div className="h-8 w-48 rounded-lg bg-gray-200" />
      <div className="mt-3 h-4 w-72 rounded bg-gray-100" />
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="h-36 rounded-2xl bg-gray-100 sm:col-span-2" />
        <div className="h-28 rounded-2xl bg-gray-100" />
        <div className="h-28 rounded-2xl bg-gray-100" />
      </div>
    </div>
  )
}
