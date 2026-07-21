'use client'

import { useState, useEffect, useRef } from 'react'
import { Timer as TimerIcon } from 'lucide-react'

interface TimerProps {
  startedAt: string
  timeLimitSeconds: number
  onExpire: () => void
}

export default function Timer({ startedAt, timeLimitSeconds, onExpire }: TimerProps) {
  const [display, setDisplay] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(timeLimitSeconds)
  const expiredRef = useRef(false)

  useEffect(() => {
    const computeRemaining = () => {
      const deadline = new Date(new Date(startedAt).getTime() + timeLimitSeconds * 1000)
      const now = new Date()
      const diff = deadline.getTime() - now.getTime()

      if (diff <= 0) {
        setDisplay('00:00')
        setSecondsLeft(0)
        if (!expiredRef.current) {
          expiredRef.current = true
          onExpire()
        }
        return true
      }

      const remaining = Math.ceil(diff / 1000)
      const minutes = Math.floor(remaining / 60)
      const seconds = remaining % 60
      setDisplay(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`)
      setSecondsLeft(remaining)
      return false
    }

    computeRemaining()
    const interval = setInterval(computeRemaining, 1000)

    return () => clearInterval(interval)
  }, [startedAt, timeLimitSeconds, onExpire])

  const isLow = secondsLeft <= 300

  return (
    <div className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold min-h-[44px] ${
      isLow ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
    }`}>
      <TimerIcon className={`h-4 w-4 ${isLow ? 'text-red-500' : 'text-blue-500'}`} />
      {display}
    </div>
  )
}
