import type { Metadata } from 'next'
import { ArticleIndex } from '@/components/marketing-article'

export const metadata: Metadata = {
  title: 'Guides',
  alternates: { canonical: '/blog' },
  description:
    'Practical guides for Nigerian students preparing for JAMB and Post-UTME: study methods that work, exam routines that hold up, and how to choose a course and career.',
  openGraph: {
    title: 'Guides for Nigerian students',
    description:
      'Practical guides for Nigerian students preparing for JAMB and Post-UTME: study methods that work, exam routines that hold up, and how to choose a course and career.',
    url: '/blog',
    type: 'website',
  },
}

export default function BlogIndexPage() {
  return <ArticleIndex />
}
