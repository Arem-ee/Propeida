'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { submitContactForm } from '@/lib/actions/contact'
import { Check, Send } from 'lucide-react'

export default function SupportPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setEmail(user.email)
    })
  }, [])

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
      <div className="mx-auto max-w-lg text-center py-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-green-50 text-green-600 border border-green-100 mb-6">
          <Check className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">Message sent</h1>
        <p className="mt-3 text-base text-gray-500 leading-relaxed">
          Thanks for reaching out. The team will respond as soon as possible.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Contact & Support</h1>
      <p className="text-sm text-gray-500 mb-8">
        Send a message to the team, or email us directly at{' '}
        <a href="mailto:prepIQ.help@gmail.com" className="text-blue-600 hover:text-blue-700 font-semibold">
          prepIQ.help@gmail.com
        </a>.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Your email
          </label>
          <input
            type="email"
            value={email}
            readOnly
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Message
          </label>
          <textarea
            id="message"
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="How can we help you?"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none min-h-[120px] resize-y"
          />
        </div>

        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:bg-blue-400 min-h-[44px] cursor-pointer"
        >
          <Send className="h-4 w-4" />
          {sending ? 'Sending...' : 'Send message'}
        </button>
      </form>
    </div>
  )
}
