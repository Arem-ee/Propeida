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

  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="mx-auto max-w-xs lg:mx-0">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                {featured.initials}
              </div>
              <p className="mt-6 text-base font-bold text-gray-900">{featured.name}</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">{featured.role}</p>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div aria-hidden="true" className="text-6xl font-serif leading-none text-blue-200">
              &ldquo;
            </div>
            <blockquote className="-mt-4 text-[19px] font-medium leading-[1.7] text-gray-800">
              {featured.quote}
            </blockquote>
          </div>
        </div>

        <div className="mt-14 flex flex-col justify-between gap-6 border-t border-gray-100 pt-8 sm:flex-row sm:items-center">
          <div className="sm:max-w-md">
            <p className="text-[15px] font-medium italic leading-relaxed text-gray-600">
              &ldquo;{secondary.quote}&rdquo;
            </p>
            <p className="mt-2 text-sm text-gray-500">
              <span className="font-bold text-gray-900">{secondary.name}</span>, {secondary.role}
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Trusted by <span className="font-bold text-gray-900">250+ Nigerian students</span> preparing for JAMB
            and Post-UTME.
          </p>
        </div>
      </div>
    </section>
  )
}