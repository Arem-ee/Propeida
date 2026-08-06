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

const FAQ_CONTENT: { question: string; answer: string }[] = [
  {
    question: 'Is Propeida really free?',
    answer:
      'Yes. Practice, full mock exams, explanations, streaks, leaderboards, and your performance history are all free — no trial, no paywall, no credit card. Learning on Propeida is never behind a payment.',
  },
  {
    question: 'How does Propeida make money?',
    answer:
      'Students are never charged. Propeida is funded by schools, tutorial centers, foundations, alumni associations, and sponsors, who pay to widen access and track real impact.',
  },
  {
    question: 'Is the JAMB question bank ready?',
    answer:
      'Not yet. Just like our Post-UTME material, every question is checked by a person before it is published. Almost ready — and when it arrives it will be free, like everything else on Propeida.',
  },
  {
    question: 'What are Post-UTME questions? Are these official past questions?',
    answer:
      'The question bank is built from the recollections of past candidates who sat the University of Ilorin Post-UTME, then checked and reworked by hand. These are not official past questions, and Propeida is not affiliated with the University of Ilorin, JAMB, or any examination body.',
  },
  {
    question: 'Does it work on budget phones and slow networks?',
    answer:
      'Yes. Propeida is built for the network conditions and devices Nigerian students actually use. The platform is text-first, so a full mock exam uses little data.',
  },
]

export function FaqJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_CONTENT.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
