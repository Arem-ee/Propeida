'use client'

import { WinToast } from './win-toast'
import { useWins } from './use-wins'

export { useWins }

/**
 * WinToastList: renders the stack of active win toasts.
 * Place once in app-shell or layout so any page can dispatch wins.
 */
export function WinToastList() {
  const { wins, remove } = useWins()

  return (
    <div className="fixed top-6 right-6 z-[70] flex flex-col gap-2 pointer-events-none sm:top-8 sm:right-8 lg:top-10 lg:right-10">
      {wins.map((win) => (
        <WinToast key={win.id} win={win} onRemove={remove} />
      ))}
    </div>
  )
}
