'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { checkRateLimit, rateLimitKey } from '@/lib/rate-limit'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_EMAIL_LENGTH = 254
const MAX_MESSAGE_LENGTH = 2000
const MIN_MESSAGE_LENGTH = 10

function validateEmail(email: string): string | null {
  if (!email || typeof email !== 'string') return 'Email is required'
  if (email.length > MAX_EMAIL_LENGTH) return 'Email is too long'
  if (!EMAIL_REGEX.test(email)) return 'Invalid email address'
  return null
}

function validateMessage(message: string): string | null {
  if (!message || typeof message !== 'string') return 'Message is required'
  if (message.length < MIN_MESSAGE_LENGTH) return 'Message must be at least 10 characters'
  if (message.length > MAX_MESSAGE_LENGTH) return 'Message is too long'
  return null
}

export async function submitContactForm(data: { email: string; message: string; honeypot?: string }) {
  if (data.honeypot) {
    return { success: true }
  }

  const emailError = validateEmail(data.email)
  if (emailError) throw new Error(emailError)

  const messageError = validateMessage(data.message)
  if (messageError) throw new Error(messageError)

  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? 'unknown'
  const { allowed } = checkRateLimit(rateLimitKey(ip, 'contact'), 3, 60000)
  if (!allowed) throw new Error('Too many requests. Please try again later.')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('contact_submissions')
    .insert({
      user_id: user?.id ?? null,
      email: data.email,
      message: data.message,
    })

  if (error) {
    throw new Error('Failed to send message. Please try again.')
  }

  return { success: true }
}
