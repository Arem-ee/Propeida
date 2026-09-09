export default function ExploreLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-8 sm:pt-12" aria-label="Loading discoveries">
      <div className="mx-auto flex max-w-md animate-pulse flex-col items-center">
        <div className="h-3 w-20 rounded bg-blue-100" />
        <div className="mt-3 h-9 w-64 rounded-lg bg-gray-200" />
        <div className="mt-4 h-10 w-full rounded-xl bg-gray-100" />
      </div>
      <div className="mt-8 space-y-5 animate-pulse">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-56 rounded-3xl border border-gray-100 bg-gray-50" />
        ))}
      </div>
    </div>
  )
}
