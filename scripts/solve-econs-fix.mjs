// Repair the two misattributed explanations from solve-econs1, then stop.
// f71bc6f6 (cartel) got a paper-type explanation; 77b8b301 (fragment stem)
// got a population-growth explanation it cannot support.
// Usage: node --env-file=.env scripts/solve-econs-fix.mjs

import { createClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) {
  console.error('Missing Supabase env vars')
  process.exit(1)
}
const db = createClient(URL, KEY)

const CARTEL = 'f71bc6f6-ea7a-4ec6-81d2-efd1cb422a6d'
const FRAG = '77b8b301-2e6c-4f43-a607-3fd8f5e0086a'

// Pre-flight: both ids must exist with the expected stems, else abort.
const { data: rows } = await db.from('questions').select('id, question_text').in('id', [CARTEL, FRAG])
const byId = new Map((rows ?? []).map((r) => [r.id, r.question_text]))
if (!byId.get(CARTEL)?.startsWith('An agreement among firms')) {
  throw new Error(`pre-flight failed for cartel row: ${byId.get(CARTEL)}`)
}
if (!byId.get(FRAG)?.startsWith('in an economy is determined')) {
  throw new Error(`pre-flight failed for fragment row: ${byId.get(FRAG)}`)
}

{
  const { error } = await db
    .from('questions')
    .update({
      explanation:
        'A cartel is a formal agreement among firms to fix prices and share markets — stronger and more organised than mere collusion.',
    })
    .eq('id', CARTEL)
  if (error) throw error
}

{
  const { error } = await db
    .from('questions')
    .update({
      explanation: '',
      review_note:
        'AI-solving: stem is a fragment and no reconstruction is certain — rescue by hand from source or reject.',
    })
    .eq('id', FRAG)
  if (error) throw error
}

console.log('fixed 2 rows')
