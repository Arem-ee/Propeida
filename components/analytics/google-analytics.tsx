'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export default function GoogleAnalytics() {
  const pathname = usePathname()
  const initialized = useRef(false)

  useEffect(() => {
    if (!MEASUREMENT_ID) return
    if (!initialized.current) {
      initialized.current = true
      return
    }
    if (typeof window.gtag === 'function') {
      window.gtag('config', MEASUREMENT_ID, { page_path: pathname })
    } else {
      window.dataLayer = window.dataLayer ?? []
      window.dataLayer.push({ event: 'page_view', page_path: pathname })
    }
  }, [pathname])

  if (!MEASUREMENT_ID) return null

  return (
    <>
      <Script
        id="gtag-js"
        src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${MEASUREMENT_ID}', { page_path: window.location.pathname + window.location.search });
        `}
      </Script>
    </>
  )
}
