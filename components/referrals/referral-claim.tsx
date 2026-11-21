'use client'

import { useEffect } from 'react'
import { claimReferral } from '@/lib/actions/referral'

// Failures that should clear the stored code permanently; everything else
// (network error, rate limit, session not ready yet) keeps the code so the
// next visit retries.
const PERMANENT_FAILURES = [
  'Already referred by someone',
  'Invalid referral code',
  'You cannot use your own referral code',
  'This referral has already been claimed',
  'Profile not found',
]

/**
 * Closes the gap where Google OAuth and email-confirmation signups never
 * pass through the login-page claim handler, so their `pending_ref` stayed
 * in localStorage forever.
 *
 * Mount on every `(app)` page and onboarding: it runs once on mount, claims
 * the stored code silently, and clears the key on success or permanent
 * failure. Transient failures retry on the next visit.
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
        // Transient failures: keep the key; the next page mount will retry
      }
    })()
  }, [])

  return null
}