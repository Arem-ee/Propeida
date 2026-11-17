import { createRemoteJWKSet, jwtVerify } from 'jose'

/**
 * Local verification of a Supabase access token (ES256 against the project
 * JWKS). The token is checked without a round trip to the auth server,
 * which is the difference between one network call per tap and none.
 *
 * This is deliberately NOT a security boundary by itself: ownership and
 * authorization are enforced in plpgsql (`auth.uid()` on both
 * record_session_answer and the reveal RPCs) and by RLS. This check exists
 * to identify the caller fast; failure means "fall back to the server call",
 * never "deny" — callers decide.
 */

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null

export function getProjectJwksUrl(): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  return `${base.replace(/\/+$/, '')}/auth/v1/.well-known/jwks.json`
}

function getJwks() {
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(getProjectJwksUrl()))
  }
  return jwks
}

/**
 * Verify a Supabase access token locally. Returns the subject (user id)
 * when the signature and expiry are valid, null otherwise. Never throws.
 */
export async function verifyAccessToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getJwks())
    return typeof payload.sub === 'string' ? payload.sub : null
  } catch {
    return null
  }
}
