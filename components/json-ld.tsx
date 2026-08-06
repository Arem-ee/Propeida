const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://propeida.vercel.app'

export function HomeJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Propeida',
    url: baseUrl,
      description:
        'Free, verified exam preparation for every Nigerian candidate. Practice JAMB and Post-UTME questions with a real CBT simulator, explanations, and performance tracking. Free for students.',
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
        name: 'Exam preparation for Nigerian students',
      },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
