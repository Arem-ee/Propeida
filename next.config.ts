import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      // Removed surfaces (UI wipe): no dead routes, no old UI. The homepage
      // is the React landing (app/page.tsx), not the legacy static file.
      { source: '/explore/:path*', destination: '/', permanent: false },
      { source: '/dashboard/:path*', destination: '/', permanent: false },
      { source: '/practice/:path*', destination: '/', permanent: false },
      { source: '/history', destination: '/', permanent: false },
      { source: '/results/:path*', destination: '/', permanent: false },
      { source: '/account/:path*', destination: '/', permanent: false },
      { source: '/settings', destination: '/', permanent: false },
      { source: '/support', destination: '/pricing', permanent: true },
      { source: '/support/callback', destination: '/pricing', permanent: true },
      { source: '/funding', destination: '/pricing', permanent: true },
      { source: '/partner', destination: '/pricing', permanent: true },
      { source: '/sponsor', destination: '/pricing', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://api.paystack.co https://*.supabase.co https://*.google-analytics.com https://www.googletagmanager.com; frame-src https://standard.paystack.co; base-uri 'self'; form-action 'self'" },
        ],
      },
    ]
  },
}

export default nextConfig
