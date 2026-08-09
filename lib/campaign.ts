import { createClient } from './supabase/server'

export interface CampaignStatus {
  hasAccess: boolean
  expiresAt: string | null
  campaignSlug: string | null
  campaignName: string | null
  recentlyExpired: boolean
}

export async function getCampaignStatus(): Promise<CampaignStatus> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_campaign_status')

  if (error) {
    return { hasAccess: false, expiresAt: null, campaignSlug: null, campaignName: null, recentlyExpired: false }
  }

  const row = Array.isArray(data) ? data[0] : null
  return {
    hasAccess: row?.has_access ?? false,
    expiresAt: row?.expires_at ?? null,
    campaignSlug: row?.campaign_slug ?? null,
    campaignName: row?.campaign_name ?? null,
    recentlyExpired: row?.recently_expired ?? false,
  }
}

export async function hasCampaignAccess(): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('has_campaign_access')

  if (error) return false
  return data === true
}