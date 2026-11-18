/**
 * WebSite + Organization structured data.
 *
 * Google reads this to render the site name and logo in search results
 * instead of falling back to the platform host (e.g. "Vercel"). Keep it in
 * sync with the canonical origin; never invent social profiles.
 */
export default function SiteJsonLd({ siteUrl }: { siteUrl: string }) {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Propeida',
      alternateName: ['propeida', 'propeida.online'],
      url: siteUrl,
      publisher: { '@id': `${siteUrl}/#organization` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'Propeida',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
        width: 640,
        height: 640,
      },
      description:
        'Free JAMB past questions and Post-UTME past questions with a real CBT simulator, timed mock exams, step-by-step explanations, and progress tracking',
    },
  ]

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
      }}
    />
  )
}
