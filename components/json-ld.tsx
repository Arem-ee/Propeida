const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://propeida.vercel.app'

export function HomeJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Propeida',
    url: baseUrl,
    description:
      'Practice UNILORIN Post-UTME, JAMB, and WAEC past questions with interactive CBT mock exams, topic drills, and performance analytics built for Nigerian students.',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'NGN',
    },
    audience: {
      '@type': 'EducationalAudience',
      educationalRole: 'Student',
    },
    about: {
      '@type': 'Thing',
      name: 'UNILORIN Post-UTME preparation',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
