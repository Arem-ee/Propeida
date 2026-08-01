import { GraduationCap } from 'lucide-react'

export default function ComingSoon() {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 mb-6">
        <GraduationCap className="h-7 w-7 text-blue-600" />
      </div>
      <h1 className="text-2xl font-extrabold text-gray-900">JAMB prep is on the way.</h1>
      <p className="mt-3 text-sm text-gray-500 leading-relaxed">
        We&apos;re building it the same way we built Post-UTME — real, verified questions, not just filler. Check back soon.
      </p>
    </div>
  )
}
