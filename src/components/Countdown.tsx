import React, { useRef } from 'react'
import { useCountdown } from '../hooks/useCountdown'

interface DigitBlockProps {
  value: number
  label: string
  isUnderHour: boolean
}

const DigitBlock: React.FC<DigitBlockProps> = ({ value, label, isUnderHour }) => {
  const display = String(value).padStart(2, '0')
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`glass-card flex items-center justify-center countdown-digit font-display font-extrabold text-4xl sm:text-5xl w-[72px] sm:w-24 h-[72px] sm:h-24 ${isUnderHour ? 'animate-pulse-neon' : ''}`}
        style={{
          background: 'rgba(15, 15, 40, 0.8)',
          border: '1px solid rgba(191, 0, 255, 0.3)',
          boxShadow: isUnderHour
            ? '0 0 25px rgba(191, 0, 255, 0.6), 0 0 50px rgba(0, 229, 255, 0.3)'
            : '0 0 15px rgba(191, 0, 255, 0.2)',
        }}
      >
        <span className="neon-text">{display}</span>
      </div>
      <span className="text-[10px] sm:text-xs font-display font-semibold text-white/50 uppercase tracking-widest">
        {label}
      </span>
    </div>
  )
}

interface Props {
  onOpenSetlist: () => void
  onOpenChat: () => void
}

const Countdown: React.FC<Props> = ({ onOpenSetlist, onOpenChat }) => {
  const { days, hours, minutes, seconds, isLive, isEnded, totalSecondsLeft } = useCountdown()
  const isUnderHour = !isLive && !isEnded && totalSecondsLeft < 3600
  const logoRef = useRef<HTMLDivElement>(null)

  const handleLogoPressStart = () => {
    const el = logoRef.current
    if (!el) return
    const timer = setTimeout(() => {
      el.classList.add('scale-110')
      // particle burst
      const burst = document.createElement('div')
      burst.style.cssText = `
        position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
        width:120px;height:120px;border-radius:50%;
        background:radial-gradient(circle,rgba(191,0,255,0.8),transparent 70%);
        pointer-events:none;z-index:9999;
        animation:ripple 1s ease-out forwards;
      `
      document.body.appendChild(burst)
      setTimeout(() => { burst.remove(); el.classList.remove('scale-110') }, 1000)
    }, 600)
    el.dataset.timer = String(timer)
  }

  const handleLogoPressEnd = () => {
    clearTimeout(Number(logoRef.current?.dataset.timer))
  }

  if (isLive) {
    return (
      <div className="text-center py-8 px-4 animate-fade-in">
        <div
          className="inline-flex items-center gap-3 px-6 py-3 rounded-full font-display font-extrabold text-xl sm:text-2xl mb-4 live-badge"
        >
          <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
          LIVE NOW
          <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
        </div>
        <p className="text-2xl sm:text-3xl font-display font-bold text-white mt-2">
          Gachibowli is Lit 🔥
        </p>
        <p className="text-white/60 mt-2 font-body">The concert is live — enjoy every beat!</p>
      </div>
    )
  }

  if (isEnded) {
    return (
      <div className="text-center py-8 px-4 animate-fade-in">
        <p className="text-3xl font-display font-extrabold neon-text">That was LEGENDARY 🌟</p>
        <p className="text-white/60 mt-2">Thank you for 15 amazing years, Anirudh!</p>
      </div>
    )
  }

  return (
    <div className="animate-slide-up">
      {/* Countdown digits */}
      <div className="flex justify-center items-end gap-3 sm:gap-4 mb-6">
        <DigitBlock value={days}    label="Days"    isUnderHour={isUnderHour} />
        <div className="text-3xl font-display font-bold neon-text mb-8 opacity-70">:</div>
        <DigitBlock value={hours}   label="Hours"   isUnderHour={isUnderHour} />
        <div className="text-3xl font-display font-bold neon-text mb-8 opacity-70">:</div>
        <DigitBlock value={minutes} label="Minutes" isUnderHour={isUnderHour} />
        <div className="text-3xl font-display font-bold neon-text mb-8 opacity-70">:</div>
        <DigitBlock value={seconds} label="Seconds" isUnderHour={isUnderHour} />
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center px-4">
        <button
          onClick={onOpenSetlist}
          className="btn-primary text-white font-display font-bold py-3.5 px-8 text-sm sm:text-base"
        >
          🎵 Open Setlist Tracker
        </button>
        <button
          onClick={onOpenChat}
          className="btn-neon text-white font-display font-bold py-3.5 px-8 text-sm sm:text-base"
        >
          💬 Join Fan Chat
        </button>
      </div>

      {/* Easter egg: long press logo above */}
      <div
        ref={logoRef}
        className="mt-8 text-center transition-transform duration-200 cursor-pointer select-none"
        onMouseDown={handleLogoPressStart}
        onMouseUp={handleLogoPressEnd}
        onTouchStart={handleLogoPressStart}
        onTouchEnd={handleLogoPressEnd}
        title="Long press for a surprise!"
      >
        <span className="text-xs text-white/20 font-mono">long press ↑ logo for surprise</span>
      </div>
    </div>
  )
}

export default Countdown
