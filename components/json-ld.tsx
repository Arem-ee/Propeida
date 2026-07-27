const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://propeida.vercel.app'

export function HomeJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Propeida',
    url: baseUrl,
      description:
        'Practice JAMB and Post-UTME past questions with interactive CBT mock exams, topic drills, and performance analytics built for Nigerian students.',
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
