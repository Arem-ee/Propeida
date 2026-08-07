import MarketingAnalyticsMount from '@/components/marketing-analytics-mount'
import SupportOverlay from '@/components/support-overlay'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <MarketingAnalyticsMount />
      <SupportOverlay />
    </>
  )
}
