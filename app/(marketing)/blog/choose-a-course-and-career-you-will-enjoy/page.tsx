import type { Metadata } from 'next'
import Link from 'next/link'
import MarketingArticle, { ArticleBody } from '@/components/marketing-article'
import { getArticle } from '@/lib/blog'

const article = getArticle('choose-a-course-and-career-you-will-enjoy')!

export const metadata: Metadata = {
  title: 'Choose a course and career you will enjoy',
  alternates: { canonical: '/blog/choose-a-course-and-career-you-will-enjoy' },
  description: article.description,
  openGraph: {
    title: 'Choose a course and career you will enjoy',
    description: article.description,
    url: '/blog/choose-a-course-and-career-you-will-enjoy',
    type: 'article',
    publishedTime: article.publishedAt,
    images: [{ url: article.image, width: 900, height: 600, alt: article.imageAlt }],
  },
}

export default function ChooseACourseAndCareerPage() {
  return (
    <MarketingArticle article={article}>
      <ArticleBody>
        <p>
          Choosing a course is usually treated as a single decision made at the end of secondary
          school, after which you simply live with it. It is more useful to think of it as three
          decisions, made in order, each one narrowing the next.
        </p>
        <p>
          The first is what you are <strong>eligible</strong> for. The second is what you are{' '}
          <strong>good at</strong>. The third is what the world will <strong>pay you for</strong>.
          Students who apply all three filters at once usually end up with a course they can live
          with, but not one they will enjoy.
        </p>

        <h2>Filter one: what your JAMB subjects actually allow</h2>
        <p>
          This is the constraint most students discover too late. Many courses in Nigerian
          universities have a fixed subject requirement. Medicine, law, engineering, pharmacy and
          the pure sciences at most institutions typically require Mathematics, plus Chemistry and
          Physics or Biology depending on the course. Some faculties restrict the combinations
          further, and a handful of institutions accept only science subjects for their science
          programmes.
        </p>
        <p>
          You do not have to memorise a table. But you should, before you commit to a course, check
          the official requirements of the specific universities you are aiming at. They are
          published, they change, and the differences between institutions are larger than students
          expect. A course you have heard of is a poor proxy for a course you can actually apply for.
        </p>
        <p>
          This is why the subject combination decision is the earliest one. It is nearly
          irreversible: you register for JAMB with four subjects, and the combination you pick
          determines which of the courses above are still on the table.
        </p>

        <h2>Filter two: what you are actually good at</h2>
        <p>
          Interests change. Aptitudes are more stable, and they are also easier to measure. Most
          students have never been told how to find out what they are good at, so they guess from
          the only evidence they have, which is a single school subject score.
        </p>
        <p>
          Three practical ways to get better evidence than that:
        </p>
        <ul>
          <li>
            <strong>Do the actual work, briefly.</strong> You do not need a career to test a
            career. Write a page of code. Solve a chemistry problem set without help. Draft an
            essay argument. Write a small business plan. Two hours of the real thing tells you more
            than a year of imagining it.
          </li>
          <li>
            <strong>Notice what you explain well.</strong> When a topic excites you, do you find
            yourself explaining it to someone else? Teaching something is the fastest way to find
            out whether you understand it, and whether you enjoy understanding it.
          </li>
          <li>
            <strong>Ask people who are doing it.</strong> Not only what it is like, but what they
            would choose again and what they would change. Students who are two years into a
            course are more useful to talk to than lecturers.
          </li>
        </ul>

        <h2>Filter three: what the work actually is</h2>
        <p>
          A course name is a label, not a job description. &ldquo;Computer science&rdquo; could mean
          building systems that people rely on, or debugging a company&rsquo;s legacy database. Both
          are real jobs, and they suit very different people. Before choosing, find out what the
          day-to-day actually looks like.
        </p>
        <p>
          For every course you are considering, try to answer these:
        </p>
        <ul>
          <li>What would a typical working day involve, hour by hour?</li>
          <li>Where do people in this field end up working, and in what roles?</li>
          <li>What does the first two years after graduation actually look like?</li>
          <li>What is the honest entry-level situation, including for people who did not attend the
          best school?</li>
        </ul>
        <p>
          A degree is the entry ticket, not the destination. Knowing where the ticket gets you
          helps you decide whether the journey is worth it.
        </p>

        <h2>Check the cost honestly</h2>
        <p>
          Fees, accommodation, feeding, transport, and the cost of a year you might need to repeat
          are all real. So is the income forgone during the years you are studying. A course that
          seems more expensive on paper can be the cheaper option if it takes you to a sector that
          employs people faster.
        </p>
        <p>
          Ask about the total cost of the degree, not the tuition alone, and ask what happens if
          you need an extra year. Uncertainty is normal, and a plan that survives one bad year is
          worth more than an optimistic one that does not.
        </p>

        <h2>Remember there is more than one route</h2>
        <p>
          JAMB is the best-known route into Nigerian university, and it is not the only one.
          Polytechnics, Colleges of Education, Innovation hubs, professional training and direct
          entry into the labour market all exist. A JAMB score is not a verdict on your life, and
          if the course you want requires a subject combination you did not take, that is a
          solvable problem rather than a closed door.
        </p>
        <p>
          If you are still working out which subjects to register, work through{' '}
          <Link href="/blog/how-to-study-smarter-for-jamb">
            how to study smarter for JAMB
          </Link>{' '}
          to get your preparation right first, and{' '}
          <Link href="/blog/build-a-calm-effective-exam-routine">
            build a calm, effective exam routine
          </Link>{' '}
          so the routine holds when the pressure arrives.
        </p>
      </ArticleBody>
    </MarketingArticle>
  )
}
