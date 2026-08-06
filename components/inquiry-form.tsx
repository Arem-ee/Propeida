'use client'

import { useState } from 'react'
import { Check, Send } from 'lucide-react'
import { submitInquiry, type InquiryType } from '@/lib/actions/inquiries'

interface InquiryFormProps {
  type: InquiryType
  title: string
  description: string
  organizationLabel: string
  organizationPlaceholder: string
  messagePlaceholder: string
  ctaLabel?: string
  compact?: boolean
}

export default function InquiryForm({
  type,
  title,
  description,
  organizationLabel,
  organizationPlaceholder,
  messagePlaceholder,
  ctaLabel = 'Send message',
  compact = false,
}: InquiryFormProps) {
  const [email, setEmail] = useState('')
  const [organization, setOrganization] = useState('')
  const [message, setMessage] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSending(true)

    try {
      await submitInquiry({ type, email, organization, message, honeypot })
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-green-100 bg-green-50 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-green-600 text-white mb-4">
          <Check className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Message sent</h3>
        <p className="mt-2 text-sm text-gray-600">
          Thanks for reaching out. The team will respond as soon as possible.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-100 bg-white p-6 sm:p-8 shadow-xs">
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 leading-relaxed">{description}</p>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor={`${type}-email`} className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Your email
          </label>
          <input
            id={`${type}-email`}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none min-h-[44px]"
          />
        </div>

        <div>
          <label htmlFor={`${type}-org`} className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            {organizationLabel}
          </label>
          <input
            id={`${type}-org`}
            type="text"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder={organizationPlaceholder}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none min-h-[44px]"
          />
        </div>

        <div className={compact ? 'hidden' : ''}>
          <label htmlFor={`${type}-msg`} className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Message
          </label>
          <textarea
            id={`${type}-msg`}
            required
            rows={compact ? 3 : 5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={messagePlaceholder}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none min-h-[96px] resize-y"
          />
        </div>

        <input
          type="text"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 min-h-[44px] cursor-pointer"
        >
          <Send className="h-4 w-4" />
          {sending ? 'Sending...' : ctaLabel}
        </button>
      </div>
    </form>
  )
}