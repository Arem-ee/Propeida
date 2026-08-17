import { createClient } from '@supabase/supabase-js'

let cached: ReturnType<typeof createClient> | null = null

export function getPublicClient() {
  if (!cached) {
    cached = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    )
  }
  return cached
}