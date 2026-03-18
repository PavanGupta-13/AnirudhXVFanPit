import React, { useMemo } from 'react'

interface Props {
  messageCount: number
  playedCount: number
  totalSongs: number
}

const VIBE_LABELS = ['Warming Up 🎸', 'Getting Hyped 🔊', 'Concert Mode 🎵', 'Absolute Fire 🔥', 'LEGENDARY ⚡']

const VibeMeter: React.FC<Props> = ({ messageCount, playedCount, totalSongs }) => {
  const pct = useMemo(() => {
    const msgScore  = Math.min(messageCount / 200, 1) * 60
    const songScore = totalSongs > 0 ? (playedCount / totalSongs) * 40 : 0
    return Math.min(msgScore + songScore, 100)
  }, [messageCount, playedCount, totalSongs])

  const label = VIBE_LABELS[Math.min(Math.floor(pct / 20), 4)]

  return (
    <div className="glass-card px-4 py-3 mx-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-display font-semibold text-white/60 uppercase tracking-widest">
          Vibe Meter
        </span>
        <span className="text-xs font-display font-bold neon-text">{label}</span>
      </div>
      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="vibe-bar-fill h-full rounded-full"
          style={{ width: `${pct}%` }}
        />
        {/* Glow overlay */}
        <div
          className="absolute top-0 left-0 h-full rounded-full pointer-events-none"
          style={{
            width: `${pct}%`,
            boxShadow: '0 0 8px rgba(191, 0, 255, 0.8), 0 0 16px rgba(0, 229, 255, 0.4)',
            transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-white/30">{Math.round(pct)}% vibes</span>
        <span className="text-xs text-white/30">{playedCount}/{totalSongs} songs</span>
      </div>
    </div>
  )
}

export default VibeMeter
