const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://propeida.online'

export function HomeJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Propeida',
    url: baseUrl,
      description:
        'Free exam preparation for every Nigerian candidate. Timed mock exams, verified questions, revision notes, and performance tracking for JAMB and Post-UTME.',
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
    question: 'Is Propeida free?',
    answer:
      'Yes, to practice. Questions, explanations, streaks, leaderboards and your history cost nothing, and no card is required. An optional Pro upgrade removes limits for students who want more.',
  },
  {
    question: 'Which universities are available?',
    answer:
      'The University of Ilorin Post-UTME is live today, with JAMB practice close behind. Every question bank is checked by hand before it is published.',
  },
  {
    question: 'Are the questions verified?',
    answer:
      'They start as recollections from past candidates, then are checked and reworked by hand. They are not official past questions, and Propeida is not affiliated with the University of Ilorin, JAMB, or any examination body.',
  },
  {
    question: 'Can I use it on my phone?',
    answer:
      'Yes. Propeida is text-first and light, so a full mock exam uses very little data. It works on Chrome, Samsung Internet, Opera and Safari on budget Android phones.',
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
