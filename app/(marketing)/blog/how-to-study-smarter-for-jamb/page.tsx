import type { Metadata } from 'next'
import Link from 'next/link'
import MarketingArticle, { ArticleBody } from '@/components/marketing-article'
import { getArticle } from '@/lib/blog'

const article = getArticle('how-to-study-smarter-for-jamb')!

export const metadata: Metadata = {
  title: 'How to study smarter for JAMB',
  alternates: { canonical: '/blog/how-to-study-smarter-for-jamb' },
  description: article.description,
  openGraph: {
    title: 'How to study smarter for JAMB',
    description: article.description,
    url: '/blog/how-to-study-smarter-for-jamb',
    type: 'article',
    publishedTime: article.publishedAt,
    images: [{ url: article.image, width: 900, height: 600, alt: article.imageAlt }],
  },
}

export default function HowToStudySmarterForJambPage() {
  return (
    <MarketingArticle article={article}>
      <ArticleBody>
        <p>
          Most students do not fail JAMB because they are not clever. They fail because the way
          they study produces a feeling of progress without producing any marks. You read a
          textbook, highlight it, watch a video that explains the same thing, and end the day
          convinced you have covered the topic. Then the exam asks you a question in a form you
          have never seen, under a clock, and the knowledge is simply not there.
        </p>
        <p>
          The good news is that nothing about that is fixed. Study method is a skill, and once you
          change the method, the same amount of hours starts producing a completely different
          result. Here is what actually works.
        </p>

        <h2>1. Replace rereading with active recall</h2>
        <p>
          Rereading feels productive because the material is right in front of you. It is also the
          single most wasteful use of study time, because the ease of reading is mistaken for
          learning. Every time you turn to a solved answer to check whether you got it right, you
          are trying to solve it under conditions far easier than the exam.
        </p>
        <p>Active recall is the opposite, and it is simple to set up:</p>
        <ul>
          <li>Finish reading a section and close the book.</li>
          <li>Write down everything you remember, from memory, on a blank page.</li>
          <li>Open the book and mark what you missed.</li>
          <li>Do not re-read the whole section. Only revisit the parts you failed to recall.</li>
        </ul>
        <p>
          That third step is where the learning happens. The gap between what you produced and what
          was there is your study list, and it is far more accurate than anything you would have
          chosen yourself.
        </p>
        <blockquote>
          <p>
            If you cannot explain a topic from memory, you have not learned it. You have only
            recognised it.
          </p>
        </blockquote>

        <h2>2. Practise in the format you will be examined in</h2>
        <p>
          JAMB is a Computer-Based Test. You get a fixed number of questions in a fixed amount of
          time, on a computer, with the pressure of a countdown. A student who knows the topic
          perfectly but has never answered questions on a screen under time pressure can still
          underperform badly.
        </p>
        <p>
          That is a skill, and skills are trained. Once a week, do a full timed paper in one
          sitting without pausing, without notes and without your phone. Write down the time you
          finished and which questions you did not get to. The goal is to build the habit of moving
          on when a question is hard, because in a real CBT you cannot come back to it until the
          next paper.
        </p>
        <p>
          Propeida runs these as timed mock sessions with the same question flow, so you get used
          to the pace rather than just the content. You can read more about how the{' '}
          <Link href="/unilorin-putme">Post-UTME format works</Link> and what the CBT environment
          is like before you meet it.
        </p>

        <h2>3. Space your sessions instead of cramming</h2>
        <p>
          Cramming feels productive because it is intense, and it is close to useless a week later.
          Spaced practice is less dramatic and far more effective. The same two hours of mathematics
          spread across five days will leave a better trace than twelve hours on a single Saturday
          night.
        </p>
        <p>A workable pattern:</p>
        <ul>
          <li>
            <strong>Day 1</strong> — learn the topic and solve worked examples with the book open.
          </li>
          <li>
            <strong>Day 2</strong> — same topic, book closed. Recall the method, then attempt the
            questions unaided.
          </li>
          <li>
            <strong>Day 4</strong> — mixed questions on that topic alongside other subjects, so
            retrieval is not cued by the order you studied in.
          </li>
          <li>
            <strong>Day 7</strong> — a short set of mixed questions covering the week.
          </li>
        </ul>
        <p>
          The rule of thumb: if a topic felt comfortable at the end of a session, that is usually
          the sign it needs another session, not that it is finished.
        </p>

        <h2>4. Interleave your subjects</h2>
        <p>
          Studying one subject until you are exhausted feels productive, but it trains you to
          remember the order things came in. On the exam, the questions arrive mixed. Interleaving
          — a session of mathematics, then English, then current affairs — trains the skill you
          actually need, which is recognising which method applies when nothing has been signposted.
        </p>

        <h2>5. Keep an error log</h2>
        <p>
          This is the highest-value habit on this list and the one most students skip. Every time
          you get a question wrong, write three things: the topic, the reason you got it wrong, and
          the correct method. The reasons are usually repetitive — arithmetic slip, misread the
          stem, confusing two similar concepts, or genuinely not understanding the topic.
        </p>
        <p>
          After a few weeks your log becomes a diagnosis. If most of your errors are carelessness,
          you need to slow down and read stems. If they cluster in one topic, that topic is where
          your remaining marks are. Propeida tracks this for you: every question you answer is
          recorded against its topic, so you can see the pattern without maintaining a spreadsheet.
        </p>

        <h2>6. Measure sessions completed, not hours studied</h2>
        <p>
          Hours are a bad measure because they reward sitting at a desk without retaining
          anything. What you can control and what actually matters is the number of focused
          sessions you complete. Track that instead, and set a number you can hit on your worst
          week as well as your best.
        </p>

        <h2>A realistic week</h2>
        <p>
          Six focused sessions of about 90 minutes each, spread across six days, will beat twelve
          hours of vague revision. One of those sessions should be a full timed paper. One should
          be reviewing your error log. The rest are topic work with the book closed for the second
          half.
        </p>
        <p>
          If you want a routine you can actually keep, read{' '}
          <Link href="/blog/build-a-calm-effective-exam-routine">
            how to build a calm, effective exam routine
          </Link>
          . And if you are still unsure which subjects to prioritise,{' '}
          <Link href="/blog/choose-a-course-and-career-you-will-enjoy">
            choosing a course and career you will enjoy
          </Link>{' '}
          explains how your subject combination shapes what is even open to you.
        </p>
      </ArticleBody>
    </MarketingArticle>
  )
}
