interface FaqItem {
  question: string
  answer: string
}

export default function FaqJsonLd({ items }: { items: FaqItem[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
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
      // JSON.stringify alone leaves "<\\/script>" intact; escape "<" so the
      // payload can never break out of the script element.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
    />
  )
}
