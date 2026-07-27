import type { Metadata } from 'next'
import Logo from '@/components/logo'

export const metadata: Metadata = {
  title: 'Offline',
  robots: { index: false, follow: false },
}

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-sm text-center">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">You are offline</h1>
        <p className="mt-2 text-sm text-gray-500 leading-relaxed">
          Connect to the internet and try again. Your progress is saved and will sync when you are back online.
        </p>
      </div>
    </div>
  )
}
