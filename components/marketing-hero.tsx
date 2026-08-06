'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle, AlertCircle, ArrowRight, MessageCircle } from 'lucide-react'
import { siteConfig } from '@/lib/site-config'
import { track } from '@/lib/analytics'

export default function MarketingHero() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isChecked, setIsChecked] = useState(false)

  const options = [
    { key: 'A', text: 'Convinced' },
    { key: 'B', text: 'Doubtful' },
    { key: 'C', text: 'Angry' },
    { key: 'D', text: 'Excited' },
  ]

  const handleCheck = () => {
    if (selectedOption) {
      setIsChecked(true)
    }
  }

  const handleReset = () => {
    setSelectedOption(null)
    setIsChecked(false)
  }

  return (
    <section id="hero" className="relative overflow-hidden bg-white pt-12 pb-20 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6 flex flex-col items-start">
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-600">
              Free exam preparation for every Nigerian candidate
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl leading-tight">
              Every Nigerian candidate deserves a real chance.
            </h1>

            <p className="mt-6 text-lg text-gray-500 leading-relaxed max-w-lg">
              Nearly a thousand verified questions. A real CBT simulator. Free for students — funded by schools,
              foundations, and sponsors who believe preparation shouldn&apos;t be a privilege. Start with UNILORIN
              Post-UTME today. JAMB is next.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
              <Link
                href="/signup"
                onClick={() => void track('hero-cta-click', { cta: 'signup' })}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-base font-bold text-white transition-colors hover:bg-blue-700 active:bg-blue-800 shadow-sm min-h-[44px]"
              >
                Start Practicing Free
                <ArrowRight className="h-5 w-5" />
              </Link>

              <Link
                href="/partner"
                onClick={() => void track('hero-cta-click', { cta: 'partner' })}
                className="inline-flex w-full sm:w-auto items-center justify-center text-sm font-bold text-blue-600 hover:text-blue-700 active:text-blue-800 transition-colors py-3 px-4 min-h-[44px]"
              >
                Partner with Propeida
              </Link>
            </div>

            <a
              href={siteConfig.whatsapp.channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => void track('whatsapp-click', { via: 'hero' })}
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-green-600 hover:text-green-700 active:text-green-800 min-h-[44px]"
            >
              <MessageCircle className="h-4 w-4" />
              {siteConfig.whatsapp.channelCopy}
            </a>

            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
              <span>Free for students — no paywall, no card required</span>
              <span>•</span>
              <span>Every question checked by a person</span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-xl border border-gray-100 bg-gray-50/50 p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400"></span>
                  <span className="h-3 w-3 rounded-full bg-yellow-400"></span>
                  <span className="h-3 w-3 rounded-full bg-green-400"></span>
                </div>
                <div className="rounded-xl bg-white px-3 py-1 text-xs font-semibold text-gray-500 border border-gray-100 shadow-2xs">
                  Practice Mode — Untimed
                </div>
                <div className="w-8"></div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-400">
                  <span>Question 4 of 40</span>
                  <span className="text-blue-600">English</span>
                </div>

                <p className="mt-4 text-base font-bold text-gray-900 leading-snug">
                  Choose the option nearest in meaning to the capitalized word:
                </p>

                <p className="mt-2 text-base text-gray-700">
                  The examination committee was quite <strong className="text-gray-900 underline decoration-blue-600 decoration-2">SKEPTICAL</strong> about the candidate&apos;s explanation.
                </p>

                <div className="mt-6 space-y-3">
                  {options.map((option) => {
                    const isSelected = selectedOption === option.key
                    const isCorrect = option.key === 'B'
                    let optionStyle = 'border-gray-200 bg-white hover:border-gray-300'

                    if (isSelected) {
                      if (isChecked) {
                        optionStyle = isCorrect
                          ? 'border-green-600 bg-green-50/30'
                          : 'border-red-600 bg-red-50/30'
                      } else {
                        optionStyle = 'border-blue-600 bg-blue-50/20'
                      }
                    }

                    return (
                      <button
                        key={option.key}
                        onClick={() => !isChecked && setSelectedOption(option.key)}
                        disabled={isChecked}
                        className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${optionStyle} min-h-[44px] cursor-pointer`}
                      >
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-xl text-xs font-bold border transition-colors ${
                          isSelected
                            ? isChecked
                              ? isCorrect
                                ? 'bg-green-600 border-green-600 text-white'
                                : 'bg-red-600 border-red-600 text-white'
                              : 'bg-blue-600 border-blue-600 text-white'
                            : 'border-gray-300 text-gray-500 bg-white'
                        }`}>
                          {option.key}
                        </span>
                        <span className="text-sm font-semibold text-gray-800">{option.text}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-100">
                  {isChecked ? (
                    <div className="flex items-center gap-2">
                      {selectedOption === 'B' ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-green-700">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Correct answer
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-red-700">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          Incorrect
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-10"></div>
                  )}

                  <div className="flex gap-2">
                    {isChecked ? (
                      <button
                        onClick={handleReset}
                        className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 min-h-[44px] cursor-pointer"
                      >
                        Try Again
                      </button>
                    ) : (
                      <button
                        onClick={handleCheck}
                        disabled={!selectedOption}
                        className={`rounded-xl px-5 py-2 text-xs font-bold text-white transition-colors min-h-[44px] cursor-pointer ${
                          selectedOption
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-gray-300 cursor-not-allowed'
                        }`}
                      >
                        Check Answer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}