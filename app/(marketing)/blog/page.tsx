import type { Metadata } from 'next'
import { ArticleIndex } from '@/components/marketing-article'

export const metadata: Metadata = {
  title: 'Guides',
  alternates: { canonical: '/blog' },
  description:
    'Practical guides for your JAMB and Post-UTME preparation, with study methods that work, exam routines that hold up, and advice on how to choose a course and career',
  openGraph: {
    title: 'Practical guides for JAMB and Post-UTME',
    description:
      'Practical guides for your JAMB and Post-UTME preparation, with study methods that work, exam routines that hold up, and advice on how to choose a course and career',
    url: '/blog',
    type: 'website',
  },
}

export default function BlogIndexPage() {
  return <ArticleIndex />
}
