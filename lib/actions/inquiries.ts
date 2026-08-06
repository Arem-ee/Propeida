'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { checkRateLimit, rateLimitKey } from '@/lib/rate-limit'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_MESSAGE_LENGTH = 2000
const MIN_MESSAGE_LENGTH = 10

export type InquiryType = 'school' | 'sponsor' | 'funding' | 'school-request'

const TYPE_LABELS: Record<InquiryType, string> = {
  school: 'School / Tutorial Centre Partner',
  sponsor: 'Sponsorship / Foundation',
  funding: 'Funding / Partnership',
  'school-request': 'University Request',
}

function validateEmail(email: string): string | null {
  if (!email || typeof email !== 'string') return 'Email is required'
  if (email.length > 254) return 'Email is too long'
  if (!EMAIL_REGEX.test(email)) return 'Invalid email address'
  return null
}

function validateMessage(message: string): string | null {
  if (!message || typeof message !== 'string') return 'Message is required'
  if (message.length < MIN_MESSAGE_LENGTH) return 'Message must be at least 10 characters'
  if (message.length > MAX_MESSAGE_LENGTH) return 'Message is too long'
  return null
}

export async function submitInquiry(data: {
  type: InquiryType
  email: string
  organization?: string
  message: string
  honeypot?: string
}) {
  if (data.honeypot) {
    return { success: true }
  }

  const emailError = validateEmail(data.email)
  if (emailError) throw new Error(emailError)

  const combined = [data.organization, data.message].filter(Boolean).join('.\n')
  const messageError = validateMessage(combined)
  if (messageError) {
    if (!data.message) throw new Error(messageError)
  }

  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? 'unknown'
  const { allowed } = checkRateLimit(rateLimitKey(ip, data.type), 3, 60000)
  if (!allowed) throw new Error('Too many requests. Please try again later.')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const parts: string[] = [`[${TYPE_LABELS[data.type] ?? data.type}]`]
  if (data.organization) parts.push(data.organization)
  parts.push(data.message)

  const { error } = await supabase
    .from('contact_submissions')
    .insert({
      user_id: user?.id ?? null,
      email: data.email,
      message: parts.join(' — '),
    })

  if (error) {
    throw new Error('Failed to send. Please try again.')
  }

  return { success: true }
}