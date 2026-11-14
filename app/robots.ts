import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site-url'

const baseUrl = siteUrl()

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/home/', '/account/', '/admin/', '/practice/session/', '/mocks/session/', '/results/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
