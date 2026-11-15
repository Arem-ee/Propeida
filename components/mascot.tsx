'use client'

import Image from 'next/image'

/**
 * Mascot: Propeida's sidekick that is literally alive.
 *
 * Not a static illustration pretending to be a character: every render
 * is two nested layers —
 *   outer  .mascot-pop   one-shot spring entrance (pops out at the right
 *                        moment, like Duolingo's owl entering)
 *   inner  .mascot-breathe / .mascot-bounce  endless squash-and-stretch
 *                        loop with origin at the base, so the baked
 *                        ground shadow stays planted and the body
 *                        "breathes" instead of just bobbing
 *   image  .mascot-live  hover/press reaction — interactive, not
 *                        decorative
 *
 * Assets are the real mascot art (public/mascot/, sourced from
 * `propeida mascot/`). Motion is CSS-only, reduced-motion safe.
 *
 * Expression map → moment map:
 *   - 'idle'       calm breathing presence (default)
 *   - 'welcome'    waving hello — onboarding greeting
 *   - 'celebrate'  party hat — big wins (onboarding done, session done)
 *   - 'proud'      cheeky grin — correct answers
 *   - 'streak'     on fire — answer streaks
 *   - 'encourage'  heart — supportive nudges, form steps
 *   - 'thinking'   lightbulb — pondering choices
 *   - 'confused'   question mark — help moments
 *   - 'worried'    sweating — gentle struggle acknowledgment
 *   - 'rest'       sleeping — end of day
 */
export type MascotExpression =
  | 'idle'
  | 'welcome'
  | 'celebrate'
  | 'proud'
  | 'streak'
  | 'encourage'
  | 'thinking'
  | 'confused'
  | 'worried'
  | 'rest'

interface MascotProps {
  expression?: MascotExpression
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  /** Re-trigger the entrance pop (e.g. when a new answer lands). */
  popKey?: number
  /** Override the expression's default ambient loop.
   *  'flicker' = quick flame dance, for the streak chip. */
  motion?: 'auto' | 'flicker' | 'none'
}

const ASSETS: Record<MascotExpression, string> = {
  idle: '/mascot/mascot-9.svg',
  welcome: '/mascot/mascot-0.svg',
  celebrate: '/mascot/mascot-5.svg',
  proud: '/mascot/mascot-8.svg',
  streak: '/mascot/mascot-2.svg',
  encourage: '/mascot/mascot-6.svg',
  thinking: '/mascot/mascot-4.svg',
  confused: '/mascot/mascot-11.svg',
  worried: '/mascot/mascot-3.svg',
  rest: '/mascot/mascot-7.svg',
}

/** Ambient loop per expression. Quiet poses stay calm. */
const AMBIENT: Record<MascotExpression, string> = {
  idle: 'mascot-breathe',
  welcome: 'mascot-breathe',
  celebrate: 'mascot-bounce',
  proud: 'mascot-breathe',
  streak: 'mascot-bounce',
  encourage: 'mascot-breathe',
  thinking: '',
  confused: '',
  worried: '',
  rest: 'mascot-breathe',
}

const WIDTH: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number> = {
  xs: 28,
  sm: 44,
  md: 72,
  lg: 120,
  xl: 168,
}

export function Mascot({ expression = 'idle', size = 'md', className, popKey, motion = 'auto' }: MascotProps) {
  const width = WIDTH[size]
  const ambient = motion === 'auto' ? AMBIENT[expression] : motion === 'flicker' ? 'flame-pulse' : ''
  return (
    <span
      key={popKey}
      className={`mascot-pop inline-block shrink-0 ${className ?? ''}`}
      role="img"
      aria-label="Propeida mascot"
    >
      <span
        className={`mascot-live relative inline-block overflow-hidden rounded-[26%] shadow-[0_2px_10px_-4px_rgba(16,28,51,0.25)] ${ambient}`}
        style={{ width, height: Math.round((width * 4) / 3) }}
      >
        <Image
          src={ASSETS[expression]}
          alt=""
          fill
          sizes={`${width}px`}
          className="object-cover"
        />
      </span>
    </span>
  )
}
