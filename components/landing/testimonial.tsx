'use client'

import { useEffect, useRef, useState } from 'react'

const TESTIMONIALS = {
  featured: {
    name: 'Jeremiah Magus',
    role: 'UNILORIN aspirant',
    quote:
      'The repeated practice helped me remember what I had studied, and it made me feel more prepared before the UNILORIN Post-UTME.',
    initials: 'JM',
  },
  secondary: {
    name: 'Inene',
    role: 'UNILORIN aspirant',
    quote: 'It did help me prepare.',
  },
}

export default function LandingTestimonial() {
  const featured = TESTIMONIALS.featured
  const secondary = TESTIMONIALS.secondary
  const quoteRef = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = quoteRef.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="bg-white py-28 sm:py-40">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
            {featured.initials}
          </div>
          <p className="mt-6 text-[15px] font-semibold text-gray-900">{featured.name}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-gray-500">{featured.role}</p>
        </div>

        <div
          ref={quoteRef}
          className={`mt-16 text-center transition-all duration-700 ease-out ${
            shown ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
          }`}
        >
          <div aria-hidden="true" className="font-serif text-6xl leading-none text-blue-200">
            &ldquo;
          </div>
          <blockquote className="mx-auto -mt-3 max-w-3xl font-serif text-[24px] font-medium leading-[1.5] tracking-tight text-gray-900 sm:text-[28px]">
            {featured.quote}
          </blockquote>
        </div>

        <div className="mt-20 flex flex-col justify-between gap-6 border-t border-gray-100 pt-8 sm:flex-row sm:items-center">
          <div className="text-left sm:max-w-md">
            <p className="text-[14px] font-medium italic leading-relaxed text-gray-600">
              &ldquo;{secondary.quote}&rdquo;
            </p>
            <p className="mt-2 text-[13px] text-gray-500">
              <span className="font-semibold text-gray-900">{secondary.name}</span>, {secondary.role}
            </p>
          </div>
          <p className="text-[13px] text-gray-500">
            Trusted by <span className="font-semibold text-gray-900">250+ Nigerian students</span> preparing for
            JAMB and Post-UTME.
          </p>
        </div>
      </div>
    </section>
  )
}