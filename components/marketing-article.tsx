import Link from 'next/link'
import { ArrowRight, CalendarDays, Clock } from 'lucide-react'
import MarketingHeader from '@/components/marketing-header'
import MarketingFooter from '@/components/marketing-footer'
import { articles, getRelatedArticles, type Article } from '@/lib/blog'

export function ArticleBody({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mt-8 space-y-5 text-base leading-relaxed text-gray-500
        [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:tracking-tight [&_h2]:text-gray-900
        [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-gray-900
        [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5
        [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5
        [&_li]:marker:text-gray-300
        [&_strong]:font-bold [&_strong]:text-gray-900
        [&_a]:font-semibold [&_a]:text-blue-600 [&_a]:underline [&_a]:decoration-blue-200 [&_a]:underline-offset-2 hover:[&_a]:decoration-blue-600
        [&_blockquote]:mt-6 [&_blockquote]:rounded-r-lg [&_blockquote]:border-l-4 [&_blockquote]:border-blue-200 [&_blockquote]:bg-blue-50/40 [&_blockquote]:px-4 [&_blockquote]:py-3"
    >
      {children}
    </div>
  )
}

export default function MarketingArticle({
  article,
  children,
}: {
  article: Article
  children: React.ReactNode
}) {
  const related = getRelatedArticles(article.slug)

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      <MarketingHeader />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:py-20">
        <nav aria-label="Breadcrumb" className="text-sm text-gray-400">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="font-semibold text-gray-500 hover:text-blue-600">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/blog" className="font-semibold text-gray-500 hover:text-blue-600">
                Guides
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-gray-400">{article.title}</li>
          </ol>
        </nav>

        <article>
          <header className="mt-6">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {article.title}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-gray-500">{article.excerpt}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-400">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                <time dateTime={article.publishedAt}>{article.publishedLabel}</time>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {article.readingTime}
              </span>
            </div>
          </header>

          <figure className="mt-8 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
            <img
              src={article.image}
              alt={article.imageAlt}
              width={900}
              height={600}
              className="h-auto w-full"
            />
          </figure>

          {children}
        </article>

        <section className="mt-14 rounded-2xl border border-gray-100 bg-gray-50/60 p-6 sm:p-8">
          <h2 className="text-lg font-extrabold text-gray-900">
            Put the advice into practice
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Propeida gives you real past questions in a timed Computer-Based Test environment, with
            instant feedback and a record of every question you have gotten wrong. Start free, and
            practise the way you will be examined.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Start practising free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/practice"
              className="inline-flex min-h-[44px] items-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-white"
            >
              See the practice modes
            </Link>
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-gray-900">
              Keep reading
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/blog/${item.slug}`}
                  className="group rounded-2xl border border-gray-100 p-5 transition-colors hover:border-blue-200 hover:bg-blue-50/30"
                >
                  <span className="block text-sm font-bold text-gray-900 group-hover:text-blue-600">
                    {item.title}
                  </span>
                  <span className="mt-2 block text-sm leading-relaxed text-gray-500">
                    {item.excerpt}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <p className="mt-12 text-xs leading-relaxed text-gray-400">
          Propeida provides practice and preparation material. We are not affiliated with JAMB,
          WAEC, NECO or any university, and nothing on this page is a promise of an admission
          outcome. The content here is general study guidance, not official examination
          instruction.
        </p>
      </main>
      <MarketingFooter />
    </div>
  )
}

export function ArticleIndex() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      <MarketingHeader />
      <main className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
        <nav aria-label="Breadcrumb" className="text-sm text-gray-400">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="font-semibold text-gray-500 hover:text-blue-600">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-gray-400">Guides</li>
          </ol>
        </nav>

        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Guides for Nigerian students
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-500">
          Practical writing on studying, exam routines and choosing a course. Written for students
          preparing for JAMB and Post-UTME.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 transition-colors hover:border-blue-200"
            >
              <div className="aspect-[3/2] w-full overflow-hidden bg-gray-50">
                <img
                  src={article.image}
                  alt={article.imageAlt}
                  width={900}
                  height={600}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-6">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {article.readingTime}
                </span>
                <h2 className="text-lg font-extrabold tracking-tight text-gray-900 group-hover:text-blue-600">
                  {article.title}
                </h2>
                <p className="text-sm leading-relaxed text-gray-500">{article.excerpt}</p>
                <span className="mt-auto pt-2 text-sm font-bold text-blue-600">
                  Read the guide
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <MarketingFooter />
    </div>
  )
}
