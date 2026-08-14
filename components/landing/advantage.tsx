export default function LandingAdvantage() {
  const cards = [
    {
      title: 'JAMB and Post-UTME Practice',
      body: 'The two exams that decide admission, in one place. Same timer, same format, same honest score.',
    },
    {
      title: 'University-specific Preparation',
      body: 'UNILORIN Post-UTME today, other universities after. Questions shaped by what past candidates actually sat.',
    },
    {
      title: 'Works on Any Phone',
      body: 'Text-first and light. A full mock exam uses little data, even on the networks students actually live on.',
    },
  ]

  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">Advantage</p>
          <h2 className="mt-4 text-4xl font-extrabold leading-[1.12] tracking-tight text-gray-900 sm:text-[44px]">
            Built for the way Nigerian students actually prepare
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-5">
          {cards.map((card, i) => (
            <div
              key={card.title}
              className={`rounded-2xl border border-gray-100 bg-gray-50/40 p-7 sm:p-9 ${i === 0 ? 'col-span-2 lg:col-span-1' : ''}`}
            >
              <h3 className="text-xl font-bold text-gray-900">{card.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-gray-600">{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}