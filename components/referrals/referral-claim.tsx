'use client'

import { useEffect } from 'react'
import { claimReferral } from '@/lib/actions/referral'

// Failures that will never succeed on retry, so the stored code must be
// cleared. Anything else (network error, rate limit, session not ready yet)
// keeps the code so the next visit tries again.
const PERMANENT_FAILURES = [
  'Already referred by someone',
  'Invalid referral code',
  'You cannot use your own referral code',
  'This referral has already been claimed',
  'Profile not found',
]

/**
 * Closes the gap the password-login claim left behind: people who sign up
 * through Google or confirm their email link never pass through the login
 * page handler, so their `pending_ref` stayed in localStorage forever.
 * This mounts on every app page and claims it once, silently.
 */
export function ReferralClaim() {
  useEffect(() => {
    let code: string | null = null
    try {
      code = window.localStorage.getItem('pending_ref')
    } catch {
      return
    }
    if (!code) return

    void (async () => {
      try {
        await claimReferral(code)
        try {
          window.localStorage.removeItem('pending_ref')
        } catch {
          // The claim already succeeded, so a stale key is harmless
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : ''
        const permanent = PERMANENT_FAILURES.some((fragment) => message.includes(fragment))
        if (permanent) {
          try {
            window.localStorage.removeItem('pending_ref')
          } catch {
            // Nothing sensible to do here
          }
        }
      }
    })()
  }, [])

  return null
}
