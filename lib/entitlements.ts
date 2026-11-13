import { createClient } from './supabase/server'
import { hasCampaignAccess } from './campaign'

type Product =
  | 'jamb_pro'
  | 'jamb_pro_yearly'
  | 'jamb_lifetime'
  | 'jamb_premium_ai'
  | 'putme_pro'
  | 'putme_pro_yearly'

interface EntitlementStatus {
  status: string
  expires_at: string | null
}

const PRODUCT_JAMB: Product[] = [
  'jamb_pro',
  'jamb_pro_yearly',
  'jamb_lifetime',
  'jamb_premium_ai',
]

const PRODUCT_PUTME: Product[] = [
  'putme_pro',
  'putme_pro_yearly',
]

function isActive(entitlement: EntitlementStatus): boolean {
  if (entitlement.status !== 'active') return false
  if (entitlement.expires_at && new Date(entitlement.expires_at) <= new Date()) return false
  return true
}

export async function getEntitlement(userId: string, product: Product): Promise<{ source: string | null; expires_at: string | null } | null> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('entitlements')
    .select('source, status, expires_at')
    .eq('user_id', userId)
    .eq('product', product)
    .single()

  if (!data || !isActive(data)) return null
  return { source: data.source, expires_at: data.expires_at }
}

export async function hasExamAccess(userId: string, examId: string): Promise<boolean> {
  const supabase = await createClient()

  // Temporary 24h campaign entitlement: grants full question-bank access to
  // every exam. expires_at/ends_at arithmetic lives in the DB RPC, so this
  // automatically stops being true once the window closes.
  if (await hasCampaignAccess()) return true

  const { data: exam } = await supabase
    .from('exams')
    .select('school_id')
    .eq('id', examId)
    .single()

  if (!exam) return false

  const isNational = exam.school_id === null

  const { data: entitlements } = await supabase
    .from('entitlements')
    .select('product, status, expires_at')
    .eq('user_id', userId)

  if (!entitlements) return false

  if (isNational) {
    return entitlements.some((e) => PRODUCT_JAMB.includes(e.product as Product) && isActive(e))
  }

  return entitlements.some((e) => PRODUCT_PUTME.includes(e.product as Product) && isActive(e))
}

export async function getUsageCounters(userId: string, examId: string): Promise<{ free_questions_answered: number; free_mocks_started: number }> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('usage_counters')
    .select('free_questions_answered, free_mocks_started')
    .eq('user_id', userId)
    .eq('exam_id', examId)
    .maybeSingle()

  return {
    free_questions_answered: data?.free_questions_answered ?? 0,
    free_mocks_started: data?.free_mocks_started ?? 0,
  }
}

export async function getFreeMockAttempts(examSlug: string): Promise<number> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('app_config')
    .select('value')
    .eq('key', 'free_mock_attempts')
    .single()

  if (!data) return 1

  const config = data.value as Record<string, number>
  return config[examSlug] ?? config['__default__'] ?? 1
}

export async function getActiveProducts(userId: string): Promise<Product[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('entitlements')
    .select('product, status, expires_at')
    .eq('user_id', userId)

  if (!data) return []

  return data.filter(isActive).map((e) => e.product as Product)
}

export interface ProStatus {
  /** Any active Pro entitlement (any product) or an active campaign. */
  isPro: boolean
  /** Human labels for the active products, e.g. ['PUTME Pro']. */
  labels: string[]
  /** Where the access came from, for honest UI copy. */
  source: 'payment' | 'referral_trial' | 'admin_grant' | 'campaign' | null
  expiresAt: string | null
}

const PRODUCT_LABELS: Record<Product, string> = {
  putme_pro: 'PUTME Pro',
  putme_pro_yearly: 'PUTME Pro (Yearly)',
  jamb_pro: 'JAMB Pro',
  jamb_pro_yearly: 'JAMB Pro (Yearly)',
  jamb_lifetime: 'JAMB All Access',
  jamb_premium_ai: 'JAMB Premium AI',
}

/**
 * One call that answers "is this learner Pro" for the paywall gates.
 * Trial/campaign grants slot in here without changing the gates.
 */
export async function getProStatus(userId: string): Promise<ProStatus> {
  const none: ProStatus = { isPro: false, labels: [], source: null, expiresAt: null }

  const [campaign, supabase] = await Promise.all([
    hasCampaignAccess().catch(() => false),
    createClient(),
  ])

  if (campaign) {
    return { isPro: true, labels: ['Pro'], source: 'campaign', expiresAt: null }
  }

  const { data } = await supabase
    .from('entitlements')
    .select('product, source, expires_at')
    .eq('user_id', userId)
    .eq('status', 'active')

  const rows = (data ?? []).filter((r) =>
    !r.expires_at || new Date(r.expires_at) > new Date(),
  )
  if (rows.length === 0) return none

  const latest = [...rows].sort((a, b) =>
    (b.expires_at ?? '9999-12-31').localeCompare(a.expires_at ?? '9999-12-31'),
  )[0]
  const first = rows[0]

  // Trials read as what they are: a trial, not a purchase.
  if (rows.every((r) => r.source === 'referral_trial')) {
    return {
      isPro: true,
      labels: ['Trial'],
      source: 'referral_trial',
      expiresAt: latest?.expires_at ?? null,
    }
  }

  const labels = [...new Set(rows.map((r) => PRODUCT_LABELS[r.product as Product] ?? r.product))]

  return {
    isPro: true,
    labels,
    source: (first?.source ?? null) as ProStatus['source'],
    expiresAt: latest?.expires_at ?? null,
  }
}
