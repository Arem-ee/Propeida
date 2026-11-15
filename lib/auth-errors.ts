/**
 * Turns Supabase's technical auth errors into one-to-one copy that fits the
 * rest of the app: a subject, a verb, and a clear next step. Never show the
 * raw provider message in the auth card.
 */
export function friendlyAuthError(message: string, mode: 'login' | 'signup' = 'login'): string {
  const text = message.toLowerCase()

  if (text.includes('invalid login credentials') || text.includes('invalid email or password')) {
    return 'We could not find an account with that email and password, so check them and try again'
  }
  if (text.includes('email not confirmed')) {
    return 'You need to confirm your email first, so check your inbox for the link we sent'
  }
  if (text.includes('user already registered')) {
    return 'An account with that email already exists, so sign in instead'
  }
  if (text.includes('password should be at least')) {
    return 'Your password needs at least 6 characters'
  }
  if (text.includes('signups not allowed')) {
    return 'We are not taking new sign-ups right now'
  }
  if (text.includes('rate limit') || text.includes('too many') || text.includes('security purposes')) {
    return 'You have tried too many times, so wait a minute and try again'
  }
  if (text.includes('email address is invalid') || text.includes('unable to validate email')) {
    return 'That email address does not look right, so check it and try again'
  }
  if (text.includes('token has expired') || text.includes('link has expired')) {
    return 'That link has expired, so request a new one'
  }
  if (text.includes('error sending') || text.includes('failed to send')) {
    return 'We could not send the email, so try again in a moment'
  }
  if (text.includes('auth session missing')) {
    return 'Your session has expired, so sign in again'
  }
  if (text.includes('failed to fetch') || text.includes('network')) {
    return 'We could not reach the server, so check your connection and try again'
  }

  return mode === 'signup'
    ? 'We could not create your account, so try again in a moment'
    : 'We could not sign you in, so try again in a moment'
}
