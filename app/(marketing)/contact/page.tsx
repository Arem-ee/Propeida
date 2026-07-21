'use client'

import { useState } from 'react'
import MarketingHeader from '@/components/marketing-header'
import MarketingFooter from '@/components/marketing-footer'
import { submitContactForm } from '@/lib/actions/contact'
import { Check, Send } from 'lucide-react'

export default function ContactPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSending(true)

    try {
      await submitContactForm({ email, message })
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-white text-gray-900 antialiased">
        <MarketingHeader />
        <main className="mx-auto max-w-3xl px-4 py-20 sm:py-24 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-green-50 text-green-600 border border-green-100 mb-6">
            <Check className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Message sent</h1>
          <p className="mt-3 text-base text-gray-500 max-w-sm mx-auto leading-relaxed">
            Thanks for reaching out. The team will respond as soon as possible.
          </p>
        </main>
        <MarketingFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      <MarketingHeader />
      <main className="mx-auto max-w-3xl px-4 py-20 sm:py-24">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Contact</h1>
        <p className="mt-4 text-lg text-gray-500 leading-relaxed">
          Send a message to the team, or email us directly at{' '}
          <a href="mailto:prepIQ.help@gmail.com" className="text-blue-600 hover:text-blue-700 font-semibold">
            prepIQ.help@gmail.com
          </a>. All submissions are read and responded to.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 max-w-lg">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 mb-6 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          <div className="mb-5">
            <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Your email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none min-h-[44px]"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="message" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Message
            </label>
            <textarea
              id="message"
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What would you like to tell us?"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none min-h-[120px] resize-y"
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 min-h-[44px] cursor-pointer"
          >
            <Send className="h-4 w-4" />
            {sending ? 'Sending...' : 'Send message'}
          </button>
        </form>
      </main>
      <MarketingFooter />
    </div>
  )
}
