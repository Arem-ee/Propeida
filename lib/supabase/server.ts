import { createServerClient } from '@supabase/ssr'
import { type User } from '@supabase/supabase-js'
import { cache } from 'react'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Preserve the attributes Supabase hands us (maxAge, sameSite,
            // path); dropping them turns refreshed tokens into
            // browser-session cookies that vanish on close.
            cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
          })
        },
      },
    }
  )
}

export async function getAuthUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<User | null> {
  // getUser() verifies the JWT with the Supabase Auth server on every call.
  // Never use getSession() here: it only decodes cookies locally and would
  // accept a forged or revoked session.
  const { data } = await supabase.auth.getUser()
  return data.user
}

/**
 * Request-scoped verified user. React `cache()` dedupes the auth-server
 * round trip inside one render pass, so the layout, page and data loaders
 * each asking for the current user costs one call, not three. Server
 * actions are separate requests and call createClient() directly instead.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  return data.user
})
