const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://propeida.online'

export function HomeJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Propeida',
    url: baseUrl,
      description:
        'Verified exam preparation for every Nigerian candidate. Practice JAMB and Post-UTME questions with a real CBT simulator, explanations, and performance tracking.',
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
      'Practicing is free — questions, explanations, streaks, leaderboards, and your performance history — no card required. An optional Pro upgrade unlocks unlimited mock exams and extra features for students who want more.',
  },
  {
    question: 'How does Propeida make money?',
    answer:
      'Propeida is funded by schools, tutorial centers, foundations, alumni associations, and sponsors, who pay to widen access and track real impact. We also offer an optional Pro upgrade for students who want more.',
  },
  {
    question: 'Is the JAMB question bank ready?',
    answer:
      'Not yet. Just like our Post-UTME material, every question is checked by a person before it is published. Almost ready — when it arrives, students will be able to start with it the same way: free to practise, with optional upgrades.',
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
