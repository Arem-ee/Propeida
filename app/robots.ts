import type { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://propeida.online'

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
