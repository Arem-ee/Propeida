import { Play, Clipboard, Award, Compass, Sparkles, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function MarketingFeatures() {
  return (
    <section id="features" className="border-t border-gray-100 bg-gray-50/30 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Features built for direct score outcomes
          </h2>
          <p className="mt-4 text-lg text-gray-500 leading-relaxed">
            No endless video lectures. No heavy textbooks. PrepIQ gives you direct practical tools to identify weak spots, master pacing, and walk into your exam halls with complete clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2 rounded-xl border border-gray-100 bg-white p-6 sm:p-8 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 mb-6">
                <Sparkles className="h-4 w-4" />
                The Core Platform
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-4">
                Full CBT Mock Exam Simulator
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xl mb-6">
                Simulate the exact conditions of JAMB, Post-UTME, and WAEC computer-based tests. The timer, question navigation, subject combinations, and instant scoring engine operate exactly like the official systems.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="text-sm font-semibold text-gray-700">Custom subject combinations (e.g. Eng, Phy, Chem, Bio)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="text-sm font-semibold text-gray-700">Official JAMB/Post-UTME timing algorithms</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="text-sm font-semibold text-gray-700">Instant grade scoring with standard syllabus weighting</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="text-sm font-semibold text-gray-700">Complete offline functionality on low-data connections</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold">
                    <Play className="h-4 w-4 fill-current" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">Ready to start a simulation?</div>
                    <div className="text-xs text-gray-400">Launch a full-length CBT mock in under 10 seconds.</div>
                  </div>
                </div>
                <Link
                  href="/signup"
                  className="text-sm font-bold text-blue-600 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-3xs text-center min-h-[44px] flex items-center justify-center"
                >
                  1 Free Mock Available
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 sm:p-8 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-6">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Topic-by-Topic Drill</h3>
              <p className="text-gray-500 text-xs leading-relaxed mb-6">
                Struggling specifically with &ldquo;Organic Chemistry&rdquo; or &ldquo;Mechanics&rdquo;? Filter questions by specific syllabus topics and master them one by one.
              </p>
            </div>
            <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400">Standard Card Size</span>
              <span className="text-xs font-semibold text-blue-600">60+ syllabus topics</span>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 sm:p-8 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-6">
                <Clipboard className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Syllabus Explanations</h3>
              <p className="text-gray-500 text-xs leading-relaxed mb-6">
                Every practice question has a clear, textbook-quality breakdown explaining why the correct answer is right and how other options are calculated.
              </p>
            </div>
            <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400">Standard Card Size</span>
              <span className="text-xs font-semibold text-blue-600">100% explained</span>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 sm:p-8 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-6">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Performance Insight</h3>
              <p className="text-gray-500 text-xs leading-relaxed mb-6">
                Review precise statistics on your answering accuracy, average speed per question, and overall curriculum coverage percentage.
              </p>
            </div>
            <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400">Standard Card Size</span>
              <span className="text-xs font-semibold text-blue-600">Updated instantly</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
