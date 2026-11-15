'use client'

import { useEffect, useState } from 'react'
import { Mail, MessageCircle, X, Copy, Check, ExternalLink } from 'lucide-react'
import { AdminTable, THead, Th, TBody, Td } from './table'

export interface ContactMessage {
  id: string
  full_name: string | null
  email: string
  phone: string | null
  organization_type: string | null
  student_count: number | null
  requested_university: string | null
  requested_course: string | null
  message: string | null
  created_at: string
}

function firstName(fullName: string | null) {
  const first = (fullName ?? '').trim().split(/\s+/)[0]
  return first || 'there'
}

/** wa.me needs digits only, in international format. Nigerian local numbers start with 0. */
function waLink(phone: string) {
  let digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0')) digits = '234' + digits.slice(1)
  return `https://wa.me/${digits}`
}

function mailto(message: ContactMessage) {
  const subject = 'Re: your enquiry to Propeida'
  const body = `Hi ${firstName(message.full_name)},\n\n`
  return `mailto:${message.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export default function ContactInbox({ rows }: { rows: ContactMessage[] }) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const open = rows.find((r) => r.id === openId) ?? null

  // Escape closes the detail panel from anywhere on the page
  useEffect(() => {
    if (!openId) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenId(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [openId])

  const copyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable — the address is visible on screen */
    }
  }

  return (
    <>
      <AdminTable>
        <THead>
          <tr>
            <Th>Name</Th>
            <Th>Email / Phone</Th>
            <Th>Organization</Th>
            <Th>Type / Students</Th>
            <Th>Requested University</Th>
            <Th>Submitted</Th>
            <Th className="text-right">Action</Th>
          </tr>
        </THead>
        <TBody>
          {rows.map((s) => (
            <tr key={s.id} className="cursor-pointer hover:bg-blue-50/30" onClick={() => setOpenId(s.id)}>
              <Td className="whitespace-nowrap font-bold text-black">{s.full_name ?? '—'}</Td>
              <Td className="whitespace-nowrap">
                <div>{s.email}</div>
                {s.phone ? <div className="text-xs text-ink-soft/70">{s.phone}</div> : null}
              </Td>
              <Td className="whitespace-nowrap capitalize">
                {s.organization_type ? s.organization_type.replaceAll('_', ' ') : '—'}
              </Td>
              <Td className="whitespace-nowrap tabular-nums">
                {s.student_count != null
                  ? `${s.student_count} student${s.student_count === 1 ? '' : 's'}`
                  : '—'}
              </Td>
              <Td className="whitespace-nowrap font-semibold text-black">
                {s.requested_university ?? '—'}
                {s.requested_course ? (
                  <div className="text-xs font-normal text-ink-soft">{s.requested_course}</div>
                ) : null}
              </Td>
              <Td className="whitespace-nowrap text-xs">
                {new Date(s.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Td>
              <Td className="text-right">
                <button
                  onClick={(e) => { e.stopPropagation(); setOpenId(s.id) }}
                  className="inline-flex min-h-[36px] cursor-pointer items-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-800 hover:bg-blue-100"
                >
                  Read & reply
                </button>
              </Td>
            </tr>
          ))}
        </TBody>
      </AdminTable>

      {/* Detail + reply panel */}
      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6"
          role="presentation"
        >
          <button
            type="button"
            aria-label="Close message"
            className="absolute inset-0 cursor-default bg-black/45"
            onClick={() => setOpenId(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Contact message"
            className="relative flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-2xl border border-blue-100/70 bg-white shadow-2xl sm:rounded-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5">
              <div className="min-w-0">
                <h2 className="font-display text-lg font-medium leading-snug text-black">
                  {open.full_name ?? open.email}
                </h2>
                <p className="mt-0.5 text-xs font-semibold text-ink-soft">
                  {new Date(open.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                  {open.organization_type ? ` · ${open.organization_type.replaceAll('_', ' ')}` : ''}
                  {open.student_count != null ? ` · ${open.student_count} students` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpenId(null)}
                aria-label="Close"
                className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl text-ink-soft hover:bg-gray-100"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="overflow-y-auto p-5">
              {(open.requested_university || open.requested_course) && (
                <div className="mb-4 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-violet-700">University request</p>
                  <p className="mt-1 text-sm font-extrabold text-violet-900">
                    {open.requested_university ?? '—'}
                    {open.requested_course ? <span className="font-semibold text-violet-800"> · {open.requested_course}</span> : null}
                  </p>
                </div>
              )}
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink-soft/70">Their message</p>
              <p className="mt-1.5 whitespace-pre-wrap rounded-xl border border-gray-100 bg-gray-50/60 p-4 text-[13px] font-semibold leading-relaxed text-black">
                {open.message ?? '—'}
              </p>

              <div className="mt-5">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink-soft/70">Reply</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <a
                    href={mailto(open)}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
                  >
                    <Mail className="h-4 w-4" aria-hidden />
                    Reply by email
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                  {open.phone && (
                    <a
                      href={waLink(open.phone)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-5 py-2.5 text-sm font-bold text-emerald-800 hover:bg-emerald-100"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden />
                      WhatsApp
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => void copyEmail(open.email)}
                    className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-ink-soft hover:bg-gray-50"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-600" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
                    {copied ? 'Copied' : 'Copy email'}
                  </button>
                </div>
                <p className="mt-2 text-[11px] font-semibold text-ink-soft/70">
                  Email opens your mail app with the address and a greeting filled in — type the answer and send. Nothing is sent from Propeida itself.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
