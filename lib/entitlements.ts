import { createClient } from './supabase/server'

type Product = 'jamb_pro' | 'jamb_premium_ai' | 'putme_pro'

interface EntitlementStatus {
  status: string
  expires_at: string | null
}

const PRODUCT_JAMB: Product[] = ['jamb_pro', 'jamb_premium_ai']

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

export async function hasEntitlement(userId: string, product: Product): Promise<boolean> {
  const entry = await getEntitlement(userId, product)
  return entry !== null
}

export async function hasExamAccess(userId: string, examId: string): Promise<boolean> {
  const supabase = await createClient()

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

  return entitlements.some((e) => e.product === 'putme_pro' && isActive(e))
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
