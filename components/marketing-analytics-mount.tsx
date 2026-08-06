'use client'

import { useGlobalAnalytics } from '@/lib/analytics'

export default function MarketingAnalyticsMount() {
  useGlobalAnalytics()
  return null
}