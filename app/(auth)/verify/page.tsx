import Link from 'next/link'

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Link href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-gray-900 mb-8 min-h-[44px]">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-base">P</span>
        PrepIQ
      </Link>

      <div className="w-full max-w-sm rounded-xl border border-gray-100 bg-white p-6 shadow-xs text-center">
        <h1 className="text-xl font-extrabold text-gray-900">Verify your email</h1>
        <p className="mt-2 text-sm text-gray-500">
          Enter the verification code sent to your email, or click the link in the email to activate your account.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 min-h-[44px]"
        >
          Go to sign in
        </Link>
      </div>
    </div>
  )
}
