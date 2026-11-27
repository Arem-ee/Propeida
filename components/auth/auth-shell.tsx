import Link from 'next/link'
import { Check } from 'lucide-react'
import Logo from '@/components/logo'
import { Mascot, type MascotExpression } from '@/components/mascot'
import { SpeechBubble } from '@/components/celebrations/speech-bubble'

type AuthMode = 'login' | 'signup' | 'recover'

const COPY: Record<
  AuthMode,
  {
    headline: string
    lead: string
    mascot: MascotExpression
    mascotLine: string
    mobileLine: string
    points: string[]
    note: string
  }
> = {
  signup: {
    headline: 'You bring the effort, and I will bring the plan',
    lead: 'You start with JAMB, and you can add another exam when you are ready',
    mascot: 'welcome',
    mascotLine: 'I will keep this simple, so you can focus on one question at a time',
    mobileLine: 'I will keep this simple, so you can focus',
    points: [
      'You practise with the same timing you will meet in the hall',
      'You see why each answer works, not just whether it is right',
    ],
    note: 'You can change your exam later in settings',
  },
  login: {
    headline: "You came back, so let's keep the momentum",
    lead: 'Your lessons, practice sets, and progress are waiting where you left them',
    mascot: 'proud',
    mascotLine: 'I kept your progress safe, so you can continue from where you stopped',
    mobileLine: 'I kept your progress safe',
    points: [
      'You can pick up the same lesson you were on',
      'You can see what improved since your last session',
    ],
    note: 'Your progress is saved to your account',
  },
  recover: {
    headline: 'Getting back in takes one short link',
    lead: 'We will send you a link so you can choose a new password and carry on',
    mascot: 'encourage',
    mascotLine: 'I will help you get back to your lessons, one step at a time',
    mobileLine: 'I will help you get back in',
    points: [
      'The link works once, so use it soon after it arrives',
      'Your lessons and progress stay exactly where you left them',
    ],
    note: 'You can close this page after you send the link',
  },
}

export default function AuthShell({
  mode,
  children,
}: {
  mode: AuthMode
  children: React.ReactNode
}) {
  const copy = COPY[mode]

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-paper">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-100/60 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-amber-100/50 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-white/70 blur-3xl" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center px-4 py-5 sm:px-6">
        <Link href="/" className="flex min-h-[44px] items-center" aria-label="Propeida home">
          <Logo />
        </Link>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 items-center gap-8 px-4 pb-12 pt-2 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-16 lg:pt-8">
        <section className="hidden min-w-0 lg:flex lg:flex-col lg:justify-center">
          <p className="max-w-lg font-display text-4xl font-semibold leading-[1.12] tracking-tight text-ink">
            {copy.headline}
          </p>
          <p className="mt-4 max-w-md text-base leading-relaxed text-ink-soft">{copy.lead}</p>

          <div className="relative mt-9 flex items-start gap-4">
            <div
              aria-hidden="true"
              className="absolute -left-6 top-4 h-40 w-40 rounded-full bg-blue-100/70 blur-2xl"
            />
            <Mascot expression={copy.mascot} size="xl" className="relative" priority />
            <SpeechBubble text={copy.mascotLine} className="relative mt-1" />
          </div>

          <ul className="mt-9 space-y-3">
            {copy.points.map((point) => (
              <li key={point} className="flex items-start gap-2 text-sm font-semibold text-ink-soft">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>

          <p className="mt-6 text-xs font-semibold text-gray-500">{copy.note}</p>
        </section>

        <section className="mx-auto w-full min-w-0 max-w-md">
          <div className="mb-5 flex items-center gap-3 lg:hidden">
            <Mascot expression={copy.mascot} size="sm" />
            <SpeechBubble text={copy.mobileLine} />
          </div>

          <div className="rounded-3xl border border-blue-100/80 bg-white/95 p-6 shadow-[0_30px_70px_-40px_rgba(37,99,235,0.45)] backdrop-blur sm:p-8">
            {children}
          </div>

          <p className="mt-5 text-center text-xs font-semibold text-gray-500 lg:hidden">{copy.note}</p>
        </section>
      </main>
    </div>
  )
}
