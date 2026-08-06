'use client'

import { useState } from 'react'
import Link from 'next/link'
import { GraduationCap, Compass, Check, ArrowRight } from 'lucide-react'
import { siteConfig } from '@/lib/site-config'
import { submitInquiry } from '@/lib/actions/inquiries'

function SchoolRequestForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSending(true)
    try {
      await submitInquiry({
        type: 'school-request',
        email,
        message: 'Please add this university to Propeida.',
      })
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-100 p-3 text-sm font-semibold text-green-700">
        <Check className="h-4 w-4" />
        Noted. We build exam banks one university at a time — yours is on the list.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none min-h-[44px]"
        />
        <button
          type="submit"
          disabled={sending}
          className="shrink-0 rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white hover:bg-gray-800 disabled:bg-gray-400 min-h-[44px] cursor-pointer"
        >
          {sending ? 'Sending...' : 'Request your school'}
        </button>
      </div>
      {error && (
        <div className="mt-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}
    </form>
  )
}

export default function MarketingPracticeCategories() {
  const jamb = siteConfig.exams.jamb
  const unilorin = siteConfig.exams.unilorin

  return (
    <section id="exams" className="border-t border-gray-100 bg-gray-50/30 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Prepared for the exam that decides your future
          </h2>
          <p className="mt-4 text-lg text-gray-500 leading-relaxed">
            The same practice quality, for every candidate. JAMB, Post-UTME, and the universities you ask for next.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex flex-col justify-between rounded-xl border border-gray-100 bg-white p-6 sm:p-8 shadow-2xs hover:border-blue-100 transition-colors">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-6">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{unilorin.name}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">{unilorin.tagline}</p>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 min-h-[44px]"
              >
                Start practicing free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-gray-100 bg-white p-6 sm:p-8 hover:border-blue-100 transition-all">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 mb-6">
                <Compass className="h-4 w-4" />
                Almost ready
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{jamb.name}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{jamb.description}</p>
            </div>
            <div className="border-t border-gray-100 pt-4 mt-6">
              <span className="text-sm font-semibold text-gray-400">Notify me when it launches</span>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-gray-100 bg-gray-900 p-6 sm:p-8 text-white">
            <div>
              <h3 className="text-lg font-bold mb-3">Your school next</h3>
              <p className="text-sm text-gray-300 leading-relaxed mb-6">
                We build exam banks one university at a time, starting with the schools our partners ask for. Tell us yours.
              </p>
            </div>
            <div className="border-t border-gray-800 pt-5">
              <SchoolRequestForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}