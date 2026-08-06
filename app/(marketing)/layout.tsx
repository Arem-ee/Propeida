import MarketingAnalyticsMount from '@/components/marketing-analytics-mount'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <MarketingAnalyticsMount />
    </>
  )
}
