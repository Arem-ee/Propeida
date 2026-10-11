import { createServerClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'
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
          cookiesToSet.forEach(({ name, value }) => {
            cookieStore.set(name, value)
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
