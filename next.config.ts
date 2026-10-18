import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV === 'development'
const scriptSrc = `'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://js.paystack.co https://www.googletagmanager.com`

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/', destination: '/landing/index.html' },
      ],
    }
  },
  async redirects() {
    return [
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
          { key: 'Content-Security-Policy', value: `default-src 'self'; script-src ${scriptSrc}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://api.paystack.co https://*.supabase.co https://*.google-analytics.com https://www.googletagmanager.com; frame-src https://standard.paystack.co; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'` },
        ],
      },
    ]
  },
}

export default nextConfig
