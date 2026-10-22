import type { Metadata } from 'next'
import Link from 'next/link'
import MarketingArticle, { ArticleBody } from '@/components/marketing-article'
import { getArticle } from '@/lib/blog'

const article = getArticle('build-a-calm-effective-exam-routine')!

export const metadata: Metadata = {
  title: 'Build a calm, effective exam routine',
  alternates: { canonical: '/blog/build-a-calm-effective-exam-routine' },
  description: article.description,
  openGraph: {
    title: 'Build a calm, effective exam routine',
    description: article.description,
    url: '/blog/build-a-calm-effective-exam-routine',
    type: 'article',
    publishedTime: article.publishedAt,
    images: [{ url: article.image, width: 900, height: 600, alt: article.imageAlt }],
  },
}

export default function BuildACalmEffectiveExamRoutinePage() {
  return (
    <MarketingArticle article={article}>
      <ArticleBody>
        <p>
          A lot of exam preparation is not really about the syllabus. It is about the hours
          around it. A student who knows the topics but panics in week one, sleeps badly, and
          cannot decide what to revise on a given evening will underperform a student with a
          slightly weaker grasp of the material but a stable routine.
        </p>
        <p>
          The goal of a routine is not to make you work harder. It is to remove the number of
          decisions you have to make each day, so that the energy you have left goes into the work
          itself.
        </p>

        <h2>Build backwards from the exam date</h2>
        <p>
          Open a calendar and mark the exam day. Now count backwards. You are not trying to fill
          every day with study, which is how routines collapse. You are identifying:
        </p>
        <ul>
          <li>Two weeks before, your last full timed paper should already be done.</li>
          <li>One week before, you should be reviewing, not learning new material.</li>
          <li>The last two days should contain no new topics at all.</li>
        </ul>
        <p>
          Writing this down matters more than it sounds. Most of the anxiety in the final fortnight
          comes from not knowing how much is left, and you cannot know that without a plan.
        </p>

        <h2>Fix three anchors, not ten</h2>
        <p>
          A routine with fifteen fixed points is a routine that breaks. Pick three anchors and let
          everything else move around them:
        </p>
        <ul>
          <li>
            <strong>Wake-up time.</strong> Same time every day, including rest days. It fixes your
            sleep and therefore your study hours.
          </li>
          <li>
            <strong>One study block.</strong> A single block, the same time each day, so it becomes
            automatic rather than decided.
          </li>
          <li>
            <strong>Bedtime.</strong> Set by when you need to be asleep to wake at your anchor, not
            by how much you still feel you have left to do.
          </li>
        </ul>
        <p>
          Everything else in your week is negotiable. These three are not.
        </p>

        <h2>Work in 90-minute blocks, not 8-hour days</h2>
        <p>
          Long sessions produce low-quality work. Around 90 minutes is roughly the limit for
          genuinely focused work on new material, after which attention drops and you start
          re-reading what you have already read.
        </p>
        <p>
          A good block looks like this: five minutes deciding exactly what you will do, seventy
          minutes of work with the phone in another room, and fifteen minutes checking and marking
          your work. A bad block looks like this: six hours at a desk, three hours of scrolling
          between them.
        </p>
        <blockquote>
          <p>
            Two honest blocks a day beat six hours of sitting. Nobody has ever been marked down for
            stopping while they were still concentrating.
          </p>
        </blockquote>

        <h2>Start with a version you cannot fail</h2>
        <p>
          The most common way a routine dies is that it was designed for your best day. Design it
          for your worst one. If you can only manage two focused sessions on your worst day, then
          two is your floor, and your plan should assume two. Add more when you have proved you can
          hold the floor.
        </p>
        <p>
          A plan you follow on a bad week still moves you forward. A plan you abandon on a bad week
          resets you to zero.
        </p>

        <h2>Give exam week a different routine</h2>
        <p>
          In the final week, your body does not want your normal schedule. You are tired, you are
          anxious, and your sleep is worse. Trying to force a routine designed for a calm fortnight
          onto a stressed week is how you end up revising nothing in the seven days that matter
          most.
        </p>
        <p>
          In exam week: keep the wake time, cut the volume roughly in half, and change what you
          review. No new material. Only your error log, the formulas you keep forgetting, and the
          questions you got wrong. Reviewing what you already know feels productive and is not; the
          time is better spent on the small number of things costing you marks.
        </p>

        <h2>Protect sleep like an exam subject</h2>
        <p>
          Sleep is when the day&rsquo;s revision is consolidated. Cutting it to gain two extra study
          hours is a bad trade: you lose the recall you were trying to build, and you are less
          alert during the next session. If you can only change one thing, make it a consistent
          bedtime a week before the exam, not a week of all-nighters.
        </p>
        <p>
          Movement helps too, and it is the part everyone skips. A twenty-minute walk, some
          stretching between blocks, or a short session of whatever sport you already play will
          do more for your next two hours of study than another hour of notes.
        </p>

        <h2>Review the routine, not just the syllabus</h2>
        <p>
          Once a week, spend fifteen minutes answering three questions: How many sessions did I
          complete? Which subject got the least time? What did I avoid? That last one is the
          important one. The topic you keep postponing is usually the topic you are most afraid of,
          and it is the one worth sitting with while you still have time to fix it.
        </p>
        <p>
          For the study method underneath the routine, read{' '}
          <Link href="/blog/how-to-study-smarter-for-jamb">
            how to study smarter for JAMB
          </Link>
          . And if you have not settled which subjects to give the most time,{' '}
          <Link href="/blog/choose-a-course-and-career-you-will-enjoy">
            choosing a course and career you will enjoy
          </Link>{' '}
          is a useful place to start, because your subject combination determines what you are even
          eligible for.
        </p>
      </ArticleBody>
    </MarketingArticle>
  )
}
