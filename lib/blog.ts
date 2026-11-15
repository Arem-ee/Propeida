export type Article = {
  slug: string
  title: string
  excerpt: string
  description: string
  image: string
  imageAlt: string
  publishedAt: string
  publishedLabel: string
}

export const articles: Article[] = [
  {
    slug: 'how-to-study-smarter-for-jamb',
    title: 'How to study smarter for JAMB',
    excerpt: 'Simple, practical ways to make every study session count.',
    description:
      'How to study smarter for JAMB: active recall, spaced study sessions, timed CBT practice and an error log that turns every wrong answer into marks.',
    image: '/landing/assets/blog-1.png',
    imageAlt: 'A young Nigerian studying with open textbooks and a digital tablet',
    publishedAt: '2026-10-21',
    publishedLabel: '21 October 2026',
  },
  {
    slug: 'build-a-calm-effective-exam-routine',
    title: 'Build a calm, effective exam routine',
    excerpt: 'A focused plan can make preparation feel much more manageable.',
    description:
      'Build a calm, effective exam routine: a weekly template, fixed anchor points, realistic focus blocks and recovery habits that hold up in exam week.',
    image: '/landing/assets/blog-2.png',
    imageAlt: 'A young Nigerian organising an exam timetable and checklist',
    publishedAt: '2026-10-21',
    publishedLabel: '21 October 2026',
  },
  {
    slug: 'choose-a-course-and-career-you-will-enjoy',
    title: 'Choose a course and career you will enjoy',
    excerpt: 'Start exploring the paths that match your strengths and ambitions.',
    description:
      'Choosing a course in Nigeria: how JAMB subject combinations affect eligibility, the three filters for a good course choice, and how to research a course before you commit.',
    image: '/landing/assets/blog-3.png',
    imageAlt: 'Two young Nigerians collaborating around an interactive formula screen',
    publishedAt: '2026-10-21',
    publishedLabel: '21 October 2026',
  },
]

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug)
}

export function getRelatedArticles(slug: string, limit = 2): Article[] {
  return articles.filter((a) => a.slug !== slug).slice(0, limit)
}
