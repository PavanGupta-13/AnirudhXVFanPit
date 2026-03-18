import { useState, useEffect } from 'react'

// March 21, 2026 18:00:00 IST = UTC+5:30 → 12:30 UTC
const CONCERT_DATE = new Date('2026-03-21T12:30:00.000Z')

export interface CountdownValues {
  days: number
  hours: number
  minutes: number
  seconds: number
  isLive: boolean
  isEnded: boolean
  totalSecondsLeft: number
}

export function useCountdown(): CountdownValues {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const diff = CONCERT_DATE.getTime() - now.getTime()

  // Concert ends at 22:00 IST = 16:30 UTC
  const CONCERT_END = new Date('2026-03-21T16:30:00.000Z')
  const afterStart = now >= CONCERT_DATE
  const afterEnd = now >= CONCERT_END

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isLive: afterStart && !afterEnd,
      isEnded: afterEnd,
      totalSecondsLeft: 0,
    }
  }

  const totalSeconds = Math.floor(diff / 1000)
  const days    = Math.floor(totalSeconds / 86400)
  const hours   = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds, isLive: false, isEnded: false, totalSecondsLeft: totalSeconds }
}
