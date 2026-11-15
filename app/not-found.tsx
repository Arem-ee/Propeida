import Link from 'next/link'
import { Mascot } from '@/components/mascot'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Mascot expression="confused" size="lg" className="mb-6" />
      <h1 className="text-6xl font-extrabold text-gray-900">404</h1>
      <p className="mt-4 text-lg text-gray-500">This page does not exist</p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 min-h-[44px]"
      >
        Go home
      </Link>
    </div>
  )
}
